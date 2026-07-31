import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { UserRole } from '../generated/client/client';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiTags('Backup')
@Controller('backups')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Backup' })
  @Post()
  @Permissions('settings:create')
  @Roles(UserRole.SUPER_ADMIN)
  createBackup() {
    return this.backupService.createBackup();
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Backups' })
  @Get()
  @Permissions('settings:read')
  @Roles(UserRole.SUPER_ADMIN)
  getBackups() {
    return this.backupService.getBackups();
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Backup' })
  @Delete(':filename')
  @Permissions('settings:delete')
  @Roles(UserRole.SUPER_ADMIN)
  deleteBackup(@Param('filename') filename: string) {
    return this.backupService.deleteBackup(filename);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Download Backup' })
  @Get('download/:filename')
  @Permissions('settings:read')
  @Roles(UserRole.SUPER_ADMIN)
  async downloadBackup(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filepath = await this.backupService.downloadBackup(filename);
    res.download(filepath);
  }
}
