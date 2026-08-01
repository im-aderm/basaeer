import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import { ExamTerm, Term } from '../generated/client/client';
import { findGradeMatch } from './grading.util';

const EXAM_TERM_BY_TERM: Record<Term, ExamTerm> = {
  FIRST: ExamTerm.FIRST_TERM,
  SECOND: ExamTerm.SECOND_TERM,
  THIRD: ExamTerm.THIRD_TERM,
};

@Injectable()
export class ResultComputationService {
  constructor(private readonly prisma: PrismaService) {}

  private requireBranch(context: TenantContext): string {
    if (!context.branchId)
      throw new ForbiddenException('Branch context required');
    return context.branchId;
  }

  private async audit(
    userId: string | undefined,
    action: string,
    details: string,
  ) {
    if (!userId) return;
    await this.prisma.auditLog.create({
      data: { userId, action, module: 'RESULTS', details },
    });
  }

  private async gradingScale(branchId: string) {
    const scale = await this.prisma.gradingScale.findMany({
      where: { branchId, isActive: true },
      orderBy: { minScore: 'desc' },
    });
    if (!scale.length)
      throw new BadRequestException(
        'No active grading scale configured for this branch',
      );
    return scale;
  }

  private gradeFor(score: number, scale: any[]) {
    const match = findGradeMatch(score, scale);
    if (!match)
      throw new BadRequestException(
        `Score ${score} is outside configured grading ranges`,
      );
    return match;
  }

  async computeSection(
    sectionId: string,
    sessionId: string,
    term: Term,
    context: TenantContext,
  ) {
    const branchId = this.requireBranch(context);
    const section = await this.prisma.section.findFirst({
      where: { id: sectionId, class: { branchId } },
      include: { class: true },
    });
    if (!section) throw new NotFoundException('Section not found');

    const published = await this.prisma.resultPublication.findFirst({
      where: { branchId, sessionId, term, sectionId, isPublished: true },
    });
    if (published)
      throw new ForbiddenException('Published results are immutable');

    const scale = await this.gradingScale(branchId);
    const students = await this.prisma.student.findMany({
      where: { branchId, sectionId },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }, { id: 'asc' }],
      select: { id: true, firstName: true, lastName: true },
    });

    const summaries: Array<{
      studentId: string;
      average: number;
      total: number;
      name: string;
    }> = [];

    await this.prisma.$transaction(async (tx) => {
      // Batch-load all assessment records for all students at once (fix N+1)
      const allRecords = await tx.assessmentRecord.findMany({
        where: {
          branchId,
          studentId: { in: students.map((s) => s.id) },
          sessionId,
          term,
          isEligible: true,
        },
        orderBy: [{ subjectId: 'asc' }],
      });

      const recordsByStudent = new Map<string, typeof allRecords>();
      for (const record of allRecords) {
        const existing = recordsByStudent.get(record.studentId) || [];
        existing.push(record);
        recordsByStudent.set(record.studentId, existing);
      }

      for (const student of students) {
        const records = recordsByStudent.get(student.id) || [];
        if (!records.length) continue;

        const total = records.reduce(
          (sum, record) => sum + Number(record.total || 0),
          0,
        );
        const average = total / records.length;
        const grade = this.gradeFor(average, scale);
        const points = records.map(
          (record) => this.gradeFor(Number(record.total || 0), scale).gradePoint,
        );
        const validPoints = points.filter(
          (point): point is number => typeof point === 'number',
        );
        const gpa =
          validPoints.length === records.length
            ? validPoints.reduce((sum, point) => sum + point, 0) /
              validPoints.length
            : null;

        await tx.resultSummary.upsert({
          where: {
            studentId_sessionId_term: {
              studentId: student.id,
              sessionId,
              term,
            },
          },
          update: {
            totalScore: total,
            average,
            finalGrade: grade.grade,
            finalRemark: grade.remark,
            cgpa: gpa,
            classOfResult: grade.classOfResult,
            promotionStatus:
              grade.classOfResult === 'FAIL' ? 'REQUIRES_REVIEW' : 'PROMOTED',
            examTerm: EXAM_TERM_BY_TERM[term],
            branchId,
          },
          create: {
            studentId: student.id,
            sessionId,
            term,
            totalScore: total,
            average,
            finalGrade: grade.grade,
            finalRemark: grade.remark,
            cgpa: gpa,
            classOfResult: grade.classOfResult,
            promotionStatus:
              grade.classOfResult === 'FAIL' ? 'REQUIRES_REVIEW' : 'PROMOTED',
            examTerm: EXAM_TERM_BY_TERM[term],
            branchId,
          },
        });

        if (gpa !== null) {
          await tx.gPARecord.upsert({
            where: {
              studentId_sessionId_term: {
                studentId: student.id,
                sessionId,
                term,
              },
            },
            update: {
              totalGradePoint: validPoints.reduce(
                (sum, point) => sum + point,
                0,
              ),
              creditUnits: validPoints.length,
              gpa,
              cgpa: gpa,
              branchId,
            },
            create: {
              studentId: student.id,
              sessionId,
              term,
              totalGradePoint: validPoints.reduce(
                (sum, point) => sum + point,
                0,
              ),
              creditUnits: validPoints.length,
              gpa,
              cgpa: gpa,
              branchId,
            },
          });
        }

        summaries.push({
          studentId: student.id,
          average,
          total,
          name: `${student.lastName} ${student.firstName}`,
        });
      }

      const ranked = [...summaries].sort(
        (a, b) =>
          b.average - a.average ||
          a.name.localeCompare(b.name) ||
          a.studentId.localeCompare(b.studentId),
      );
      let rank = 0;
      let previousScore: number | null = null;
      for (const [index, item] of ranked.entries()) {
        if (previousScore === null || item.average < previousScore) rank += 1;
        previousScore = item.average;
        await tx.resultSummary.update({
          where: {
            studentId_sessionId_term: {
              studentId: item.studentId,
              sessionId,
              term,
            },
          },
          data: {
            classPosition: rank,
            countInClass: ranked.length,
            highestAvg: ranked[0]?.average || 0,
            lowestAvg: ranked[ranked.length - 1]?.average || 0,
          },
        });
        await tx.studentRanking.upsert({
          where: {
            studentId_sessionId_term_scope_scopeId: {
              studentId: item.studentId,
              sessionId,
              term,
              scope: 'SECTION',
              scopeId: sectionId,
            },
          },
          update: { score: item.average, rank, outOf: ranked.length, branchId },
          create: {
            studentId: item.studentId,
            sessionId,
            term,
            scope: 'SECTION',
            scopeId: sectionId,
            score: item.average,
            rank,
            outOf: ranked.length,
            branchId,
            tieGroup: String(index),
          },
        });
      }

      await this.computeSubjectPositions(
        tx,
        branchId,
        sectionId,
        sessionId,
        term,
      );
    });

    await this.audit(
      context.userId,
      'RESULT_COMPUTED',
      `Computed ${summaries.length} student summaries for section ${sectionId}, session ${sessionId}, term ${term}`,
    );
    return { sectionId, sessionId, term, computedStudents: summaries.length };
  }

  private async computeSubjectPositions(
    tx: any,
    branchId: string,
    sectionId: string,
    sessionId: string,
    term: Term,
  ) {
    const records = await tx.assessmentRecord.findMany({
      where: { branchId, sectionId, sessionId, term, isEligible: true },
      include: { student: { select: { firstName: true, lastName: true } } },
    });
    const bySubject = new Map<string, any[]>();
    for (const record of records) {
      bySubject.set(record.subjectId, [
        ...(bySubject.get(record.subjectId) || []),
        record,
      ]);
    }

    for (const [subjectId, subjectRecords] of bySubject.entries()) {
      const ranked = subjectRecords.sort(
        (a, b) =>
          Number(b.total || 0) - Number(a.total || 0) ||
          `${a.student.lastName} ${a.student.firstName}`.localeCompare(
            `${b.student.lastName} ${b.student.firstName}`,
          ) ||
          a.studentId.localeCompare(b.studentId),
      );
      let rank = 0;
      let previousScore: number | null = null;
      const totals = ranked.map((record) => Number(record.total || 0));
      for (const record of ranked) {
        const score = Number(record.total || 0);
        if (previousScore === null || score < previousScore) rank += 1;
        previousScore = score;
        await tx.assessmentRecord.update({
          where: { id: record.id },
          data: {
            position: rank,
            outOf: ranked.length,
            highScore: Math.max(...totals),
            lowScore: Math.min(...totals),
            classAvg: totals.reduce((a, b) => a + b, 0) / totals.length,
          },
        });
        await tx.subjectPosition.upsert({
          where: {
            studentId_subjectId_sessionId_term: {
              studentId: record.studentId,
              subjectId,
              sessionId,
              term,
            },
          },
          update: {
            score,
            position: rank,
            outOf: ranked.length,
            branchId,
            sectionId,
          },
          create: {
            studentId: record.studentId,
            subjectId,
            sessionId,
            term,
            score,
            position: rank,
            outOf: ranked.length,
            branchId,
            sectionId,
          },
        });
      }
    }
  }

  async analytics(sessionId: string, term: Term, context: TenantContext) {
    const branchId = this.requireBranch(context);
    const [summaries, grades, subjects] = await Promise.all([
      this.prisma.resultSummary.findMany({
        where: { branchId, sessionId, term },
      }),
      this.prisma.resultSummary.groupBy({
        by: ['finalGrade'],
        where: { branchId, sessionId, term },
        _count: { _all: true },
      }),
      this.prisma.assessmentRecord.groupBy({
        by: ['subjectId'],
        where: { branchId, sessionId, term },
        _avg: { total: true },
        _count: { _all: true },
      }),
    ]);
    const averages = summaries.map((summary) => summary.average || 0);
    return {
      totalResults: summaries.length,
      average: averages.length
        ? averages.reduce((a: number, b: any) => a + (typeof b === "number" ? b : (b as any).toNumber?.() ?? 0), 0) / averages.length
        : 0,
      highest: averages.length ? Math.max(...averages.map((a: any) => typeof a === "number" ? a : (a as any).toNumber?.() ?? 0)) : 0,
      lowest: averages.length ? Math.min(...averages.map((a: any) => typeof a === "number" ? a : (a as any).toNumber?.() ?? 0)) : 0,
      gradeDistribution: grades.map((grade) => ({
        grade: grade.finalGrade || 'UNASSIGNED',
        count: grade._count._all,
      })),
      subjectDifficulty: subjects.map((subject) => ({
        subjectId: subject.subjectId,
        average: subject._avg.total || 0,
        entries: subject._count._all,
      })),
    };
  }
}
