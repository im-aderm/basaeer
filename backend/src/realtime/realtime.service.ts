import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class RealtimeService {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  sendToUser(userId: string, event: string, payload: any) {
    if (this.server) {
      this.server.to(`user:${userId}`).emit(event, payload);
    }
  }

  sendToBranch(branchId: string, event: string, payload: any) {
    if (this.server) {
      this.server.to(`branch:${branchId}`).emit(event, payload);
    }
  }

  sendToAll(event: string, payload: any) {
    if (this.server) {
      this.server.emit(event, payload);
    }
  }
}
