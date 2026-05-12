import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import { Term, UserRole } from '../generated/client/client';

@Injectable()
export class AcademicPortalService {
  constructor(private readonly prisma: PrismaService) {}

  private branchId(context: TenantContext) {
    if (!context.branchId)
      throw new ForbiddenException('Branch context required');
    return context.branchId;
  }

  private async assertAccess(studentId: string, context: TenantContext) {
    const branchId = this.branchId(context);
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, branchId },
      include: { user: true },
    });
    if (!student) throw new NotFoundException('Student not found');
    const staffRoles: UserRole[] = [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_ADMIN,
      UserRole.PRINCIPAL,
      UserRole.EXAM_OFFICER,
      UserRole.ACADEMIC_OFFICER,
      UserRole.HOD,
      UserRole.TEACHER,
    ];
    if (staffRoles.includes(context.role)) return student;
    if (context.role === UserRole.STUDENT && student.userId === context.userId)
      return student;
    if (context.role === UserRole.PARENT && student.parentId === context.userId)
      return student;
    throw new ForbiddenException(
      'You are not authorized to access this student result',
    );
  }

  async result(
    studentId: string,
    sessionId: string,
    term: Term,
    context: TenantContext,
  ) {
    await this.assertAccess(studentId, context);
    const branchId = this.branchId(context);
    const publication = await this.prisma.resultPublication.findFirst({
      where: { branchId, sessionId, term, isPublished: true },
    });
    const unpublishedAccessRoles: UserRole[] = [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_ADMIN,
      UserRole.PRINCIPAL,
      UserRole.EXAM_OFFICER,
      UserRole.ACADEMIC_OFFICER,
    ];
    if (!publication && !unpublishedAccessRoles.includes(context.role)) {
      throw new ForbiddenException('Result has not been published');
    }
    const [summary, records, rankings] = await Promise.all([
      this.prisma.resultSummary.findUnique({
        where: { studentId_sessionId_term: { studentId, sessionId, term } },
        include: { session: true },
      }),
      this.prisma.assessmentRecord.findMany({
        where: { branchId, studentId, sessionId, term },
        include: { subject: true },
        orderBy: { subject: { name: 'asc' } },
      }),
      this.prisma.studentRanking.findMany({
        where: { branchId, studentId, sessionId, term },
      }),
    ]);
    return { summary, records, rankings };
  }

  async performance(studentId: string, context: TenantContext) {
    await this.assertAccess(studentId, context);
    const branchId = this.branchId(context);
    const [summaries, gpas] = await Promise.all([
      this.prisma.resultSummary.findMany({
        where: { branchId, studentId, isLocked: true },
        include: { session: true },
        orderBy: [{ session: { startDate: 'asc' } }, { term: 'asc' }],
      }),
      this.prisma.gPARecord.findMany({
        where: { branchId, studentId },
        orderBy: [{ createdAt: 'asc' }],
      }),
    ]);
    return {
      summaries,
      gpas,
      averageTrend: summaries.map((summary) => ({
        session: summary.session.name,
        term: summary.term,
        average: summary.average,
        gpa: summary.cgpa,
      })),
    };
  }
}
