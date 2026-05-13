import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import ExcelJS from 'exceljs';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRole } from '../generated/client/client';

@Processor('student-import')
export class StudentsProcessor extends WorkerHost {
  private readonly logger = new Logger(StudentsProcessor.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {
    super();
  }

  async process(job: Job<{ fileBuffer: Buffer; context: { userId: string; branchId: string; role: string } }>) {
    const { fileBuffer, context } = job.data;

    await job.updateProgress(0);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as any);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new Error('No worksheet found');

    const classes = await this.prisma.class.findMany({ where: { branchId: context.branchId } });
    const sections = await this.prisma.section.findMany({ where: { class: { branchId: context.branchId } } });

    const rows: any[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      rows.push({ email: row.getCell(1).value?.toString(), firstName: row.getCell(2).value?.toString(), lastName: row.getCell(3).value?.toString(), phone: row.getCell(4).value?.toString() || null, dobValue: row.getCell(5).value, className: row.getCell(6).value?.toString(), sectionName: row.getCell(7).value?.toString(), rowNumber });
    });

    let success = 0;
    let failed = 0;
    const details: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      await job.updateProgress(Math.round(((i + 1) / rows.length) * 100));

      if (!r.email || !r.firstName || !r.lastName) {
        failed++;
        details.push(`Row ${r.rowNumber}: Missing required fields`);
        continue;
      }

      let classId: string | null = null;
      if (r.className) {
        const match = classes.find((c) => c.name.toLowerCase() === r.className.toLowerCase() || c.id === r.className);
        classId = match?.id || null;
      }

      let sectionId: string | null = null;
      if (r.sectionName && classId) {
        const match = sections.find((s) => s.classId === classId && (s.name.toLowerCase() === r.sectionName.toLowerCase() || s.id === r.sectionName));
        sectionId = match?.id || null;
      }

      try {
        const existingUser = await this.prisma.user.findUnique({ where: { email: r.email } });
        if (existingUser) {
          failed++;
          details.push(`Row ${r.rowNumber}: Email ${r.email} already exists`);
          continue;
        }

        const tempPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        await this.prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: { email: r.email, password: hashedPassword, mustChangePassword: true, firstName: r.firstName, lastName: r.lastName, phone: r.phone, role: UserRole.STUDENT, branchId: context.branchId },
          });
          await tx.student.create({
            data: { userId: user.id, firstName: r.firstName, lastName: r.lastName, branchId: context.branchId, classId, sectionId, dob: r.dobValue ? new Date(r.dobValue.toString()) : undefined },
          });
        });

        success++;
        details.push(`Row ${r.rowNumber}: ${r.email} created`);
      } catch (error: any) {
        failed++;
        details.push(`Row ${r.rowNumber}: ${error.message}`);
      }
    }

    return { success, failed, details };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Import job ${job.id} completed: ${job.returnvalue?.success} successes, ${job.returnvalue?.failed} failures`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Import job ${job.id} failed: ${error.message}`);
  }
}
