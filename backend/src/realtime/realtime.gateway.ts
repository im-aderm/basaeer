import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from './realtime.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? (process.env.CORS_ALLOWED_ORIGINS?.split(',') ||
          [process.env.FRONTEND_URL].filter(Boolean))
        : ['http://localhost:3000', ...(process.env.CORS_ALLOWED_ORIGINS?.split(',') || []), process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
  },
  namespace: 'realtime',
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private realtimeService: RealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtimeService.setServer(server);
    this.logger.log('Realtime Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1] ||
        client.handshake.query?.token;

      if (!token) {
        this.logger.warn(`Connection attempt without token: ${client.id}`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token as string);
      const userId = payload.sub;
      const branchId = payload.branchId;

      if (!userId) {
        this.logger.warn(`Invalid token payload: ${client.id}`);
        client.disconnect();
        return;
      }

      // Join rooms
      client.join(`user:${userId}`);
      if (branchId) {
        client.join(`branch:${branchId}`);
      }

      // Log connection to database
      await this.prisma.realtimeConnection.create({
        data: {
          userId,
          socketId: client.id,
          branchId,
          deviceInfo: client.handshake.headers['user-agent'],
        },
      });

      this.logger.log(`Client connected: ${client.id}, User: ${userId}`);
    } catch (error) {
      this.logger.error(`WebSocket connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      await this.prisma.realtimeConnection.deleteMany({
        where: { socketId: client.id },
      });
      this.logger.log(`Client disconnected: ${client.id}`);
    } catch (error) {
      this.logger.error(`WebSocket disconnect error: ${error.message}`);
    }
  }
}
