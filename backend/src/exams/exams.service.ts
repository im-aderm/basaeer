import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import {
  CreateAcademicSessionDto,
  BulkSubmitScoresDto,
  RecordBehaviouralDto,
} from './dto/exam-ops.dto';
import { Term, ExamTerm } from '../generated/client/client';
import { ReportingService } from '../reporting/reporting.service';
import { BranchBrandingService } from '../branches/branch-branding.service';
import { END_OF_TERM_TEMPLATE } from '../reporting/templates/end-of-term.template';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import AdmZip from 'adm-zip';

@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reportingService: ReportingService,
    private readonly branchBrandingService: BranchBrandingService,
  ) {}

  private async logAction(
    userId: string,
    action: string,
    details: string,
    reason?: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        module: 'EXAMS',
        details,
        reason,
      },
    });
  }

  async createSession(dto: CreateAcademicSessionDto) {
    if (!dto.branchId) {
      throw new BadRequestException(
        'branchId is required to create an academic session',
      );
    }
    return this.prisma.academicSession.create({
      data: {
        ...dto,
        branchId: dto.branchId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async getAllSessions(context: TenantContext) {
    const where: any = {};
    if (!context.isSuperAdmin) {
      if (!context.branchId) throw new BadRequestException('User is not assigned to a branch');
      where.branchId = context.branchId;
    }
    return this.prisma.academicSession.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });
  }

  async submitBulkScores(dto: BulkSubmitScoresDto, branchId?: string) {
    const { subjectId, sectionId, sessionId, term, examTerm, scores } = dto;

    // Check if results are locked for any of these students
    for (const score of scores) {
      const isLocked = await this.prisma.resultSummary.findUnique({
        where: {
          studentId_sessionId_term: {
            studentId: score.studentId,
            sessionId,
            term,
          },
        },
        select: { isLocked: true },
      });
      if (isLocked?.isLocked) {
        throw new BadRequestException(
          `Results are locked for student ${score.studentId}.`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const records: any[] = [];

      const gradingScale = await tx.gradingScale.findMany({
        where: { branchId },
        orderBy: { minScore: 'desc' },
      });
      this.assertCompleteGradingScale(gradingScale, branchId);

      for (const score of scores) {
        let sBranchId = branchId;
        if (!sBranchId) {
          const student = await tx.student.findUnique({
            where: { id: score.studentId },
            select: { branchId: true },
          });
          sBranchId = student?.branchId;
        }
        if (!sBranchId) {
          throw new BadRequestException(
            `Branch ID not found for student ${score.studentId}.`,
          );
        }

        const total =
          (score.asgn1 || 0) +
          (score.asgn2 || 0) +
          (score.test1 || 0) +
          (score.test2 || 0) +
          (score.examScore || 0);

        const gradeInfo = this.calculateGradeFromScale(total, gradingScale);
        const grade = gradeInfo.grade;
        const remark = gradeInfo.remark;

        const record = await tx.assessmentRecord.upsert({
          where: {
            studentId_subjectId_sessionId_term: {
              studentId: score.studentId,
              subjectId,
              sessionId,
              term,
            },
          },
          update: {
            asgn1: score.asgn1,
            asgn2: score.asgn2,
            test1: score.test1,
            test2: score.test2,
            examScore: score.examScore,
            total,
            grade,
            remark,
            examTerm,
            branchId: sBranchId,
          },
          create: {
            studentId: score.studentId,
            subjectId,
            sectionId,
            sessionId,
            term,
            examTerm,
            asgn1: score.asgn1,
            asgn2: score.asgn2,
            test1: score.test1,
            test2: score.test2,
            examScore: score.examScore,
            total,
            grade,
            remark,
            branchId: sBranchId,
          },
        });
        records.push(record);
      }

      // Automatically trigger subject-level ranking update for this group
      await this.updateSubjectRanking(
        tx,
        subjectId,
        sectionId,
        sessionId,
        term,
      );

      return records;
    });
  }

  private assertCompleteGradingScale(scale: any[], branchId?: string) {
    if (!scale?.length) {
      throw new BadRequestException(
        `No grading scale configured for branch ${branchId || 'unknown'}. Configure grading before entering marks.`,
      );
    }
  }

  private calculateGradeFromScale(
    total: number,
    scale: any[],
  ): {
    grade: string;
    remark: string;
    gradePoint: number | null;
    classOfResult: string | null;
  } {
    this.assertCompleteGradingScale(scale);
    const match = scale.find((s) => total >= s.minScore && total <= s.maxScore);
    if (!match) {
      return {
        grade: 'Ungraded',
        remark: 'Score falls outside configured grading ranges',
        gradePoint: null,
        classOfResult: null,
      };
    }

    return {
      grade: match.grade,
      remark: match.remark || '',
      gradePoint:
        typeof match.gradePoint === 'number' ? match.gradePoint : null,
      classOfResult: match.classOfResult || null,
    };
  }

  private calculateAverageGradePoint(
    records: any[],
    gradingScale: any[],
  ): number | null {
    const eligible = records.filter((r: any) => r.isEligible);
    if (eligible.length === 0) return null;
    const points = eligible
      .map(
        (r) =>
          this.calculateGradeFromScale(r.total || 0, gradingScale).gradePoint,
      )
      .filter((point): point is number => point !== null);

    if (points.length !== eligible.length || points.length === 0) return null;
    return points.reduce((acc, point) => acc + point, 0) / points.length;
  }

  async lockResults(
    studentId: string,
    sessionId: string,
    term: Term,
    isLocked: boolean,
    context: TenantContext,
  ) {
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
      select: { branchId: true },
    });
    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }
    const branchId = student.branchId;

    return this.prisma.resultSummary.upsert({
      where: { studentId_sessionId_term: { studentId, sessionId, term } },
      update: { isLocked, branchId },
      create: {
        studentId,
        sessionId,
        term,
        isLocked,
        examTerm: ExamTerm.END_OF_SESSION,
        branchId,
      },
    });
  }

  async lockResultsBatch(
    sectionId: string,
    sessionId: string,
    term: Term,
    isLocked: boolean,
    context: TenantContext,
  ) {
    const section = await this.prisma.section.findFirst({
      where: TenantHelper.applyIsolation({ id: sectionId }, context),
      select: { id: true },
    });
    if (!section) {
      throw new NotFoundException(`Section ${sectionId} not found`);
    }

    return this.prisma.resultSummary.updateMany({
      where: {
        student: { sectionId },
        sessionId,
        term,
      },
      data: { isLocked },
    });
  }

  async toggleEligibility(
    studentId: string,
    subjectId: string,
    sessionId: string,
    term: Term,
    isEligible: boolean,
    context: TenantContext,
  ) {
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
      select: { id: true },
    });
    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    return this.prisma.assessmentRecord.update({
      where: {
        studentId_subjectId_sessionId_term: {
          studentId,
          subjectId,
          sessionId,
          term,
        },
      },
      data: { isEligible },
    });
  }

  async updateSubjectRanking(
    tx: any,
    subjectId: string,
    sectionId: string,
    sessionId: string,
    term: Term,
  ) {
    const records = await tx.assessmentRecord.findMany({
      where: { subjectId, sectionId, sessionId, term },
      orderBy: { total: 'desc' },
    });

    const outOf = records.length;
    if (outOf === 0) return;

    const totals = records.map((r: any) => r.total || 0);
    const highscore = Math.max(...totals);
    const lowscore = Math.min(...totals);
    const classAvg = totals.reduce((a: number, b: number) => a + b, 0) / outOf;

    let rank = 1;
    let prevTotal = -1;

    const updates: any[] = [];

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      if (Number(r.total || 0) < prevTotal) {
        rank = i + 1;
      }

      updates.push(
        tx.assessmentRecord.update({
          where: { id: r.id },
          data: {
            position: rank,
            outOf,
            highScore: highscore,
            lowScore: lowscore,
            classAvg: classAvg,
          },
        }),
      );
      prevTotal = Number(r.total || 0);
    }

    // Process in chunks to prevent transaction memory overload
    const chunkSize = 200;
    for (let i = 0; i < updates.length; i += chunkSize) {
      await Promise.all(updates.slice(i, i + chunkSize));
    }
  }

  async recordBehavioural(dto: RecordBehaviouralDto) {
    let branchId = dto.branchId;
    if (!branchId) {
      const student = await this.prisma.student.findUnique({
        where: { id: dto.studentId },
        select: { branchId: true },
      });
      if (!student) {
        throw new NotFoundException(`Student ${dto.studentId} not found`);
      }
      branchId = student.branchId;
    }

    return this.prisma.behaviouralRating.upsert({
      where: {
        studentId_sessionId_term: {
          studentId: dto.studentId,
          sessionId: dto.sessionId,
          term: dto.term,
        },
      },
      update: { ...dto, branchId },
      create: { ...dto, branchId },
    });
  }

  async computeSectionResults(
    sectionId: string,
    sessionId: string,
    term: Term,
    context: TenantContext,
  ) {
    const students = await this.prisma.student.findMany({
      where: TenantHelper.applyIsolation({ sectionId }, context),
      select: { id: true, branchId: true },
    });

    // The term summary computation is lightweight enough to do sequentially or in chunks
    // It's mostly database reads and aggregates, then one upsert.
    // Doing them all concurrently could overload Prisma connection pool, so chunk them.
    const chunkSize = 20;
    for (let i = 0; i < students.length; i += chunkSize) {
      const chunk = students.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map((student) =>
          this.generateTermSummary(
            student.id,
            sessionId,
            term,
            ExamTerm.END_OF_SESSION,
          ),
        ),
      );
    }

    return { success: true, count: students.length };
  }

  async generateTermSummary(
    studentId: string,
    sessionId: string,
    term: Term,
    examTerm: ExamTerm,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id: studentId },
        select: { branchId: true },
      });
      if (!student) {
        throw new NotFoundException(`Student ${studentId} not found`);
      }
      const branchId = student.branchId;

      const studentRecords = await tx.assessmentRecord.findMany({
        where: { studentId, sessionId, term },
      });

      if (studentRecords.length === 0) return null;

      // Batch fetch all scores for all records of this student
      const recordIds = studentRecords.map((r) => r.id);
      const allScores = await tx.assessmentScore.findMany({
        where: { recordId: { in: recordIds } },
        include: { component: true },
      });

      const scoresByRecord = allScores.reduce((acc: Record<string, any[]>, s: any) => {
        if (!acc[s.recordId]) acc[s.recordId] = [];
        acc[s.recordId].push(s);
        return acc;
      }, {});

      // Update all record totals dynamically before aggregating
      for (const record of studentRecords) {
        const scores = scoresByRecord[record.id] || [];

        if (scores.length > 0) {
          const total = scores.reduce((sum: number, s: any) => {
            const weight = s.component.weight || 0;
            const maxScore = s.component.maxScore || 100;
            const normalizedScore = maxScore > 0 ? (s.score / maxScore) * 100 : 0;
            return sum + (normalizedScore * (weight / 100));
          }, 0);
          
          const roundedTotal = Math.round(total * 100) / 100;
          await tx.assessmentRecord.update({
            where: { id: record.id },
            data: { total: roundedTotal },
          });
          (record as any).total = roundedTotal; // Update local object for aggregation below
        }
      }

      const totalScore = studentRecords.reduce(
        (acc, r) => acc + Number(r.total || 0),
        0,
      );
      const average = totalScore / studentRecords.length;
      const gradingScale = await tx.gradingScale.findMany({
        where: { branchId },
        orderBy: { minScore: 'desc' },
      });
      const finalGrade = this.calculateGradeFromScale(average, gradingScale);
      const cgpa = this.calculateAverageGradePoint(
        studentRecords,
        gradingScale,
      );

      // Calculate Attendance Stats
      // We'll fetch all attendance records for this student in this session
      const session = await tx.academicSession.findUnique({
        where: { id: sessionId },
      });
      if (!session) {
        // Should not happen if foreign keys are enforced, but good for safety
        throw new Error(`Session ${sessionId} not found`);
      }

      const attendanceRecords = await tx.attendance.findMany({
        where: {
          studentId,
          date: {
            gte: session.startDate,
            lte: session.endDate,
          },
        },
      });

      const attendancePresent = attendanceRecords.filter(
        (a) => a.status === 'PRESENT' || a.status === 'LATE',
      ).length;
      const attendanceAbsent = attendanceRecords.filter(
        (a) => a.status === 'ABSENT',
      ).length;
      const attendanceOpen = attendanceRecords.length;

      const summary = await tx.resultSummary.upsert({
        where: {
          studentId_sessionId_term: { studentId, sessionId, term },
        },
        update: {
          totalScore,
          average,
          examTerm,
          finalGrade: finalGrade.grade,
          finalRemark: finalGrade.remark,
          cgpa,
          classOfResult: finalGrade.classOfResult,
          promotionStatus: average >= 50 ? 'PROMOTED' : 'REQUIRES_REVIEW',
          attendancePresent,
          attendanceAbsent,
          attendanceOpen,
          branchId,
        },
        create: {
          studentId,
          sessionId,
          term,
          totalScore,
          average,
          examTerm,
          finalGrade: finalGrade.grade,
          finalRemark: finalGrade.remark,
          cgpa,
          classOfResult: finalGrade.classOfResult,
          promotionStatus: average >= 50 ? 'PROMOTED' : 'REQUIRES_REVIEW',
          attendancePresent,
          attendanceAbsent,
          attendanceOpen,
          branchId,
        },
      });

      // After updating this student, refresh class rankings for the summary
      if (studentRecords[0].sectionId) {
        await this.updateClassRanking(
          tx,
          studentRecords[0].sectionId,
          sessionId,
          term,
        );
      }

      return summary;
    });
  }

  async updateClassRanking(
    tx: any,
    sectionId: string,
    sessionId: string,
    term: Term,
  ) {
    const summaries = await tx.resultSummary.findMany({
      where: {
        student: { sectionId },
        sessionId,
        term,
      },
      orderBy: { average: 'desc' },
    });

    const countInClass = summaries.length;
    if (countInClass === 0) return;

    const averages = summaries.map((s: any) => s.average || 0);
    const highestAvg = Math.max(...averages);
    const lowestAvg = Math.min(...averages);

    let rank = 1;
    let prevAvg = -1;

    for (let i = 0; i < summaries.length; i++) {
      const s = summaries[i];
      if (s.average < prevAvg) {
        rank = i + 1;
      }

      await tx.resultSummary.update({
        where: { id: s.id },
        data: {
          classPosition: rank,
          countInClass,
          highestAvg,
          lowestAvg,
        },
      });
      prevAvg = s.average || 0;
    }
  }

  async formatReportData(dbData: any, currentTerm: Term) {
    const student = dbData;
    const summary = student.resultSummaries[0] || {};
    const rating = student.behaviouralRatings[0] || {};

    const schoolLogoSetting = await this.prisma.globalSetting.findFirst({
      where: { key: 'SCHOOL_LOGO', branchId: student.branchId },
    });
    const schoolWatermarkSetting = await this.prisma.globalSetting.findFirst({
      where: { key: 'SCHOOL_WATERMARK', branchId: student.branchId },
    });

    return {
      schoolName: student.branch?.name || '',
      schoolAddress: student.branch?.address || '',
      schoolLogo: schoolLogoSetting?.value || '',
      schoolWatermark: schoolWatermarkSetting?.value || '',
      studentPhoto: student.passportPhoto || '',
      reportType:
        currentTerm === Term.THIRD
          ? 'END OF SESSION REPORT SHEET'
          : 'END OF TERM REPORT SHEET',
      sessionName: student.resultSummaries[0]?.session?.name || '',
      nextTermBegins: student.resultSummaries[0]?.session?.nextTermBegins
        ? new Date(
            student.resultSummaries[0].session.nextTermBegins,
          ).toLocaleDateString()
        : 'N/A',
      termEnds: student.resultSummaries[0]?.session?.termEnds
        ? new Date(
            student.resultSummaries[0].session.termEnds,
          ).toLocaleDateString()
        : 'N/A',
      timesOpen: summary.attendanceOpen || 0,
      timesPresent: summary.attendancePresent || 0,
      timesAbsent: summary.attendanceAbsent || 0,
      studentName: `${student.user?.firstName} ${student.user?.lastName}`,
      admissionNo: student.user?.email.split('@')[0].toUpperCase(), // Using email as fallback for Reg No
      gender: student.gender || 'N/A',
      className: student.class?.name || 'N/A',
      sectionName: student.section?.name || '',
      termName: currentTerm + ' TERM',
      formTeacher: student.class?.classTeacher?.user
        ? `${student.class.classTeacher.user.firstName} ${student.class.classTeacher.user.lastName}`
        : 'N/A',
      noInClass: summary.countInClass || 0,
      overallAvg: (summary.average || 0).toFixed(1),
      totalScore: (summary.totalScore || 0).toFixed(1),
      classPosition: this.ordinal(summary.classPosition || 0),
      highestAvg: (summary.highestAvg || 0).toFixed(1),
      lowestAvg: (summary.lowestAvg || 0).toFixed(1),
      finalGrade: summary.finalGrade || 'N/A',
      finalRemark: summary.finalRemark || '',
      cgpa: summary.cgpa != null ? summary.cgpa.toFixed(2) : '',
      classOfResult: summary.classOfResult || '',

      // Assessment Records (only eligible ones)
      subjects: student.assessmentRecords
        .filter((r: any) => r.isEligible)
        .map((r: any) => {
          // Dynamic Scores Map
          const scoresMap: Record<string, number> = {};
          if (r.scores) {
            r.scores.forEach((s: any) => {
              scoresMap[s.component.component] = s.score;
            });
          }

          return {
            name: r.subject?.name,
            dynamicScores: scoresMap,
            total: (r.total || 0).toFixed(1),
            grade: r.grade || '-',
            position: this.ordinal(r.position || 0),
            outOf: r.outOf || 0,
            low: (r.lowScore || 0).toFixed(1),
            high: (r.highScore || 0).toFixed(1),
            classAvg: (r.classAvg || 0).toFixed(1),
            remark: r.remark || '',
          };
        }),
      
      // Headers for Dynamic Table
      assessmentHeaders: Array.from(new Set(
        student.assessmentRecords
          .flatMap((r: any) => r.scores?.map((s: any) => s.component.component) || [])
      )),

      // Behavioural
      behavioural: [
        { category: 'Punctuality', rating: rating.punctuality || '-' },
        { category: 'Class Attendance', rating: rating.classAttendance || '-' },
        { category: 'Attentiveness', rating: rating.attentiveness || '-' },
        { category: 'Neatness', rating: rating.neatness || '-' },
        { category: 'Honesty', rating: rating.honesty || '-' },
        { category: 'Self Control', rating: rating.selfControl || '-' },
        {
          category: 'Relationship with others',
          rating: rating.relationships || '-',
        },
        { category: 'Games/Sports', rating: rating.sports || '-' },
        {
          category: 'Handling of tools, lab & Workshops',
          rating: rating.toolHandling || '-',
        },
        {
          category: 'Carrying out assignments',
          rating: rating.carryingOutAssignments || '-',
        },
        {
          category: 'Participation in school activities',
          rating: rating.participation || '-',
        },
      ],
    };
  }

  private ordinal(n: number): string {
    if (n === 0) return '-';
    const s = ['th', 'st', 'nd', 'rd'],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  async getFullReportData(studentId: string, sessionId: string, term: Term, context: TenantContext) {
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
      include: {
        user: true,
        class: {
          include: { classTeacher: { include: { user: true } } },
        },
        section: true,
        branch: true,
        assessmentRecords: {
          where: { sessionId, term },
          include: { subject: true },
        },
        behaviouralRatings: {
          where: { sessionId, term },
        },
        resultSummaries: {
          where: { sessionId, term },
          include: { session: true },
        },
      },
    });

    if (!student) return null;

    const branding = await this.branchBrandingService.getBranding(student.branchId);
    return { ...student, branding };
  }

  async generateAnnualCumulative(studentId: string, sessionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id: studentId },
        select: { branchId: true },
      });
      if (!student) {
        throw new NotFoundException(`Student ${studentId} not found`);
      }
      const branchId = student.branchId;

      const allTermsRecords = await tx.assessmentRecord.findMany({
        where: { studentId, sessionId },
        include: { subject: true },
      });
      const gradingScale = await tx.gradingScale.findMany({
        where: { branchId },
        orderBy: { minScore: 'desc' },
      });

      // Group by subject
      const subjectAverages: Record<string, any> = {};
      for (const record of allTermsRecords) {
        if (!subjectAverages[record.subjectId]) {
          subjectAverages[record.subjectId] = {
            total: 0,
            count: 0,
            subject: record.subject,
          };
        }
        subjectAverages[record.subjectId].total += Number(record.total || 0);
        subjectAverages[record.subjectId].count += 1;
      }

      const results = Object.keys(subjectAverages).map((subjectId) => {
        const data = subjectAverages[subjectId];
        const annualAvg = data.total / data.count;
        return {
          subjectId,
          subjectName: data.subject.name,
          annualAvg,
          grade: this.calculateGradeFromScale(annualAvg, gradingScale).grade,
        };
      });

      const overallAvg =
        results.reduce((acc, r) => acc + r.annualAvg, 0) / results.length;
      const finalGrade = this.calculateGradeFromScale(overallAvg, gradingScale);
      const cgpa = this.calculateAverageGradePoint(
        allTermsRecords,
        gradingScale,
      );

      return tx.resultSummary.upsert({
        where: {
          studentId_sessionId_term: { studentId, sessionId, term: Term.THIRD }, // Third term usually holds the annual data
        },
        update: {
          average: overallAvg, // This could be the session average
          finalGrade: finalGrade.grade,
          finalRemark: finalGrade.remark,
          cgpa,
          classOfResult: finalGrade.classOfResult,
          examTerm: ExamTerm.ANNUAL_CUMULATIVE,
          branchId,
        },
        create: {
          studentId,
          sessionId,
          term: Term.THIRD,
          average: overallAvg,
          examTerm: ExamTerm.ANNUAL_CUMULATIVE,
          finalGrade: finalGrade.grade,
          finalRemark: finalGrade.remark,
          cgpa,
          classOfResult: finalGrade.classOfResult,
          branchId,
        },
      });
    });
  }

  async formatAnnualReportData(studentId: string, sessionId: string, context: TenantContext) {
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
      include: {
        user: true,
        class: true,
        section: true,
        branch: true,
        assessmentRecords: {
          where: { sessionId },
          include: { subject: true, session: true },
          orderBy: { term: 'asc' },
        },
        resultSummaries: {
          where: { sessionId, examTerm: ExamTerm.ANNUAL_CUMULATIVE },
          include: { session: true },
        },
      },
    });

    if (!student) return null;

    const summary = student.resultSummaries[0] || {};

    const schoolLogoSetting = await this.prisma.globalSetting.findFirst({
      where: { key: 'SCHOOL_LOGO', branchId: student.branchId },
    });
    const schoolWatermarkSetting = await this.prisma.globalSetting.findFirst({
      where: { key: 'SCHOOL_WATERMARK', branchId: student.branchId },
    });
    const gradingScale = await this.prisma.gradingScale.findMany({
      where: { branchId: student.branchId },
      orderBy: { minScore: 'desc' },
    });

    // Group records by subject
    const subjectsMap: Record<string, any> = {};
    for (const r of student.assessmentRecords) {
      if (!subjectsMap[r.subjectId]) {
        subjectsMap[r.subjectId] = {
          name: r.subject.name,
          t1: null,
          t2: null,
          t3: null,
        };
      }
      if (r.term === Term.FIRST) subjectsMap[r.subjectId].t1 = r;
      if (r.term === Term.SECOND) subjectsMap[r.subjectId].t2 = r;
      if (r.term === Term.THIRD) subjectsMap[r.subjectId].t3 = r;
    }

    const subjects = Object.values(subjectsMap).map((s: any) => {
      const counts = [s.t1, s.t2, s.t3].filter((v) => v !== null).length;
      const total =
        (s.t1?.total || 0) + (s.t2?.total || 0) + (s.t3?.total || 0);
      const annualAvg = counts > 0 ? total / counts : 0;

      return {
        name: s.name,
        term1Score: s.t1?.total?.toFixed(1) || '-',
        term1Pos: this.ordinal(s.t1?.position || 0),
        term1Grade: s.t1?.grade || '-',
        term2Score: s.t2?.total?.toFixed(1) || '-',
        term2Pos: this.ordinal(s.t2?.position || 0),
        term2Grade: s.t2?.grade || '-',
        term3Score: s.t3?.total?.toFixed(1) || '-',
        term3Pos: this.ordinal(s.t3?.position || 0),
        term3Grade: s.t3?.grade || '-',
        annualAvg: annualAvg.toFixed(1),
        classAvg: s.t3?.classAvg?.toFixed(1) || '-',
        annualGrade: this.calculateGradeFromScale(annualAvg, gradingScale)
          .grade,
        annualRemark: this.calculateGradeFromScale(annualAvg, gradingScale)
          .remark,
      };
    });

    let branding = null;
    if (student.branchId) {
      branding = await this.branchBrandingService.getBranding(student.branchId);
    }

    return {
      schoolName: student.branch?.name || '',
      schoolLogo: schoolLogoSetting?.value || '',
      schoolWatermark: schoolWatermarkSetting?.value || '',
      logoUrl: branding?.logoUrl || schoolLogoSetting?.value || null,
      primaryColor: branding?.primaryColor || '#2563EB',
      sessionName: student.assessmentRecords[0]?.session?.name || '',
      studentName: `${student.user?.firstName} ${student.user?.lastName}`,
      studentPhoto: student.passportPhoto || null,
      className: student.class?.name || 'N/A',
      classPosition: this.ordinal(summary.classPosition || 0),
      totalAnnualScore: subjects
        .reduce((acc, s) => acc + parseFloat(s.annualAvg), 0)
        .toFixed(1),
      overallAnnualAvg: (summary.average || 0).toFixed(1),
      cgpa: summary.cgpa != null ? summary.cgpa.toFixed(2) : '',
      classOfResult: summary.classOfResult || '',
      promotionStatus: summary.promotionStatus || '',
      finalRemark: summary.finalRemark || '',
      subjects,
    };
  }

  async getBroadsheetData(sectionId: string, sessionId: string, term: Term, context: TenantContext) {
    const students = await this.prisma.student.findMany({
      where: TenantHelper.applyIsolation({ sectionId }, context),
      include: {
        user: true,
        assessmentRecords: {
          where: { sessionId, term },
          include: { subject: true },
        },
        resultSummaries: {
          where: { sessionId, term },
          select: { classPosition: true },
        },
      },
      orderBy: { user: { lastName: 'asc' } },
    });

    // Get unique subjects for headers
    const subjects = await this.prisma.subject.findMany({
      where: {
        assessmentRecords: {
          some: { sectionId, sessionId, term },
        },
      },
    });

    const headers = [
      'Student Name',
      ...subjects.map((s) => s.name),
      'Total',
      'Average',
      'Position',
    ];

    const rows = students.map((student) => {
      const studentRow: any[] = [
        `${student.user?.firstName || ''} ${student.user?.lastName || ''}`,
      ];
      let studentTotal = 0;

      subjects.forEach((subject) => {
        const record = student.assessmentRecords.find(
          (r) => r.subjectId === subject.id,
        );
        const score = Number(record?.total || 0);
        studentRow.push(score);
        studentTotal += score;
      });

      const avg =
        student.assessmentRecords.length > 0
          ? studentTotal / student.assessmentRecords.length
          : 0;
      studentRow.push(studentTotal.toFixed(1));
      studentRow.push(avg.toFixed(1));

      studentRow.push(student.resultSummaries[0]?.classPosition || '');

      return studentRow;
    });

    let branding = null;
    if (students.length > 0) {
      branding = await this.branchBrandingService.getBranding(students[0].branchId);
    }

    return { headers, rows, branding };
  }

  async getGradingScales(branchId: string) {
    return this.prisma.gradingScale.findMany({
      where: { branchId },
      orderBy: { minScore: 'desc' },
    });
  }

  async createGradingScale(dto: any, branchId: string) {
    return this.prisma.gradingScale.create({
      data: {
        ...dto,
        branchId,
      },
    });
  }

  async generateBatchZip(
    sectionId: string,
    sessionId: string,
    term: Term,
    context: TenantContext,
  ): Promise<{ fileUrl: string; fileSize: number }> {
    const students = await this.prisma.student.findMany({
      where: TenantHelper.applyIsolation({ sectionId }, context),
      include: { user: true },
    });

    const exportDir = path.join(process.cwd(), 'public', 'uploads', 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const fileName = `ReportCards_${sectionId}_${sessionId}_${Date.now()}.zip`;
    const filePath = path.join(exportDir, fileName);
    const output = fs.createWriteStream(filePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        const stats = fs.statSync(filePath);
        resolve({
          fileUrl: `/public/uploads/exports/${fileName}`,
          fileSize: stats.size,
        });
      });

      archive.on('error', (err: any) =>
        reject(err instanceof Error ? err : new Error(String(err))),
      );
      archive.pipe(output);

      const processStudents = async () => {
        try {
          for (const student of students) {
            const data = await this.getFullReportData(
              student.id,
              sessionId,
              term,
              context,
            );
            if (!data) continue;

            const formatted = await this.formatReportData(data, term);
            const html = await this.reportingService.fillTemplate(
              END_OF_TERM_TEMPLATE,
              formatted,
            );
            const pdfBuffer = await this.reportingService.generatePdf(html);

            if (!student.user) continue;
            const pdfName =
              `${student.user.lastName}_${student.user.firstName}_${student.user.email.split('@')[0]}.pdf`.replace(
                /\s+/g,
                '_',
              );

            archive.append(pdfBuffer, { name: pdfName });
          }
          archive.finalize();
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      };

      processStudents();
    });
  }
}
