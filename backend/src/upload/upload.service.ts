import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicDomain: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );

    this.bucketName =
      this.configService.get<string>('R2_BUCKET_NAME') || 'basaer-uploads';
    this.publicDomain =
      this.configService.get<string>('R2_PUBLIC_DOMAIN') || '';

    // Initialize the S3 client configured for Cloudflare R2
    if (accountId && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log('Cloudflare R2 S3 Client initialized.');
    } else {
      this.logger.warn(
        'Cloudflare R2 configuration missing. Uploads will fail in production.',
      );
    }
  }

  /**
   * Uploads a file to Cloudflare R2.
   * @param file The file from multer
   * @param subFolder Optional folder inside the bucket
   * @returns Public URL or Signed URL of the uploaded file
   */
  async saveFile(
    file: Express.Multer.File,
    subFolder?: string,
  ): Promise<string> {
    if (!this.s3Client) {
      throw new BadRequestException('Storage service is not configured');
    }

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Strict MIME type check
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    // Validate file size
    const maxMb = this.configService.get<number>('MAX_FILE_SIZE_MB') || 5;
    const maxSize = maxMb * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds ${maxMb}MB limit`);
    }

    // Sanitize subFolder to prevent directory traversal
    const safeSubFolder = subFolder
      ? subFolder.replace(/[^a-zA-Z0-9_-]/g, '')
      : '';

    // Generate secure unique filename
    const ext = this.getFileExtension(file.mimetype, file.originalname);
    const randomStr = crypto.randomBytes(8).toString('hex');
    const filename = `${Date.now()}_${randomStr}${ext}`;

    // Construct the Key for R2
    const key = safeSubFolder ? `${safeSubFolder}/${filename}` : filename;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // Return the public URL if configured, otherwise we fallback to returning just the key
      // If a public domain is configured in Cloudflare (e.g. cdn.domain.com)
      if (this.publicDomain) {
        return `${this.publicDomain.replace(/\/$/, '')}/${key}`;
      }

      // If no public domain, return the key. The client can request a signed URL later.
      return key;
    } catch (error) {
      this.logger.error(
        `Failed to upload file to R2: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('File upload failed');
    }
  }

  /**
   * Deletes a file from Cloudflare R2
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.s3Client) return;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(
        `Failed to delete file from R2: ${error.message}`,
        error.stack,
      );
    }
  }

  private getFileExtension(mimeType: string, originalName: string): string {
    const ext = path.extname(originalName);
    if (ext) return ext.toLowerCase();

    switch (mimeType) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      case 'application/pdf':
        return '.pdf';
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return '.xlsx';
      case 'application/msword':
        return '.doc';
      default:
        return '.bin';
    }
  }
}
