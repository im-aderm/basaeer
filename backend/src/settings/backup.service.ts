import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { execFile } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const execFilePromise = promisify(execFile);

@Injectable()
export class BackupService {
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  private validatePath(filename: string): string {
    const resolvedPath = path.resolve(this.backupDir, filename);
    const resolvedBase = path.resolve(this.backupDir);
    if (!resolvedPath.startsWith(resolvedBase + path.sep) && resolvedPath !== resolvedBase) {
      throw new BadRequestException('Invalid file path');
    }
    return resolvedPath;
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new InternalServerErrorException('DATABASE_URL not found');
    }

    try {
      let url: URL;
      try {
        url = new URL(dbUrl);
      } catch {
        throw new InternalServerErrorException('Invalid DATABASE_URL format');
      }

      const dbName = url.pathname.slice(1);
      if (!dbName) {
        throw new InternalServerErrorException('DATABASE_URL must include a database name');
      }

      await execFilePromise(
        'pg_dump',
        [
          '-h', url.hostname,
          '-p', url.port || '5432',
          '-U', url.username,
          '-d', dbName,
          '-f', filepath,
        ],
        {
          env: { ...process.env, PGPASSWORD: decodeURIComponent(url.password) },
        },
      );

      const stats = fs.statSync(filepath);
      return {
        filename,
        size: stats.size,
        createdAt: new Date(),
        path: filepath,
      };
    } catch (error) {
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
    const filepath = this.validatePath(filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return { message: 'Backup deleted successfully' };
    }
    throw new Error('Backup file not found');
  }

  async downloadBackup(filename: string) {
    const filepath = this.validatePath(filename);
    if (fs.existsSync(filepath)) {
      return filepath;
    }
    throw new Error('Backup file not found');
  }
}