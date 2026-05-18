import { createHash, randomBytes } from 'crypto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import { ReportingService } from '../reporting/reporting.service';

@Injectable()
export class TranscriptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reportingService: ReportingService,
  ) {}

  private branchId(context: TenantContext) {
    if (!context.branchId)
      throw new ForbiddenException('Branch context required');
    return context.branchId;
  }

  private checksum(data: unknown) {
    return createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  private async audit(context: TenantContext, action: string, details: string) {
    await this.prisma.auditLog.create({
      data: { userId: context.userId, action, module: 'TRANSCRIPTS', details },
    });
  }

  async generate(studentId: string, context: TenantContext) {
    const branchId = this.branchId(context);
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, branchId },
      include: {
        branch: true,
        class: true,
        user: true,
        resultSummaries: {
          include: { session: true },
          orderBy: [{ session: { startDate: 'asc' } }, { term: 'asc' }],
        },
        assessmentRecords: {
          include: { subject: true, session: true },
          orderBy: [{ session: { startDate: 'asc' } }, { term: 'asc' }],
        },
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    const approvedResults = student.resultSummaries.filter(
      (summary) => summary.isLocked,
    );
    const gpas = approvedResults
      .map((summary) => summary.cgpa)
      .filter((value: any) => value !== null).map((v: any) => typeof v === 'number' ? v : (v as any).toNumber?.() ?? 0);
    const cumulativeGpa = gpas.length
      ? gpas.reduce((sum, value) => sum + value, 0) / gpas.length
      : null;
    const payload = {
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        admissionNo: student.user?.email?.split('@')[0] || student.id,
        className: student.class?.name,
      },
      branch: {
        name: student.branch.name,
        address: student.branch.address,
      },
      cumulativeGpa,
      summaries: approvedResults.map((summary) => ({
        session: summary.session.name,
        term: summary.term,
        totalScore: summary.totalScore,
        average: summary.average,
        grade: summary.finalGrade,
        gpa: summary.cgpa,
        classPosition: summary.classPosition,
      })),
      subjects: student.assessmentRecords
        .filter((record) =>
          approvedResults.some(
            (summary) =>
              summary.sessionId === record.sessionId &&
              summary.term === record.term,
          ),
        )
        .map((record) => ({
          session: record.session.name,
          term: record.term,
          subject: record.subject.name,
          total: record.total,
          grade: record.grade,
          position: record.position,
        })),
    };
    const checksum = this.checksum(payload);
    const transcriptNo = `TR-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;
    const verificationCode = randomBytes(10).toString('hex').toUpperCase();
    const transcript = await this.prisma.transcript.create({
      data: {
        branchId,
        studentId,
        transcriptNo,
        status: 'DRAFT',
        cumulativeGpa,
        checksum,
        data: payload,
      },
    });
    await this.prisma.transcriptVerification.create({
      data: {
        transcriptId: transcript.id,
        verificationCode,
        qrPayload: `/verify/transcript/${verificationCode}`,
      },
    });
    await this.audit(
      context,
      'TRANSCRIPT_GENERATED',
      `Generated transcript ${transcript.id}`,
    );
    return { ...transcript, verificationCode };
  }

  async approve(id: string, context: TenantContext) {
    const transcript = await this.prisma.transcript.findFirst({
      where: { id, branchId: this.branchId(context) },
    });
    if (!transcript) throw new NotFoundException('Transcript not found');
    if (transcript.status !== 'DRAFT')
      throw new ForbiddenException('Only draft transcripts can be approved');
    const updated = await this.prisma.transcript.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: context.userId,
        approvedAt: new Date(),
        lockedAt: new Date(),
      },
    });
    await this.audit(
      context,
      'TRANSCRIPT_APPROVED',
      `Approved transcript ${id}`,
    );
    return updated;
  }

  async list(query: any, context: TenantContext) {
    const branchId =
      context.isSuperAdmin && query.branchId
        ? query.branchId
        : this.branchId(context);
    return this.prisma.transcript.findMany({
      where: {
        branchId,
        ...(query.studentId && { studentId: query.studentId }),
        ...(query.status && { status: query.status }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verify(code: string) {
    const verification = await this.prisma.transcriptVerification.findUnique({
      where: { verificationCode: code },
    });
    if (!verification || verification.revokedAt) return { valid: false };
    const transcript = await this.prisma.transcript.findUnique({
      where: { id: verification.transcriptId },
    });
    if (!transcript || transcript.status === 'REVOKED') return { valid: false };
    const valid = this.checksum(transcript.data) === transcript.checksum;
    await this.prisma.transcriptVerification.update({
      where: { id: verification.id },
      data: { checkedAt: new Date() },
    });
    return {
      valid,
      transcriptNo: transcript.transcriptNo,
      status: transcript.status,
      issuedAt: transcript.approvedAt || transcript.createdAt,
      data: valid ? transcript.data : null,
    };
  }

  async pdf(id: string, context: TenantContext) {
    const transcript = await this.prisma.transcript.findFirst({
      where: { id, branchId: this.branchId(context) },
    });
    if (!transcript) throw new NotFoundException('Transcript not found');
    const html = `<h1>Academic Transcript</h1><pre>${JSON.stringify(transcript.data, null, 2)}</pre><p>Checksum: ${transcript.checksum}</p>`;
    return this.reportingService.generatePdf(html);
  }
}
