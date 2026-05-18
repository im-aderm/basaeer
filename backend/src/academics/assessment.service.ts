import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssessmentComponentDto, BulkRecordMarksDto } from './dto/assessment.dto';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import { Term, ExamTerm } from '../generated/client/client';

@Injectable()
export class AssessmentService {
  constructor(private prisma: PrismaService) {}

  async createComponent(dto: CreateAssessmentComponentDto, context: TenantContext) {
    const branchId = context.branchId;
    if (!branchId) throw new BadRequestException('Branch context required');

    return this.prisma.assessmentComponent.create({
      data: {
        name: dto.name,
        component: dto.name,
        weight: dto.weight,
        maxScore: dto.maxScore,
        isExam: dto.isExam ?? false,
        classId: dto.classId,
        subjectId: dto.subjectId,
        branchId,
        sessionId: context.sessionId,
      },
    });
  }

  async updateComponent(id: string, dto: Partial<CreateAssessmentComponentDto>, context: TenantContext) {
    const existing = await this.prisma.assessmentComponent.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException('Assessment component not found');

    return this.prisma.assessmentComponent.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name, component: dto.name }),
        ...(dto.weight !== undefined && { weight: dto.weight }),
        ...(dto.maxScore !== undefined && { maxScore: dto.maxScore }),
        ...(dto.isExam !== undefined && { isExam: dto.isExam }),
        ...(dto.classId !== undefined && { classId: dto.classId }),
        ...(dto.subjectId !== undefined && { subjectId: dto.subjectId }),
      },
    });
  }

  async deleteComponent(id: string, context: TenantContext) {
    const existing = await this.prisma.assessmentComponent.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException('Assessment component not found');

    return this.prisma.assessmentComponent.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getComponents(context: TenantContext, classId?: string, subjectId?: string) {
    return this.prisma.assessmentComponent.findMany({
      where: TenantHelper.applyIsolation({
        classId,
        subjectId,
        isActive: true,
      }, context),
    });
  }

  /**
   * Bulk record marks for a specific component across multiple students
   */
  async recordBulkMarks(dto: BulkRecordMarksDto, context: TenantContext) {
    const branchId = context.branchId;
    if (!branchId) throw new BadRequestException('Branch context required');

    // Verify component belongs to branch (IDOR fix)
    const component = await this.prisma.assessmentComponent.findFirst({
      where: TenantHelper.applyIsolation({ id: dto.componentId }, context),
    });

    if (!component) throw new NotFoundException('Assessment component not found');

    return this.prisma.$transaction(async (tx) => {
      const results = [];
      for (const entry of dto.marks) {
        // Verify student belongs to branch (IDOR fix)
        const student = await tx.student.findFirst({
          where: TenantHelper.applyIsolation({ id: entry.studentId }, context),
        });
        if (!student) continue;

        // 1. Get or create the AssessmentRecord (Header)
        let record = await tx.assessmentRecord.findUnique({
          where: {
            studentId_subjectId_sessionId_term: {
              studentId: entry.studentId,
              subjectId: component.subjectId!,
              sessionId: dto.sessionId,
              term: dto.term as Term,
            },
          },
        });

        if (!record) {
          record = await tx.assessmentRecord.create({
            data: {
              studentId: entry.studentId,
              subjectId: component.subjectId!,
              sessionId: dto.sessionId,
              term: dto.term as Term,
              examTerm: dto.term?.includes('FIRST') ? ExamTerm.FIRST_TERM : dto.term?.includes('SECOND') ? ExamTerm.SECOND_TERM : ExamTerm.THIRD_TERM,
              sectionId: student.sectionId!,
              branchId,
            },
          });
        }

        // 2. Upsert the score
        const score = await tx.assessmentScore.upsert({
          where: {
            recordId_componentId: {
              recordId: record.id,
              componentId: component.id,
            },
          },
          update: { score: entry.score },
          create: {
            recordId: record.id,
            componentId: component.id,
            studentId: entry.studentId,
            score: entry.score,
          },
        });

        // 3. Recalculate total for the record
        await this.internalCalculateTotal(tx, record.id);
        
        results.push(score);
      }
      return results;
    });
  }

  /**
   * Internal method to calculate total within a transaction
   */
  private async internalCalculateTotal(tx: any, recordId: string): Promise<number> {
    const scores = await tx.assessmentScore.findMany({
      where: { recordId },
      include: { component: true },
    });

    if (scores.length === 0) return 0;

    const total = scores.reduce((sum: number, s: any) => {
      const weight = s.component.weight || 0;
      const maxScore = s.component.maxScore || 100;
      const normalizedScore = maxScore > 0 ? (s.score / maxScore) * 100 : 0;
      return sum + (normalizedScore * (weight / 100));
    }, 0);

    const roundedTotal = Math.round(total * 100) / 100;
    
    await tx.assessmentRecord.update({
      where: { id: recordId },
      data: { total: roundedTotal },
    });

    return roundedTotal;
  }

  /**
   * Calculate CA Total (Continuous Assessment) excluding exams for Open Day reports
   */
  async calculateCATotal(recordId: string, context: TenantContext): Promise<number> {
    const record = await this.prisma.assessmentRecord.findFirst({
      where: TenantHelper.applyIsolation({ id: recordId }, context),
    });
    if (!record) throw new NotFoundException('Assessment record not found');

    const scores = await this.prisma.assessmentScore.findMany({
      where: { recordId },
      include: { component: true },
    });

    const caScores = scores.filter(s => !s.component.isExam);
    
    const total = caScores.reduce<number>((sum, s) => {
      const weight = s.component.weight || 0;
      const maxScore = s.component.maxScore || 100;
      const normalizedScore = maxScore > 0 ? (s.score / maxScore) * 100 : 0;
      return sum + (normalizedScore * (weight / 100));
    }, 0);

    return Math.round(total * 100) / 100;
  }

  /**
   * Generate Open Day Performance data for a student
   */
  async getOpenDayPerformance(studentId: string, sessionId: string, term: Term, context: TenantContext) {
    const records = await this.prisma.assessmentRecord.findMany({
      where: TenantHelper.applyIsolation({
        studentId,
        sessionId,
        term,
      }, context),
      include: {
        subject: true,
        scores: {
          include: { component: true },
          where: { component: { isExam: false } }
        }
      }
    });

    return records.map(r => {
      const caTotal = r.scores.reduce<number>((sum, s) => {
        const weight = s.component.weight || 0;
        const maxScore = s.component.maxScore || 100;
        const normalizedScore = maxScore > 0 ? (s.score / maxScore) * 100 : 0;
        return sum + (normalizedScore * (weight / 100));
      }, 0);

      return {
        subject: r.subject.name,
        assessments: r.scores.map(s => ({
          name: s.component.name,
          score: s.score,
          maxScore: s.component.maxScore,
          weight: s.component.weight,
        })),
        caTotal: Math.round(caTotal * 100) / 100,
      };
    });
  }

  /**
   * Calculate total score for an AssessmentRecord based on weighted AssessmentScore entries.
   * Each score is multiplied by its component weight / 100 to get the weighted contribution.
   */
  async calculateTotal(recordId: string, context: TenantContext): Promise<number> {
    const record = await this.prisma.assessmentRecord.findFirst({
      where: TenantHelper.applyIsolation({ id: recordId }, context),
    });
    if (!record) throw new NotFoundException('Assessment record not found');
    return this.internalCalculateTotal(this.prisma, recordId);
  }

  /**
   * Get all scores for a record grouped by component
   */
  async getScoresByRecord(recordId: string, context: TenantContext) {
    const record = await this.prisma.assessmentRecord.findFirst({
      where: TenantHelper.applyIsolation({ id: recordId }, context),
    });
    if (!record) throw new NotFoundException('Assessment record not found');

    const scores = await this.prisma.assessmentScore.findMany({
      where: { recordId },
      include: {
        component: {
          select: { id: true, name: true, weight: true, maxScore: true, isExam: true },
        },
      },
    });

    return scores.map((s) => ({
      id: s.id,
      score: s.score,
      componentName: s.component.name,
      weight: s.component.weight,
      maxScore: s.component.maxScore,
      isExam: s.component.isExam,
      weightedContribution: s.component.maxScore > 0
        ? Math.round((s.score / s.component.maxScore) * s.component.weight * 100) / 100
        : 0,
    }));
  }

  async updateScore(scoreId: string, score: number, context: TenantContext) {
    const existing = await this.prisma.assessmentScore.findUnique({
      where: { id: scoreId },
      include: {
        component: true,
        record: true,
      },
    });
    if (!existing) throw new NotFoundException('Score not found');

    // Verify branch ownership (IDOR fix)
    if (!context.isSuperAdmin && existing.record.branchId !== context.branchId) {
      throw new ForbiddenException('Access denied: score does not belong to your branch');
    }

    const maxScore = existing.component.maxScore;
    if (score < 0 || score > maxScore) {
      throw new BadRequestException(`Score must be between 0 and ${maxScore}`);
    }

    const result = await this.prisma.assessmentScore.update({
      where: { id: scoreId },
      data: { score },
    });

    await this.internalCalculateTotal(this.prisma, existing.recordId);
    return result;
  }

  async deleteScore(scoreId: string, context: TenantContext) {
    const existing = await this.prisma.assessmentScore.findUnique({
      where: { id: scoreId },
      include: { record: true },
    });
    if (!existing) throw new NotFoundException('Score not found');

    // Verify branch ownership (IDOR fix)
    if (!context.isSuperAdmin && existing.record.branchId !== context.branchId) {
      throw new ForbiddenException('Access denied: score does not belong to your branch');
    }

    await this.prisma.assessmentScore.delete({ where: { id: scoreId } });
    await this.internalCalculateTotal(this.prisma, existing.recordId);
    return { deleted: true };
  }
}
