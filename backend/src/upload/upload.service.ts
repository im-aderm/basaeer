import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fsp from 'fs/promises';
import { fileTypeFromBuffer } from 'file-type';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicDomain: string;
  private readonly fallbackDir: string;

  constructor(private configService: ConfigService) {
    this.fallbackDir = path.resolve(__dirname, '../../public/uploads/fallback');
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );

    this.bucketName =
      this.configService.get<string>('R2_BUCKET_NAME') || 'basaer-uploads';
    this.publicDomain =
      this.configService.get<string>('R2_PUBLIC_DOMAIN') || '';

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

  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
  ] as const;

  /**
   * Uploads a file to Cloudflare R2.
   */
  async saveFile(
    file: Express.Multer.File,
    subFolder?: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size BEFORE any processing
    const maxMb = this.configService.get<number>('MAX_FILE_SIZE_MB') || 5;
    const maxSize = maxMb * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds ${maxMb}MB limit`);
    }

    // Verify MIME type via magic bytes (not trusting file.mimetype header)
    const detectedType = await fileTypeFromBuffer(file.buffer);
    if (!detectedType) {
      throw new BadRequestException('Unable to determine file type from content');
    }
    if (!this.allowedMimeTypes.includes(detectedType.mime as any)) {
      throw new BadRequestException(`File type ${detectedType.mime} is not allowed`);
    }

    // Cross-check: declared MIME must match detected MIME category
    const declaredCategory = file.mimetype.split('/')[0];
    const detectedCategory = detectedType.mime.split('/')[0];
    if (declaredCategory !== detectedCategory) {
      throw new BadRequestException('File content does not match declared type (possible MIME spoofing)');
    }

    // Sanitize subFolder to prevent directory traversal
    const safeSubFolder = subFolder
      ? subFolder.replace(/[^a-zA-Z0-9_-]/g, '')
      : '';

    // Generate secure unique filename — extension from DETECTED MIME, not originalname
    const ext = this.getFileExtension(detectedType.mime);
    const randomStr = crypto.randomBytes(8).toString('hex');
    const filename = `${Date.now()}_${randomStr}${ext}`;

    const key = safeSubFolder ? `${safeSubFolder}/${filename}` : filename;

    // Try R2 first, fall back to local filesystem
    const r2Disabled = process.env.DISABLE_R2 === 'true';
    if (this.s3Client && !r2Disabled) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: detectedType.mime,
        });

        await this.s3Client.send(command);

        if (this.publicDomain) {
          return `${this.publicDomain.replace(/\/$/, '')}/${key}`;
        }

        return key;
      } catch (error) {
        this.logger.warn(
          `R2 upload failed, falling back to local filesystem: ${error.message}`,
        );
      }
    } else if (r2Disabled) {
      this.logger.log('R2 disabled via DISABLE_R2 env var, using local filesystem');
    } else {
      this.logger.warn('R2 not configured, using local filesystem fallback');
    }

    return this.saveFileLocally(file.buffer, key, detectedType.mime);
  }

  /**
   * Uploads a file buffer directly to Cloudflare R2.
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    subFolder?: string,
  ): Promise<{ url: string; key: string }> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('No file provided');
    }

    // Validate buffer size
    const maxMb = this.configService.get<number>('MAX_FILE_SIZE_MB') || 5;
    const maxSize = maxMb * 1024 * 1024;
    if (buffer.length > maxSize) {
      throw new BadRequestException(`File size exceeds ${maxMb}MB limit`);
    }

    // Verify MIME type via magic bytes
    const detectedType = await fileTypeFromBuffer(buffer);
    if (!detectedType) {
      throw new BadRequestException('Unable to determine file type from content');
    }
    if (!this.allowedMimeTypes.includes(detectedType.mime as any)) {
      throw new BadRequestException(`File type ${detectedType.mime} is not allowed`);
    }

    // Cross-check declared vs detected
    const declaredCategory = mimeType.split('/')[0];
    const detectedCategory = detectedType.mime.split('/')[0];
    if (declaredCategory !== detectedCategory) {
      throw new BadRequestException('File content does not match declared type');
    }

    const safeSubFolder = subFolder
      ? subFolder.replace(/[^a-zA-Z0-9_-]/g, '')
      : '';

    // Use detected extension, not the provided filename
    const ext = this.getFileExtension(detectedType.mime);
    const baseName = filename.replace(/\.[^.]+$/, '');
    const secureFilename = `${baseName}${ext}`;

    const key = safeSubFolder ? `${safeSubFolder}/${secureFilename}` : secureFilename;

    // Try R2 first, fall back to local filesystem
    const r2Disabled = process.env.DISABLE_R2 === 'true';
    if (this.s3Client && !r2Disabled) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: detectedType.mime,
        });

        await this.s3Client.send(command);

        if (this.publicDomain) {
          return { url: `${this.publicDomain.replace(/\/$/, '')}/${key}`, key };
        }

        return { url: key, key };
      } catch (error) {
        this.logger.warn(
          `R2 upload failed, falling back to local filesystem: ${error.message}`,
        );
      }
    } else if (r2Disabled) {
      this.logger.log('R2 disabled via DISABLE_R2 env var, using local filesystem');
    } else {
      this.logger.warn('R2 not configured, using local filesystem fallback');
    }

    const localUrl = await this.saveFileLocally(buffer, key, detectedType.mime);
    return { url: localUrl, key };
  }

  /**
   * Fallback: saves file to local filesystem when R2 is unavailable.
   * Files are stored under public/uploads/fallback/ and served by nginx.
   */
  private async saveFileLocally(
    buffer: Buffer,
    key: string,
    mimeType: string,
  ): Promise<string> {
    const filePath = path.join(this.fallbackDir, key);
    const dir = path.dirname(filePath);

    await fsp.mkdir(dir, { recursive: true });
    await fsp.writeFile(filePath, buffer);

    this.logger.log(`File saved locally: ${filePath}`);
    return `/uploads/fallback/${key}`;
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

  private getFileExtension(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      case 'image/gif':
        return '.gif';
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
