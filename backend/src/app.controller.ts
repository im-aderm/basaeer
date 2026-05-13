import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from './prisma/prisma.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Health' })
  @Get('health')
  async getHealth() {
    let dbStatus = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
      },
    };
  }

  // Serve uploaded admission documents
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Uploaded File Direct' })
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

  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Uploaded File' })
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
