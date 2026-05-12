import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from './prisma/prisma.service';
import Redis from 'ioredis';

@Controller()
export class AppController {
  private redis: Redis;

  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 1,
    });
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('newsletter/subscribe')
  subscribeToNewsletter(@Body() body: { email: string }) {
    console.log(`[Newsletter] New subscription: ${body.email}`);
    return { success: true, message: 'Successfully subscribed to newsletter' };
  }

  @Get('health')
  async getHealth() {
    let dbStatus = 'ok';
    let redisStatus = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'error';
    }

    try {
      await this.redis.ping();
    } catch (e) {
      redisStatus = 'error';
    }

    return {
      status: dbStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    };
  }

  // Serve uploaded admission documents
  @Get('public/uploads/admissions/:filename')
  getUploadedFileDirect(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const basePath = path.join(
      process.cwd(),
      'public',
      'uploads',
      'admissions',
    );
    const filePath = path.join(basePath, filename);
    return this.serveFile(filePath, basePath, res);
  }

  @Get('public/uploads/admissions/:subfolder/:filename')
  getUploadedFile(
    @Param('subfolder') _subfolder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const basePath = path.join(
      process.cwd(),
      'public',
      'uploads',
      'admissions',
    );
    const filePath = path.join(basePath, _subfolder, filename);
    return this.serveFile(filePath, basePath, res);
  }

  private serveFile(filePath: string, basePath: string, res: Response) {
    // Security: prevent path traversal
    const resolvedPath = path.resolve(filePath);
    const resolvedBase = path.resolve(basePath);
    if (!resolvedPath.startsWith(resolvedBase)) {
      throw new NotFoundException('File not found');
    }

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const ext = path.extname(path.basename(filePath)).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(filePath);
  }
}
