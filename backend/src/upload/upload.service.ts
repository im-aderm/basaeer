import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

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

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP images and PDF files are allowed');
    }

    // Create subfolder if provided
    const targetDir = subFolder
      ? path.join(this.uploadDir, subFolder)
      : this.uploadDir;

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Generate unique filename
    const ext = this.getFileExtension(file.mimetype);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}_${randomStr}${ext}`;
    const filepath = path.join(targetDir, filename);

    // Write file to disk
    fs.writeFileSync(filepath, file.buffer);

    // Return the public URL
    const publicPath = subFolder
      ? `/public/uploads/admissions/${subFolder}/${filename}`
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
