import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/client/client';
import ExcelJS from 'exceljs';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import { AuditService } from '../audit/audit.service';
import { CommsService } from '../comms/comms.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private comms: CommsService,
    @InjectQueue('student-import') private importQueue: Queue,
  ) {}

  async create(createStudentDto: CreateStudentDto, context: TenantContext) {
    const {
      email,
      password,
      firstName,
      lastName,
      classId,
      sectionId,
      dob,
      phone,
      parentId,
    } = createStudentDto;
    const branchId = createStudentDto.branchId || context.branchId;

    if (!branchId) {
      throw new ForbiddenException('Branch context is required');
    }

    // Ensure user has access to this branch
    if (!context.isSuperAdmin && context.branchId !== branchId) {
      throw new ForbiddenException('You do not have access to this branch');
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password || tempPassword, 10);

    // Transaction: Create User + Student
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          mustChangePassword: !password,
          firstName,
          lastName,
          phone,
          role: UserRole.STUDENT,
          branchId,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          branchId,
          classId,
          sectionId,
          dob: dob ? new Date(dob) : undefined,
          parentId,
        },
      });

      return { user, student, tempPassword: password ? undefined : tempPassword };
    });

    await this.audit.log({
      action: 'CREATE_STUDENT',
      module: 'STUDENTS',
      context,
      targetId: result.student.id,
      targetType: 'Student',
      afterState: { studentId: result.student.id, email, firstName, lastName },
    });

    if (!password && result.tempPassword) {
      this.comms.sendEmail({
        email,
        subject: 'Welcome to Basaer — Your Login Credentials',
        message: `Hi ${firstName},\n\nYour student account has been created.\n\nEmail: ${email}\nTemporary Password: ${result.tempPassword}\n\nPlease log in and change your password immediately.\n\nRegards,\nBasaer School Management`,
        branchId: branchId || null,
      }).catch(() => {});
    }

    return result;
  }

  findAll(
    context: TenantContext,
    classId?: string,
    sectionId?: string,
    skip?: number,
    take: number = 100,
  ) {
    return this.prisma.student.findMany({
      where: TenantHelper.applyIsolation(
        {
          ...(classId && { classId }),
          ...(sectionId && { sectionId }),
        },
        context,
        { softDelete: true },
      ),
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : 100,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
            role: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string, context: TenantContext) {
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id }, context, { softDelete: true }),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
            role: true,
          },
        },
        class: true,
        section: true,
        parent: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        attendance: { take: 30, orderBy: { date: 'desc' } },
        transportAssignment: { include: { route: true, vehicle: true } },
        certificates: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found or access denied');
    }

    return student;
  }

  async importStudents(fileBuffer: Buffer, context: TenantContext) {
    const job = await this.importQueue.add('process', {
      fileBuffer,
      context: { userId: context.userId, branchId: context.branchId!, role: context.role },
    });

    return { jobId: job.id, message: 'Import started. Track progress via the status endpoint.' };
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
    context: TenantContext,
  ) {
    // Ownership check
    await this.findOne(id, context);

    return this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
    });
  }

  async remove(id: string, context: TenantContext) {
    // Ownership check
    await this.findOne(id, context);

    return this.prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Deactivation Reasons
  async fetchDeactivationReasons(context: TenantContext) {
    return this.prisma.deactivationReason.findMany({
      where: TenantHelper.applyIsolation({}, context),
      include: {
        _count: {
          select: { deactivations: true },
        },
      },
    });
  }

  async createDeactivationReason(data: any, context: TenantContext) {
    const branchId = data.branchId || context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    return this.prisma.deactivationReason.create({
      data: { ...data, branchId },
    });
  }

  async updateDeactivationReason(
    id: string,
    data: any,
    context: TenantContext,
  ) {
    // Ownership check
    const reason = await this.prisma.deactivationReason.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!reason) throw new NotFoundException('Reason not found');

    return this.prisma.deactivationReason.update({
      where: { id },
      data,
    });
  }

  async deleteDeactivationReason(id: string, context: TenantContext) {
    // Ownership check
    const reason = await this.prisma.deactivationReason.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!reason) throw new NotFoundException('Reason not found');

    return this.prisma.deactivationReason.delete({
      where: { id },
    });
  }

  // Login Deactivation
  async deactivateLogin(
    studentIds: string[],
    reason: string,
    context: TenantContext,
    reasonId?: string,
  ) {
    const branchId = context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    return this.prisma.$transaction(async (tx) => {
      const students = await tx.student.findMany({
        where: TenantHelper.applyIsolation({ id: { in: studentIds } }, context),
        include: { user: true },
      });

      const deactivations: any[] = [];
      for (const student of students) {
        if (student.userId) {
          await tx.user.update({
            where: { id: student.userId },
            data: { isActive: false },
          });

          const deactivation = await tx.loginDeactivation.create({
            data: {
              studentId: student.id,
              userId: student.userId,
              reason,
              reasonId,
              branchId,
            },
          });
          deactivations.push(deactivation);
        }
      }
      return deactivations;
    });
  }

  async reactivateLogin(studentId: string, context: TenantContext) {
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
      include: { user: true },
    });

    if (!student) throw new NotFoundException('Student not found');

    if (student?.userId) {
      return this.prisma.user.update({
        where: { id: student.userId },
        data: { isActive: true },
      });
    }
    return null;
  }

  async getLoginDeactivations(context: TenantContext) {
    return this.prisma.loginDeactivation.findMany({
      where: TenantHelper.applyIsolation({}, context),
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(context: TenantContext) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const where = TenantHelper.applyIsolation({}, context);

    const [total, newThisMonth, totalAttendance] = await Promise.all([
      this.prisma.student.count({ where }),
      this.prisma.student.count({
        where: {
          ...where,
          createdAt: { gte: firstDayOfMonth },
        },
      }),
      this.prisma.attendance.findMany({
        where: { branchId: context.branchId || undefined },
        select: { status: true },
      }),
    ]);

    const activeClasses = await this.prisma.class.count({ where });

    const attendanceRate =
      totalAttendance.length > 0
        ? (totalAttendance.filter((a) => ['PRESENT', 'LATE'].includes(a.status))
            .length /
            totalAttendance.length) *
          100
        : 0;

    return {
      total,
      newThisMonth,
      activeClasses,
      attendanceRate: `${attendanceRate.toFixed(1)}%`,
    };
  }
}
