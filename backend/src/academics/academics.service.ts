import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAssignmentDto,
  SubmitAssignmentDto,
  CreateExamDto,
  RecordGradeDto,
} from './dto/academics-ops.dto';
import { PromoteStudentsDto } from './dto/promote-students.dto';

@Injectable()
export class AcademicsService {
  constructor(private prisma: PrismaService) {}

  // Assignments
  async createAssignment(dto: CreateAssignmentDto) {
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
      },
    });
  }

  async submitAssignment(dto: SubmitAssignmentDto) {
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
      },
    });
  }

  async gradeSubmission(
    submissionId: string,
    grade: number,
    feedback?: string,
  ) {
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
  async getStudentPerformance(studentId: string) {
    const assessmentRecords = await this.prisma.assessmentRecord.findMany({
      where: { studentId },
      include: { subject: true, session: true },
    });

    const summaries = await this.prisma.resultSummary.findMany({
      where: { studentId },
      include: { session: true },
    });

    const submissions = await this.prisma.submission.findMany({
      where: { studentId },
      include: { assignment: { include: { subject: true } } },
    });

    return { assessmentRecords, summaries, submissions };
  }

  async getAssignments(filters: {
    classId?: string;
    sectionId?: string;
    subjectId?: string;
    teacherId?: string;
  }) {
    return this.prisma.assignment.findMany({
      where: {
        section: filters.classId ? { classId: filters.classId } : undefined,
        sectionId: filters.sectionId,
        subjectId: filters.subjectId,
        teacherId: filters.teacherId,
      },
      include: {
        subject: true,
        section: { include: { class: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAssignmentSubmissions(assignmentId: string) {
    return this.prisma.submission.findMany({
      where: { assignmentId },
      include: { student: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStudentAssignments(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
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

  async promoteStudents(dto: PromoteStudentsDto) {
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
    // Simple conflict check (strict)
    const conflict = await this.prisma.classSchedule.findFirst({
      where: {
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

    return this.prisma.classSchedule.create({
      data: dto,
    });
  }

  async getSchedules(filters: {
    classId?: string;
    sectionId?: string;
    teacherId?: string;
  }) {
    return this.prisma.classSchedule.findMany({
      where: {
        classId: filters.classId,
        sectionId: filters.sectionId,
        teacherId: filters.teacherId,
      },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        class: true,
        section: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async deleteSchedule(id: string) {
    return this.prisma.classSchedule.delete({
      where: { id },
    });
  }
}
