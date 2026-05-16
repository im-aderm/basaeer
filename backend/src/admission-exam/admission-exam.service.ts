import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdmissionExamDto, UpdateAdmissionExamDto, CreateExamScoreDto, BulkScoreItemDto } from './dto/create-admission-exam.dto';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class AdmissionExamService {
  private readonly logger = new Logger(AdmissionExamService.name);

  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateAdmissionExamDto, context: TenantContext) {
    const branchId = createDto.branchId || context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    if (!context.isSuperAdmin && context.branchId !== branchId) {
      throw new ForbiddenException('You do not have access to this branch');
    }

    return this.prisma.admissionExam.create({
      data: {
        ...createDto,
        branchId,
        examDate: new Date(createDto.examDate),
        startTime: new Date(createDto.startTime),
        endTime: new Date(createDto.endTime),
      },
      include: {
        branch: { select: { id: true, name: true } },
        academicSession: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(context: TenantContext, filters?: { status?: string; dateFrom?: string; dateTo?: string }) {
    const where = TenantHelper.applyIsolation({}, context);

    if (filters?.status) {
      (where as any).status = filters.status;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      (where as any).examDate = {};
      if (filters.dateFrom) (where as any).examDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) (where as any).examDate.lte = new Date(filters.dateTo);
    }

    return this.prisma.admissionExam.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true } },
        academicSession: { select: { id: true, name: true } },
        _count: { select: { scores: true } },
      },
      orderBy: { examDate: 'desc' },
    });
  }

  async findOne(id: string, context: TenantContext) {
    const exam = await this.prisma.admissionExam.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
      include: {
        branch: { select: { id: true, name: true } },
        academicSession: { select: { id: true, name: true } },
        scores: {
          include: {
            admission: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                gender: true,
                desiredClass: { select: { id: true, name: true } },
                desiredSection: { select: { id: true, name: true } },
                status: true,
                guardianEmail: true,
                guardianPhone: true,
              },
            },
          },
          orderBy: { score: 'desc' },
        },
      },
    });

    if (!exam) throw new NotFoundException('Exam not found or access denied');
    return exam;
  }

  async update(id: string, updateDto: UpdateAdmissionExamDto, context: TenantContext) {
    await this.findOne(id, context);

    const data: any = { ...updateDto };
    if (updateDto.examDate) data.examDate = new Date(updateDto.examDate);
    if (updateDto.startTime) data.startTime = new Date(updateDto.startTime);
    if (updateDto.endTime) data.endTime = new Date(updateDto.endTime);

    return this.prisma.admissionExam.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, context: TenantContext) {
    await this.findOne(id, context);
    return this.prisma.admissionExam.delete({ where: { id } });
  }

  async addScore(examId: string, createDto: CreateExamScoreDto, context: TenantContext, userId?: string) {
    const exam = await this.findOne(examId, context);

    const admission = await this.prisma.onlineAdmission.findFirst({
      where: TenantHelper.applyIsolation({ id: createDto.admissionId }, context),
    });
    if (!admission) throw new NotFoundException('Admission not found');

    const maxScore = createDto.maxScore || exam.maxScore;
    const percentage = (createDto.score / maxScore) * 100;
    const grade = this.calculateGrade(percentage);

    return this.prisma.admissionExamScore.upsert({
      where: {
        admissionId_examId: {
          admissionId: createDto.admissionId,
          examId,
        },
      },
      update: {
        score: createDto.score,
        maxScore,
        grade: createDto.grade || grade,
        notes: createDto.notes,
        gradedById: userId,
        gradedAt: new Date(),
      },
      create: {
        admissionId: createDto.admissionId,
        examId,
        score: createDto.score,
        maxScore,
        grade: createDto.grade || grade,
        notes: createDto.notes,
        gradedById: userId,
        gradedAt: new Date(),
      },
    });
  }

  async bulkAddScores(examId: string, scores: BulkScoreItemDto[], context: TenantContext, userId?: string) {
    const exam = await this.findOne(examId, context);
    const results: { success: number; failed: number; details: string[] } = {
      success: 0,
      failed: 0,
      details: [],
    };

    for (const item of scores) {
      try {
        const admission = await this.prisma.onlineAdmission.findFirst({
          where: TenantHelper.applyIsolation({ id: item.admissionId }, context),
        });
        if (!admission) {
          results.failed++;
          results.details.push(`Admission ${item.admissionId} not found`);
          continue;
        }

        const maxScore = item.maxScore || exam.maxScore;
        const percentage = (item.score / maxScore) * 100;
        const grade = this.calculateGrade(percentage);

        await this.prisma.admissionExamScore.upsert({
          where: {
            admissionId_examId: {
              admissionId: item.admissionId,
              examId,
            },
          },
          update: {
            score: item.score,
            maxScore,
            grade: item.grade || grade,
            notes: item.notes,
            gradedById: userId,
            gradedAt: new Date(),
          },
          create: {
            admissionId: item.admissionId,
            examId,
            score: item.score,
            maxScore,
            grade: item.grade || grade,
            notes: item.notes,
            gradedById: userId,
            gradedAt: new Date(),
          },
        });

        results.success++;
        results.details.push(`Score added for ${admission.firstName} ${admission.lastName}`);
      } catch (error: any) {
        results.failed++;
        results.details.push(`Failed: ${error.message}`);
      }
    }

    // If all scores added successfully, update exam status to COMPLETED
    if (results.failed === 0 && results.success > 0) {
      await this.prisma.admissionExam.update({
        where: { id: examId },
        data: { status: 'COMPLETED' },
      });
    }

    return results;
  }

  async getRankings(examId: string, context: TenantContext) {
    await this.findOne(examId, context);

    const scores = await this.prisma.admissionExamScore.findMany({
      where: { examId },
      include: {
        admission: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            gender: true,
            desiredClass: { select: { id: true, name: true } },
            desiredSection: { select: { id: true, name: true } },
            guardianEmail: true,
            guardianPhone: true,
            status: true,
          },
        },
      },
      orderBy: { score: 'desc' },
    });

    // Calculate rankings
    const ranked = scores.map((s, index) => ({
      ...s,
      rank: index + 1,
      percentage: ((s.score / s.maxScore) * 100).toFixed(1),
    }));

    return ranked;
  }

  async assignAdmissionsToExam(examId: string, admissionIds: string[], context: TenantContext) {
    const exam = await this.findOne(examId, context);

    const admissions = await this.prisma.onlineAdmission.findMany({
      where: TenantHelper.applyIsolation({ id: { in: admissionIds } }, context),
    });

    if (admissions.length !== admissionIds.length) {
      throw new BadRequestException('Some admissions not found or access denied');
    }

    // Update status to EXAM_SCHEDULED for all assigned admissions
    await this.prisma.onlineAdmission.updateMany({
      where: {
        id: { in: admissionIds },
        branchId: exam.branchId,
      },
      data: { status: 'EXAM_SCHEDULED' },
    });

    return {
      success: true,
      count: admissionIds.length,
      message: `${admissionIds.length} applicants assigned to exam`,
    };
  }

  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }
}
