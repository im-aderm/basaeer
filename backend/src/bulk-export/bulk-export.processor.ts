import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import archiver from 'archiver';
import { PrismaService } from '../prisma/prisma.service';
import { ReportingService } from '../reporting/reporting.service';
import { AdmissionSlipService } from '../online-admission/admission-slip.service';
import { CertificatesService } from '../certificates/certificates.service';
import { TenantContext } from '../auth/branch.guard';
import { UserRole } from '../generated/client/client';

interface ExportItem {
  id: string;
  filename: string;
}

const MAX_ITEMS = 500; // hard cap so one job cannot run away

/**
 * Generates a ZIP of per-item PDFs off the request thread. A generator is
 * registered per document type: `fetchItems` selects the branch-scoped records,
 * and `generate` produces a single PDF for one record. Adding a new bulk type
 * is a matter of adding a case to each switch below.
 */
@Processor('bulk-exports')
export class BulkExportProcessor extends WorkerHost {
  private readonly logger = new Logger(BulkExportProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reporting: ReportingService,
    private readonly admissionSlip: AdmissionSlipService,
    private readonly certificates: CertificatesService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { exportId, type, filters, userId, branchId, sessionId } = job.data;
    this.logger.log(`Bulk export ${exportId} (${type}) starting`);

    try {
      await this.setStatus(exportId, 'PROCESSING', 5);

      // isSuperAdmin=false ensures generators still apply branch isolation.
      const ctx: TenantContext = {
        userId,
        branchId,
        sessionId: sessionId || null,
        isSuperAdmin: false,
        role: UserRole.SUPER_ADMIN,
      };

      const items = await this.fetchItems(type, filters || {}, branchId);
      if (!items.length) {
        throw new Error('No documents matched the selection.');
      }

      const files: { name: string; buffer: Buffer }[] = [];
      for (let i = 0; i < items.length; i++) {
        try {
          const buffer = await this.generate(type, items[i].id, ctx);
          const name = `${String(i + 1).padStart(3, '0')}-${this.safe(items[i].filename)}`;
          files.push({ name, buffer });
        } catch (err) {
          // Skip an individual failure so one bad record can't sink the batch.
          this.logger.warn(
            `Skipping ${type} ${items[i].id} in export ${exportId}: ${(err as Error).message}`,
          );
        }
        await this.setProgress(exportId, 5 + Math.floor(((i + 1) / items.length) * 85));
      }

      if (!files.length) {
        throw new Error('Failed to generate any documents for the selection.');
      }

      const zip = await this.zip(files);
      const fileName = `${String(type).toLowerCase()}_${exportId}.zip`;
      const saved = await this.reporting.saveExportBuffer(zip, fileName);

      await this.prisma.academicExport.update({
        where: { id: exportId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          fileUrl: saved.fileUrl,
          fileName,
          fileSize: saved.fileSize,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });

      this.logger.log(
        `Bulk export ${exportId} completed: ${files.length}/${items.length} documents`,
      );
      return { fileUrl: saved.fileUrl, count: files.length };
    } catch (error) {
      this.logger.error(`Bulk export ${exportId} failed: ${(error as Error).message}`);
      await this.prisma.academicExport
        .update({
          where: { id: exportId },
          data: { status: 'FAILED', error: (error as Error).message },
        })
        .catch(() => undefined);
      throw error;
    }
  }

  // ── Per-type selection (always branch-scoped) ──────────────────────────────

  private async fetchItems(
    type: string,
    filters: any,
    branchId: string,
  ): Promise<ExportItem[]> {
    const ids: string[] | undefined = Array.isArray(filters.ids) && filters.ids.length
      ? filters.ids
      : undefined;

    switch (type) {
      case 'ADMISSION_SLIP': {
        const rows = await this.prisma.onlineAdmission.findMany({
          where: {
            branchId,
            ...(ids ? { id: { in: ids } } : {}),
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.sessionId ? { academicSessionId: filters.sessionId } : {}),
          },
          select: { id: true, admissionNumber: true, firstName: true, lastName: true },
          take: MAX_ITEMS,
          orderBy: { createdAt: 'desc' },
        });
        return rows.map((r) => ({
          id: r.id,
          filename: `admission-slip-${r.admissionNumber || `${r.firstName}-${r.lastName}`}.pdf`,
        }));
      }
      case 'CERTIFICATE': {
        const rows = await this.prisma.certificate.findMany({
          where: { branchId, ...(ids ? { id: { in: ids } } : {}) },
          select: { id: true, certificateNumber: true },
          take: MAX_ITEMS,
          orderBy: { createdAt: 'desc' },
        });
        return rows.map((r) => ({
          id: r.id,
          filename: `certificate-${r.certificateNumber || r.id}.pdf`,
        }));
      }
      default:
        throw new Error(`Unsupported bulk export type: ${type}`);
    }
  }

  private async generate(
    type: string,
    id: string,
    ctx: TenantContext,
  ): Promise<Buffer> {
    switch (type) {
      case 'ADMISSION_SLIP': {
        const { buffer } = await this.admissionSlip.generateSlip(id, ctx);
        return buffer;
      }
      case 'CERTIFICATE':
        return this.certificates.generatePDF(id, ctx);
      default:
        throw new Error(`Unsupported bulk export type: ${type}`);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private zip(files: { name: string; buffer: Buffer }[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];
      archive.on('data', (c) => chunks.push(c as Buffer));
      archive.on('warning', (w) => this.logger.warn(`archiver: ${w.message}`));
      archive.on('error', reject);
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      for (const f of files) archive.append(f.buffer, { name: f.name });
      void archive.finalize();
    });
  }

  private safe(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);
  }

  private async setStatus(id: string, status: string, progress: number) {
    await this.prisma.academicExport.update({
      where: { id },
      data: { status, progress },
    });
  }

  private async setProgress(id: string, progress: number) {
    await this.prisma.academicExport
      .update({ where: { id }, data: { progress } })
      .catch(() => undefined);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Bulk export job ${job.id} failed: ${error.message}`);
  }
}
