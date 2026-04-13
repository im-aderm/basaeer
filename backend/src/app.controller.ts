import { Controller, Get, Post, Body, Res, Param, NotFoundException } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('newsletter/subscribe')
  subscribeToNewsletter(@Body() body: { email: string }) {
    // Mock backend logic for now until DB model is requested
    console.log(`[Newsletter] New subscription: ${body.email}`);
    return { success: true, message: 'Successfully subscribed to newsletter' };
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  // Serve uploaded admission documents
  @Get('public/uploads/admissions/:filename')
  getUploadedFileDirect(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const basePath = path.join(process.cwd(), 'public', 'uploads', 'admissions');
    const filePath = path.join(basePath, filename);
    return this.serveFile(filePath, basePath, res);
  }

  @Get('public/uploads/admissions/:subfolder/:filename')
  getUploadedFile(
    @Param('subfolder') _subfolder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const basePath = path.join(process.cwd(), 'public', 'uploads', 'admissions');
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
