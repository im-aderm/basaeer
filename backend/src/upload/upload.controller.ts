import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Upload admission document' })
  @Post('admission-document')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only JPEG, PNG, WebP images and PDF files are allowed',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadAdmissionDocument(
    @UploadedFile() file: Express.Multer.File,
    @Query('category') category?: string,
    @Req() req?: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    let url = await this.uploadService.saveFile(file, category);

    // If the URL is relative, construct the full URL from the request
    if (url && !url.startsWith('http')) {
      const baseUrl = `${req!.protocol}://${req!.get('host')}`;
      url = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    return {
      success: true,
      url,
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Upload payment proof' })
  @Post('payment-proof')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only JPEG, PNG, WebP images and PDF files are allowed',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadPaymentProof(
    @UploadedFile() file: Express.Multer.File,
    @Req() req?: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    let url = await this.uploadService.saveFile(file, 'payments');

    // If the URL is relative, construct the full URL from the request
    if (url && !url.startsWith('http')) {
      const baseUrl = `${req!.protocol}://${req!.get('host')}`;
      url = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    return {
      success: true,
      url,
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}