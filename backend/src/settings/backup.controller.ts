import { Controller, Get, Post, Delete, Param, UseGuards, Res } from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { Response } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('backups')
export class BackupController {
    constructor(private readonly backupService: BackupService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN)
    createBackup() {
        return this.backupService.createBackup();
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN)
    getBackups() {
        return this.backupService.getBackups();
    }

    @Delete(':filename')
    @Roles(UserRole.SUPER_ADMIN)
    deleteBackup(@Param('filename') filename: string) {
        return this.backupService.deleteBackup(filename);
    }

    @Get('download/:filename')
    @Roles(UserRole.SUPER_ADMIN)
    async downloadBackup(@Param('filename') filename: string, @Res() res: Response) {
        const filepath = await this.backupService.downloadBackup(filename);
        res.download(filepath);
    }
}
