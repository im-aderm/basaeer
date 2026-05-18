import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportingService } from '../reporting/reporting.service';
import { ExamsService } from '../exams/exams.service';
import { TranscriptService } from '../exams/transcript.service';
import { TenantContext } from '../auth/branch.guard';
import { UserRole } from '../generated/client/client';

@Processor('academic-exports')
export class AcademicExportProcessor extends WorkerHost {
  private readonly logger = new Logger(AcademicExportProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reportingService: ReportingService,
    private readonly examsService: ExamsService,
    private readonly transcriptService: TranscriptService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { exportId, type, parameters, userId, branchId } = job.data;

    this.logger.log(`Processing export ${exportId} of type ${type}`);

    try {
      await this.prisma.academicExport.update({
        where: { id: exportId },
        data: { status: 'PROCESSING', progress: 10 },
      });

      let result: {
        buffer?: Buffer;
        filePath?: string;
        fileUrl?: string;
        fileSize?: number;
        fileName: string;
      };

      switch (type) {
        case 'REPORT_CARD':
          result = await this.handleReportCardExport(
            exportId,
            parameters,
            branchId,
            userId,
          );
          break;
        case 'TRANSCRIPT':
          result = await this.handleTranscriptExport(
            exportId,
            parameters,
            branchId,
            userId,
          );
          break;
        case 'BROADSHEET':
          result = await this.handleBroadsheetExport(
            exportId,
            parameters,
            branchId,
          );
          break;
        case 'ANALYTICS':
          result = await this.handleAnalyticsExport(
            exportId,
            parameters,
            branchId,
          );
          break;
        case 'EXCEL':
        case 'CSV':
          result = await this.handleDataExport(
            exportId,
            type,
            parameters,
            branchId,
          );
          break;
        default:
          throw new Error(`Unsupported export type: ${type}`);
      }

      let fileUrl = result.fileUrl;
      let fileSize = result.fileSize;

      if (result.buffer) {
        const extension =
          type === 'EXCEL'
            ? 'xlsx'
            : type === 'CSV'
              ? 'csv'
              : type === 'REPORT_CARD'
                ? 'zip'
                : 'pdf';
        const fileName = `${type.toLowerCase()}_${exportId}.${extension}`;
        const saved = await this.reportingService.saveExportBuffer(
          result.buffer,
          fileName,
        );
        fileUrl = saved.fileUrl;
        fileSize = saved.fileSize;
        result.fileName = fileName;
      }

      await this.prisma.academicExport.update({
        where: { id: exportId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          fileUrl,
          fileName: result.fileName,
          fileSize,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        },
      });

      return { fileUrl, fileSize, fileName: result.fileName };
    } catch (error) {
      this.logger.error(
        `Export ${exportId} failed: ${error.message}`,
        error.stack,
      );
      await this.prisma.academicExport.update({
        where: { id: exportId },
        data: { status: 'FAILED', error: error.message },
      });
      throw error;
    }
  }

  private async handleReportCardExport(
    exportId: string,
    params: any,
    branchId: string,
    userId: string,
  ) {
    const { sectionId, sessionId, term } = params;
    await this.updateProgress(exportId, 20);
    const ctx: TenantContext = { userId: userId, branchId, sessionId: params.sessionId || null, isSuperAdmin: false, role: UserRole.SUPER_ADMIN };
    const result = await this.examsService.generateBatchZip(
      sectionId,
      sessionId,
      term,
      ctx,
    );
    return {
      fileUrl: result.fileUrl,
      fileSize: result.fileSize,
      fileName: 'ReportCards.zip',
    };
  }

  private async handleTranscriptExport(
    exportId: string,
    params: any,
    branchId: string,
    userId: string,
  ) {
    const { studentId } = params;
    await this.updateProgress(exportId, 20);
    const ctx: TenantContext = { userId, branchId, sessionId: null, isSuperAdmin: false, role: UserRole.SUPER_ADMIN };
    const transcript = await this.transcriptService.generate(studentId, ctx);
    return { fileName: `transcript-${studentId}.pdf` };
  }

  private async updateProgress(exportId: string, progress: number) {
    await this.prisma.academicExport.update({
      where: { id: exportId },
      data: { progress },
    });
  }

  private async handleBroadsheetExport(
    exportId: string,
    params: any,
    branchId: string,
  ): Promise<{ fileName: string }> {
    this.logger.log(`Broadsheet export ${exportId} not yet implemented`);
    return { fileName: `broadsheet-${params.sectionId}.pdf` };
  }

  private async handleAnalyticsExport(
    exportId: string,
    params: any,
    branchId: string,
  ): Promise<{ fileName: string }> {
    this.logger.log(`Analytics export ${exportId} not yet implemented`);
    return { fileName: `analytics-${params.sectionId}.pdf` };
  }

  private async handleDataExport(
    exportId: string,
    type: string,
    params: any,
    branchId: string,
  ): Promise<{ fileName: string }> {
    this.logger.log(`Data export ${exportId} not yet implemented`);
    return { fileName: `data-export-${exportId}.csv` };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
