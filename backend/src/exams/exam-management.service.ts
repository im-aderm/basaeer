import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';

@Injectable()
export class ExamManagementService {
  constructor(private readonly prisma: PrismaService) {}

  private branchId(context: TenantContext) {
    if (!context.branchId)
      throw new ForbiddenException('Branch context required');
    return context.branchId;
  }

  private async audit(context: TenantContext, action: string, details: string) {
    await this.prisma.auditLog.create({
      data: { userId: context.userId, action, module: 'EXAMS', details },
    });
  }

  async createExam(dto: any, context: TenantContext) {
    const branchId =
      context.isSuperAdmin && dto.branchId
        ? dto.branchId
        : this.branchId(context);
    if (!dto.title || !dto.sessionId || !dto.term)
      throw new BadRequestException('title, sessionId and term are required');
    const exam = await this.prisma.exam.create({
      data: {
        title: dto.title,
        code: dto.code,
        description: dto.description,
        status: dto.status || 'DRAFT',
        branchId,
        classId: dto.classId,
        sectionId: dto.sectionId,
        sessionId: dto.sessionId,
        term: dto.term,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        gradingStartsAt: dto.gradingStartsAt
          ? new Date(dto.gradingStartsAt)
          : null,
        gradingEndsAt: dto.gradingEndsAt ? new Date(dto.gradingEndsAt) : null,
        createdByUserId: context.userId,
      },
    });
    await this.audit(context, 'EXAM_CREATED', `Created exam ${exam.id}`);
    return exam;
  }

  async listExams(query: any, context: TenantContext) {
    const branchId =
      context.isSuperAdmin && query.branchId
        ? query.branchId
        : this.branchId(context);
    return this.prisma.exam.findMany({
      where: {
        branchId,
        ...(query.sessionId && { sessionId: query.sessionId }),
        ...(query.term && { term: query.term }),
        ...(query.status && { status: query.status }),
        ...(query.classId && { classId: query.classId }),
        ...(query.sectionId && { sectionId: query.sectionId }),
        isArchived: query.includeArchived === 'true' ? undefined : false,
      },
      orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }],
      take: query.take ? Number(query.take) : 100,
      skip: query.skip ? Number(query.skip) : 0,
    });
  }

  async getExam(id: string, context: TenantContext) {
    const exam = await this.prisma.exam.findFirst({
      where: { id, branchId: this.branchId(context) },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async updateExam(id: string, dto: any, context: TenantContext) {
    await this.getExam(id, context);
    const exam = await this.prisma.exam.update({
      where: { id },
      data: {
        title: dto.title,
        code: dto.code,
        description: dto.description,
        classId: dto.classId,
        sectionId: dto.sectionId,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        gradingStartsAt: dto.gradingStartsAt
          ? new Date(dto.gradingStartsAt)
          : undefined,
        gradingEndsAt: dto.gradingEndsAt
          ? new Date(dto.gradingEndsAt)
          : undefined,
      },
    });
    await this.audit(context, 'EXAM_UPDATED', `Updated exam ${id}`);
    return exam;
  }

  async transitionExam(id: string, status: string, context: TenantContext) {
    const exam = await this.getExam(id, context);
    const allowed: Record<string, string[]> = {
      DRAFT: ['SCHEDULED', 'ACTIVE', 'ARCHIVED'],
      SCHEDULED: ['ACTIVE', 'MARK_ENTRY', 'ARCHIVED'],
      ACTIVE: ['MARK_ENTRY', 'LOCKED', 'ARCHIVED'],
      MARK_ENTRY: ['UNDER_REVIEW', 'LOCKED'],
      UNDER_REVIEW: ['APPROVED', 'MARK_ENTRY'],
      APPROVED: ['PUBLISHED', 'ARCHIVED'],
      LOCKED: ['MARK_ENTRY', 'ARCHIVED'],
      PUBLISHED: ['ARCHIVED'],
      ARCHIVED: [],
    };
    if (!allowed[String(exam.status)]?.includes(status)) {
      throw new BadRequestException(
        `Invalid exam status transition ${exam.status} -> ${status}`,
      );
    }
    const updated = await this.prisma.exam.update({
      where: { id },
      data: {
        status: status as any,
        lockedAt:
          status === 'LOCKED' || status === 'PUBLISHED'
            ? new Date()
            : exam.lockedAt,
      },
    });
    await this.audit(
      context,
      'EXAM_STATUS_CHANGED',
      `Exam ${id} moved from ${exam.status} to ${status}`,
    );
    return updated;
  }

  async cloneExam(id: string, dto: any, context: TenantContext) {
    const exam = await this.getExam(id, context);
    return this.createExam(
      {
        ...exam,
        title: dto.title || `${exam.title} Copy`,
        sessionId: dto.sessionId || exam.sessionId,
        term: dto.term || exam.term,
        status: 'DRAFT',
      },
      context,
    );
  }

  async upsertExamType(dto: any, context: TenantContext) {
    const branchId =
      context.isSuperAdmin && dto.branchId
        ? dto.branchId
        : this.branchId(context);
    if (!dto.name || dto.weight == null)
      throw new BadRequestException('name and weight are required');
    return this.prisma.examType.upsert({
      where: {
        branchId_name_classId: {
          branchId,
          name: dto.name,
          classId: dto.classId || null,
        },
      },
      update: {
        description: dto.description,
        weight: Number(dto.weight),
        level: dto.level,
        isActive: dto.isActive ?? true,
      },
      create: {
        name: dto.name,
        description: dto.description,
        weight: Number(dto.weight),
        branchId,
        classId: dto.classId,
        level: dto.level,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async listExamTypes(context: TenantContext) {
    return this.prisma.examType.findMany({
      where: { branchId: this.branchId(context), isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createAssessmentComponent(dto: any, context: TenantContext) {
    const branchId =
      context.isSuperAdmin && dto.branchId
        ? dto.branchId
        : this.branchId(context);
    if (!dto.name || !dto.component || dto.weight == null)
      throw new BadRequestException('name, component and weight are required');
    const existing = await this.prisma.assessmentComponent.findFirst({
      where: {
        branchId,
        name: dto.name,
        classId: dto.classId || null,
        subjectId: dto.subjectId || null,
      },
    });
    if (existing)
      throw new BadRequestException(
        'Duplicate assessment component for this scope',
      );
    const scoped = await this.prisma.assessmentComponent.findMany({
      where: {
        branchId,
        classId: dto.classId || null,
        subjectId: dto.subjectId || null,
        isActive: true,
      },
    });
    const nextTotal =
      scoped.reduce((sum, item) => sum + item.weight, 0) + Number(dto.weight);
    if (nextTotal > 100)
      throw new BadRequestException(
        'Assessment component weights cannot exceed 100',
      );
    return this.prisma.assessmentComponent.create({
      data: {
        name: dto.name,
        component: dto.component,
        weight: Number(dto.weight),
        maxScore: dto.maxScore == null ? 100 : Number(dto.maxScore),
        branchId,
        classId: dto.classId,
        subjectId: dto.subjectId,
        curriculum: dto.curriculum,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async listAssessmentComponents(query: any, context: TenantContext) {
    const branchId =
      context.isSuperAdmin && query.branchId
        ? query.branchId
        : this.branchId(context);
    return this.prisma.assessmentComponent.findMany({
      where: {
        branchId,
        ...(query.classId && { classId: query.classId }),
        ...(query.subjectId && { subjectId: query.subjectId }),
        isActive: query.includeInactive === 'true' ? undefined : true,
      },
      orderBy: [{ classId: 'asc' }, { subjectId: 'asc' }, { name: 'asc' }],
    });
  }

  async validateComponentWeights(query: any, context: TenantContext) {
    const components = await this.listAssessmentComponents(query, context);
    const totalWeight = components.reduce(
      (sum, component) => sum + component.weight,
      0,
    );
    return { totalWeight, isComplete: totalWeight === 100, components };
  }
}
