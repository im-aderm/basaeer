import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExamsService } from '../exams/exams.service';
import { UploadService } from '../upload/upload.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { TenantContext } from '../auth/branch.guard';
import { UserRole } from '../generated/client/client';
import { ResultDeliveryJobData } from './result-delivery-queue.service';

@Processor('result-delivery')
export class ResultDeliveryProcessor extends WorkerHost {
  private readonly logger = new Logger(ResultDeliveryProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly examsService: ExamsService,
    private readonly uploadService: UploadService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async process(job: Job<ResultDeliveryJobData>): Promise<any> {
    const { studentId, sessionId, term, branchId } = job.data;

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, parent: true },
    });
    if (!student) {
      this.logger.warn(`Result delivery skipped: student ${studentId} not found`);
      return { skipped: true };
    }

    const session = await this.prisma.academicSession.findUnique({ where: { id: sessionId } });
    const studentName = `${student.user?.firstName || student.firstName} ${student.user?.lastName || student.lastName}`;
    const sessionName = session?.name || '';

    const context: TenantContext = {
      userId: 'system-result-delivery',
      branchId,
      isSuperAdmin: true,
      role: UserRole.SUPER_ADMIN,
    };
    const pdf = await this.examsService.renderReportCardPdf(studentId, sessionId, term, context);
    if (!pdf) {
      this.logger.warn(`No report data to render for student ${studentId}, session ${sessionId}, term ${term}`);
      return { skipped: true };
    }

    const fileName = `ReportCard_${studentName.replace(/\s+/g, '_')}_${sessionName}_${term}.pdf`;
    const { url: fileUrl } = await this.uploadService.uploadFile(
      pdf,
      fileName,
      'application/pdf',
      'report-cards',
    );

    const title = 'Result Published';
    const message = `${studentName}'s result for ${term} Term, ${sessionName} has been published.`;

    if (student.userId) {
      await this.notificationsService.createNotification({
        userId: student.userId,
        title,
        message: `${message} Tap to view your report card.`,
        type: 'RESULT_PUBLISHED',
        branchId,
      }).catch((err) => this.logger.warn(`Failed to notify student ${student.userId}: ${err.message}`));
    }

    if (student.parentId) {
      await this.notificationsService.createNotification({
        userId: student.parentId,
        title,
        message,
        type: 'RESULT_PUBLISHED',
        branchId,
      }).catch((err) => this.logger.warn(`Failed to notify parent ${student.parentId}: ${err.message}`));

      const parentPrefs = await this.prisma.notificationPreference.findUnique({
        where: { userId: student.parentId },
      });
      const emailEnabled = parentPrefs?.email !== false;
      if (emailEnabled && student.parent?.email) {
        await this.mailService
          .sendReportCardEmail(student.parent.email, studentName, sessionName, term, pdf, branchId)
          .catch((err) => this.logger.warn(`Failed to email parent ${student.parent?.email}: ${err.message}`));
      }
    }

    return { fileUrl };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Result delivery job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Result delivery job ${job.id} failed: ${error.message}`);
  }
}
