import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(process.cwd(), 'public', 'uploads', 'admissions');

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, subFolder?: string): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Strict MIME type check
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP images and PDF files are allowed');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds 5MB limit`);
    }

    // Sanitize subFolder to prevent directory traversal
    const safeSubFolder = subFolder ? subFolder.replace(/[^a-zA-Z0-9_-]/g, '') : '';
    const targetDir = safeSubFolder
      ? path.join(this.uploadDir, safeSubFolder)
      : this.uploadDir;

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Generate secure unique filename
    const ext = this.getFileExtension(file.mimetype);
    const randomStr = crypto.randomBytes(8).toString('hex');
    const filename = `${Date.now()}_${randomStr}${ext}`;
    const filepath = path.join(targetDir, filename);

    // Write file to disk
    fs.writeFileSync(filepath, file.buffer);

    // Return the public URL
    const publicPath = safeSubFolder
      ? `/public/uploads/admissions/${safeSubFolder}/${filename}`
      : `/public/uploads/admissions/${filename}`;

    return publicPath;
  }

  private getFileExtension(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      case 'application/pdf':
        return '.pdf';
      default:
        return '.jpg';
    }
  }
}
