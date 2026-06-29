import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAssignmentDto,
  SubmitAssignmentDto,
  CreateExamDto,
  RecordGradeDto,
} from './dto/academics-ops.dto';
import { PromoteStudentsDto } from './dto/promote-students.dto';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class AcademicsService {
  constructor(private prisma: PrismaService) {}

  // Assignments
  async createAssignment(dto: CreateAssignmentDto, context: TenantContext) {
    const teacher = await this.prisma.staff.findUnique({
      where: { id: dto.teacherId },
      include: { user: true },
    });

    if (!teacher || !teacher.user.branchId) {
      throw new NotFoundException(
        'Teacher not found or not assigned to a branch',
      );
    }

    return this.prisma.assignment.create({
      data: {
        ...dto,
        dueDate: new Date(dto.dueDate),
        branchId: teacher.user.branchId,
        sessionId: context.sessionId,
      },
    });
  }

  async submitAssignment(dto: SubmitAssignmentDto, context: TenantContext) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: dto.assignmentId,
          studentId: dto.studentId,
        },
      },
      update: {
        contentUrl: dto.contentUrl,
        status: 'SUBMITTED',
      },
      create: {
        assignmentId: dto.assignmentId,
        studentId: dto.studentId,
        contentUrl: dto.contentUrl,
        branchId: student.branchId,
        sessionId: context.sessionId,
      },
    });
  }

  async gradeSubmission(
    submissionId: string,
    grade: number,
    feedback: string | undefined,
    context: TenantContext,
  ) {
    const submission = await this.prisma.submission.findFirst({
      where: TenantHelper.applyIsolation({ id: submissionId }, context),
    });
    if (!submission) throw new NotFoundException('Submission not found');
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade,
        feedback,
        status: 'GRADED',
      },
    });
  }

  // Reporting
  async getStudentPerformance(studentId: string, context: TenantContext) {
    const assessmentRecords = await this.prisma.assessmentRecord.findMany({
      where: TenantHelper.applyIsolation({ studentId }, context),
      include: { subject: true, session: true },
    });

    const summaries = await this.prisma.resultSummary.findMany({
      where: TenantHelper.applyIsolation({ studentId }, context),
      include: { session: true },
    });

    const submissions = await this.prisma.submission.findMany({
      where: TenantHelper.applyIsolation({ studentId }, context),
      include: { assignment: { include: { subject: true } } },
    });

    return { assessmentRecords, summaries, submissions };
  }

  async getAssignments(filters: {
    classId?: string;
    sectionId?: string;
    subjectId?: string;
    teacherId?: string;
  }, context: TenantContext) {
    return this.prisma.assignment.findMany({
      where: TenantHelper.applyIsolation({
        section: filters.classId ? { classId: filters.classId } : undefined,
        sectionId: filters.sectionId,
        subjectId: filters.subjectId,
        teacherId: filters.teacherId,
      }, context),
      include: {
        subject: true,
        section: { include: { class: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAssignmentSubmissions(assignmentId: string, context: TenantContext) {
    const assignment = await this.prisma.assignment.findFirst({
      where: TenantHelper.applyIsolation({ id: assignmentId }, context),
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return this.prisma.submission.findMany({
      where: { assignmentId },
      include: { student: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStudentAssignments(studentId: string, context: TenantContext) {
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
    });

    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.assignment.findMany({
      where: {
        sectionId: student.sectionId ?? undefined,
      },
      include: {
        subject: true,
        submissions: {
          where: { studentId },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async promoteStudents(dto: PromoteStudentsDto, context: TenantContext) {
    for (const id of dto.studentIds) {
      const student = await this.prisma.student.findFirst({
        where: TenantHelper.applyIsolation({ id }, context),
      });
      if (!student) throw new NotFoundException(`Student ${id} not found`);
    }
    return this.prisma.$transaction(
      dto.studentIds.map((id) =>
        this.prisma.student.update({
          where: { id },
          data: {
            classId: dto.targetClassId,
            sectionId: dto.targetSectionId,
          },
        }),
      ),
    );
  }

  // Schedules
  async createSchedule(dto: any) {
    // Simple conflict check (strict) — skip for breaks
    if (!dto.isBreak) {
      const conflict = await this.prisma.classSchedule.findFirst({
        where: {
          branchId: dto.branchId,
          OR: [
            {
              teacherId: dto.teacherId,
              dayOfWeek: dto.dayOfWeek,
              startTime: dto.startTime,
            },
            {
              classId: dto.classId,
              sectionId: dto.sectionId,
              dayOfWeek: dto.dayOfWeek,
              startTime: dto.startTime,
            },
          ],
        },
      });

      if (conflict) {
        throw new BadRequestException(
          'Schedule conflict: Teacher or Section already busy at this time.',
        );
      }
    }

    return this.prisma.classSchedule.create({
      data: dto,
    });
  }

  async getSchedules(filters: {
    classId?: string;
    sectionId?: string;
    teacherId?: string;
  }, context: TenantContext) {
    return this.prisma.classSchedule.findMany({
      where: TenantHelper.applyIsolation({
        classId: filters.classId,
        sectionId: filters.sectionId,
        teacherId: filters.teacherId,
      }, context),
      include: {
        subject: true,
        teacher: { include: { user: true } },
        class: true,
        section: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async deleteSchedule(id: string, context: TenantContext) {
    const schedule = await this.prisma.classSchedule.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    return this.prisma.classSchedule.delete({
      where: { id },
    });
  }
}
