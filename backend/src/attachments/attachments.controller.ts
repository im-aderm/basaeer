import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { UploadService } from '../upload/upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { UserRole } from '../generated/client/client';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { Throttle } from '@nestjs/throttler';
import { BadRequestException } from '@nestjs/common';
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('categories')
  @Permissions('attachments:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  createCategory(
    @Body('name') name: string,
    @Body('description') description: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.attachmentsService.createCategory(name, description, ctx.branchId!);
  }

  @Get('categories')
  @Permissions('attachments:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getCategories(@Query('branchId') branchId: string | undefined, @GetTenantContext() ctx: TenantContext) {
    return this.attachmentsService.getCategories(branchId || ctx.branchId!);
  }

  @Delete('categories/:id')
  @Permissions('attachments:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  deleteCategory(@Param('id') id: string) {
    return this.attachmentsService.deleteCategory(id);
  }

  @Post('upload')
  @Permissions('attachments:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  @UseInterceptors(FileInterceptor('file'))
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('categoryId') categoryId: string,
    @Body('classIds') classIds: string,
    @Body('sectionIds') sectionIds: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!title || !categoryId) throw new BadRequestException('Title and categoryId are required');

    const fileUrl = await this.uploadService.saveFile(file, 'attachments');
    const parsedClassIds = classIds ? JSON.parse(classIds) : [];
    const parsedSectionIds = sectionIds ? JSON.parse(sectionIds) : [];

    return this.attachmentsService.saveUpload(
      title,
      categoryId,
      parsedClassIds,
      parsedSectionIds,
      fileUrl,
      file.mimetype,
      ctx.userId,
      ctx.branchId!,
    );
  }
}
