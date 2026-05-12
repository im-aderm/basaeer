import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';

@Injectable()
export class TahfeezService {
  constructor(private readonly prisma: PrismaService) {}

  private branchId(context: TenantContext) {
    if (!context.branchId)
      throw new ForbiddenException('Branch context required');
    return context.branchId;
  }

  private async audit(context: TenantContext, action: string, details: string) {
    await this.prisma.auditLog.create({
      data: { userId: context.userId, action, module: 'TAHFEEZ', details },
    });
  }

  private async grade(branchId: string, score: number) {
    const scale = await this.prisma.gradingScale.findMany({
      where: { branchId, isActive: true },
      orderBy: { minScore: 'desc' },
    });
    if (!scale.length)
      throw new BadRequestException(
        'No grading scale configured for Tahfeez assessment',
      );
    const match = scale.find(
      (row) => score >= row.minScore && score <= row.maxScore,
    );
    if (!match)
      throw new BadRequestException(
        `Score ${score} is outside configured grading ranges`,
      );
    return match;
  }

  async assess(dto: any, context: TenantContext) {
    const branchId = this.branchId(context);
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, branchId },
    });
    if (!student) throw new NotFoundException('Student not found');
    const components = await this.prisma.assessmentComponent.findMany({
      where: { branchId, curriculum: 'TAHFEEZ', isActive: true },
    });
    const required = ['memorizationScore', 'tajweedScore', 'fluencyScore'];
    for (const key of required) {
      if (dto[key] == null) throw new BadRequestException(`${key} is required`);
      if (Number(dto[key]) < 0 || Number(dto[key]) > 100)
        throw new BadRequestException(`${key} must be between 0 and 100`);
    }
    const totalWeight = components.reduce(
      (sum, component) => sum + component.weight,
      0,
    );
    if (totalWeight !== 100)
      throw new BadRequestException(
        'Tahfeez assessment component weights must equal 100',
      );
    const totalScore = components.reduce((sum, component) => {
      const key = component.component;
      return (
        sum +
        ((Number(dto[key]) || 0) / (component.maxScore || 100)) *
          component.weight
      );
    }, 0);
    const grade = await this.grade(branchId, totalScore);
    const assessment = await this.prisma.tahfeezAssessment.create({
      data: {
        branchId,
        studentId: dto.studentId,
        teacherId: dto.teacherId || context.userId,
        sessionId: dto.sessionId,
        term: dto.term,
        surah: dto.surah,
        juz: dto.juz,
        fromAyah: dto.fromAyah,
        toAyah: dto.toAyah,
        memorizationScore: Number(dto.memorizationScore),
        tajweedScore: Number(dto.tajweedScore),
        fluencyScore: Number(dto.fluencyScore),
        revisionScore:
          dto.revisionScore == null ? null : Number(dto.revisionScore),
        totalScore,
        grade: grade.grade,
        remark: dto.remark || grade.remark,
      },
    });
    await this.audit(
      context,
      'TAHFEEZ_ASSESSED',
      `Created Tahfeez assessment ${assessment.id}`,
    );
    return assessment;
  }

  async updateProgress(dto: any, context: TenantContext) {
    const branchId = this.branchId(context);
    const totalAyahs = Number(dto.totalAyahs || 0);
    const completedAyahs = Number(dto.completedAyahs || 0);
    const completionRate =
      totalAyahs > 0 ? (completedAyahs / totalAyahs) * 100 : 0;
    return this.prisma.tahfeezMemorizationProgress.upsert({
      where: {
        studentId_currentSurah: {
          studentId: dto.studentId,
          currentSurah: dto.currentSurah,
        },
      },
      update: {
        currentJuz: dto.currentJuz,
        completedAyahs,
        totalAyahs,
        completionRate,
        lastReviewedAt: dto.lastReviewedAt
          ? new Date(dto.lastReviewedAt)
          : new Date(),
        teacherRemark: dto.teacherRemark,
        branchId,
      },
      create: {
        branchId,
        studentId: dto.studentId,
        currentSurah: dto.currentSurah,
        currentJuz: dto.currentJuz,
        completedAyahs,
        totalAyahs,
        completionRate,
        lastReviewedAt: dto.lastReviewedAt
          ? new Date(dto.lastReviewedAt)
          : new Date(),
        teacherRemark: dto.teacherRemark,
      },
    });
  }

  async report(studentId: string, context: TenantContext) {
    const branchId = this.branchId(context);
    const [assessments, progress] = await Promise.all([
      this.prisma.tahfeezAssessment.findMany({
        where: { branchId, studentId },
        orderBy: { assessedAt: 'desc' },
      }),
      this.prisma.tahfeezMemorizationProgress.findMany({
        where: { branchId, studentId },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);
    const average = assessments.length
      ? assessments.reduce((sum, row) => sum + row.totalScore, 0) /
        assessments.length
      : 0;
    return {
      average,
      assessments,
      progress,
      completionRate: progress.length
        ? progress.reduce((sum, row) => sum + row.completionRate, 0) /
          progress.length
        : 0,
    };
  }
}
