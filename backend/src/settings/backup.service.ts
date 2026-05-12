import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const execPromise = promisify(exec);

@Injectable()
export class BackupService {
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);

    // Get DB config from env
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl)
      throw new InternalServerErrorException('DATABASE_URL not found');

    try {
      // Simple pg_dump command using the database URL
      await execPromise(`pg_dump "${dbUrl}" > "${filepath}"`);

      const stats = fs.statSync(filepath);
      return {
        filename,
        size: stats.size,
        createdAt: new Date(),
        path: filepath,
      };
    } catch (error) {
      console.error('Backup failed', error);
      throw new InternalServerErrorException(
        'Failed to create database backup',
      );
    }
  }

  async getBackups() {
    if (!fs.existsSync(this.backupDir)) return [];

    const files = fs.readdirSync(this.backupDir);
    return files
      .filter((file) => file.endsWith('.sql'))
      .map((file) => {
        const stats = fs.statSync(path.join(this.backupDir, file));
        return {
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteBackup(filename: string) {
    const filepath = path.join(this.backupDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return { message: 'Backup deleted successfully' };
    }
    throw new Error('Backup file not found');
  }

  async downloadBackup(filename: string) {
    const filepath = path.join(this.backupDir, filename);
    if (fs.existsSync(filepath)) {
      return filepath;
    }
    throw new Error('Backup file not found');
  }
}
