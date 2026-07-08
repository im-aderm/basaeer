import { BCRYPT_ROUNDS } from '../common/constants/security.constants';
import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
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

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private comms: CommsService,
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
      categoryId,
      gender,
      otherNames,
      placeOfBirth,
      nationality,
      stateOfOrigin,
      lga,
      religion,
      passportPhoto,
      guardianOccupation,
      guardianOfficeAddress,
      secondaryGuardianName,
      secondaryGuardianPhone,
      secondaryGuardianRelation,
      city,
      state,
      country,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      bloodGroup,
      genotype,
      allergies,
      medicalConditions,
      specialNeeds,
      familyDoctorName,
      familyDoctorPhone,
      birthCertificateUrl,
      testimonialUrl,
      transferCertificateUrl,
      immunizationCardUrl,
      preferredLanguage,
      religionClassType,
      scholarshipEligible,
      referralSource,
      enrollmentStatus,
      admissionDate,
    } = createStudentDto;
    const branchId = createStudentDto.branchId || context.branchId;

    if (!branchId) {
      throw new ForbiddenException('Branch context is required');
    }

    if (!context.isSuperAdmin && context.branchId !== branchId) {
      throw new ForbiddenException('You do not have access to this branch');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password || tempPassword, BCRYPT_ROUNDS);

    const year = new Date().getFullYear();
    const count = await this.prisma.student.count({ where: { branchId } });
    const admissionNumber = `BMS-${year}-${(count + 1).toString().padStart(4, '0')}`;

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
          admissionNumber,
          firstName,
          lastName,
          gender,
          branchId,
          classId,
          sectionId,
          dob: dob ? new Date(dob) : undefined,
          parentId,
          categoryId,
          otherNames,
          placeOfBirth,
          nationality,
          stateOfOrigin,
          lga,
          religion,
          passportPhoto,
          guardianOccupation,
          guardianOfficeAddress,
          secondaryGuardianName,
          secondaryGuardianPhone,
          secondaryGuardianRelation,
          city,
          state,
          country,
          emergencyContactName,
          emergencyContactPhone,
          emergencyContactRelation,
          bloodGroup,
          genotype,
          allergies,
          medicalConditions,
          specialNeeds,
          familyDoctorName,
          familyDoctorPhone,
          birthCertificateUrl,
          testimonialUrl,
          transferCertificateUrl,
          immunizationCardUrl,
          preferredLanguage,
          religionClassType,
          scholarshipEligible: scholarshipEligible || false,
          referralSource,
          enrollmentStatus: enrollmentStatus || 'ACTIVE',
          admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
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
      afterState: { studentId: result.student.id, email, firstName, lastName, admissionNumber },
    });

    if (!password && result.tempPassword) {
      this.comms.sendEmail({
        email,
        subject: 'Welcome to Basaer — Your Login Credentials',
        message: `Hi ${firstName},\n\nYour student account has been created.\n\nEmail: ${email}\nTemporary Password: ${result.tempPassword}\nAdmission Number: ${result.student.admissionNumber}\n\nPlease log in and change your password immediately.\n\nRegards,\nBasaer School Management`,
        branchId: branchId || null,
      }).catch(() => {});
    }

    return result;
  }

  findAll(
    context: TenantContext,
    filters?: {
      classId?: string;
      sectionId?: string;
      search?: string;
      enrollmentStatus?: string;
      isActive?: boolean;
    },
    skip?: number,
    take: number = 50,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ) {
    const where: any = TenantHelper.applyIsolation({}, context, { softDelete: true });

    if (filters?.classId) where.classId = filters.classId;
    if (filters?.sectionId) where.sectionId = filters.sectionId;
    if (filters?.enrollmentStatus) where.enrollmentStatus = filters.enrollmentStatus;
    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { admissionNumber: { contains: filters.search, mode: 'insensitive' } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }
    if (filters?.isActive !== undefined) {
      if (where.OR) {
        where.AND = [{ user: { isActive: filters.isActive } }, ...(where.OR ? [{ OR: where.OR }] : [])];
        delete where.OR;
      } else {
        where.user = { isActive: filters.isActive };
      }
    }

    const orderBy: any = {};
    if (sortBy === 'class') {
      orderBy.class = { name: sortOrder || 'asc' };
    } else if (sortBy === 'section') {
      orderBy.section = { name: sortOrder || 'asc' };
    } else if (sortBy === 'name') {
      orderBy.lastName = sortOrder || 'asc';
    } else if (sortBy === 'admissionNumber') {
      orderBy.admissionNumber = sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    return this.prisma.student.findMany({
      where: { deletedAt: null, ...where },
      include: {
        class: true,
        section: true,
        user: true,
        parent: true,
      },
      orderBy: [{ user: { lastName: 'asc' } }, { user: { firstName: 'asc' } }],
      take: 100,
      
    });
  }

  async findAllWithCount(
    context: TenantContext,
    filters?: {
      classId?: string;
      sectionId?: string;
      search?: string;
      enrollmentStatus?: string;
      isActive?: boolean;
    },
    skip?: number,
    take: number = 50,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ) {
    const where: any = TenantHelper.applyIsolation({}, context, { softDelete: true });

    if (filters?.classId) where.classId = filters.classId;
    if (filters?.sectionId) where.sectionId = filters.sectionId;
    if (filters?.enrollmentStatus) where.enrollmentStatus = filters.enrollmentStatus;
    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { admissionNumber: { contains: filters.search, mode: 'insensitive' } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }
    if (filters?.isActive !== undefined) {
      if (where.OR) {
        where.AND = [{ user: { isActive: filters.isActive } }, ...(where.OR ? [{ OR: where.OR }] : [])];
        delete where.OR;
      } else {
        where.user = { isActive: filters.isActive };
      }
    }

    const orderBy: any = {};
    if (sortBy === 'class') {
      orderBy.class = { name: sortOrder || 'asc' };
    } else if (sortBy === 'section') {
      orderBy.section = { name: sortOrder || 'asc' };
    } else if (sortBy === 'name') {
      orderBy.lastName = sortOrder || 'asc';
    } else if (sortBy === 'admissionNumber') {
      orderBy.admissionNumber = sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, totalCount] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : 50,
        orderBy,
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
      }),
      this.prisma.student.count({ where }),
    ]);

    return { data, totalCount };
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

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
    context: TenantContext,
  ) {
    const student = await this.findOne(id, context);

    const { email, password, phone, ...studentData } = updateStudentDto;

    const data: any = { ...studentData };
    if (studentData.dob) data.dob = new Date(studentData.dob);
    if (studentData.admissionDate) data.admissionDate = new Date(studentData.admissionDate);
    if (studentData.exitDate) data.exitDate = new Date(studentData.exitDate);

    const updated = await this.prisma.student.update({
      where: { id },
      data,
    });

    if (email || password || phone) {
      const userData: any = {};
      if (email) userData.email = email;
      if (password) userData.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
      if (phone) userData.phone = phone;

      if (Object.keys(userData).length > 0 && student.userId) {
        await this.prisma.user.update({
          where: { id: student.userId },
          data: userData,
        });
      }
    }

    await this.audit.log({
      action: 'UPDATE_STUDENT',
      module: 'STUDENTS',
      context,
      targetId: id,
      targetType: 'Student',
      afterState: { studentId: id, ...studentData },
    });

    return updated;
  }

  async remove(id: string, context: TenantContext) {
    const student = await this.findOne(id, context);

    return this.prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      if (student.userId) {
        await tx.user.update({
          where: { id: student.userId },
          data: { isActive: false },
        });
      }
    });
  }

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
    const reason = await this.prisma.deactivationReason.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!reason) throw new NotFoundException('Reason not found');

    return this.prisma.deactivationReason.delete({
      where: { id },
    });
  }

  async deactivateLogin(
    studentIds: string[],
    reason: string,
    context: TenantContext,
    reasonId?: string,
  ) {
    if (!studentIds || studentIds.length === 0) {
      throw new BadRequestException('No students selected for deactivation');
    }

    const branchId = context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    return this.prisma.$transaction(async (tx) => {
      const students = await tx.student.findMany({
        where: TenantHelper.applyIsolation({ id: { in: studentIds } }, context),
        include: { user: true },
      });

      const validStudents = students.filter(s => s.userId);
      if (validStudents.length === 0) {
        throw new BadRequestException('No valid students found with login accounts');
      }

      const userIds = validStudents.map(s => s.userId!);

      const alreadyDeactivated = await tx.loginDeactivation.findMany({
        where: {
          userId: { in: userIds },
          reactivatedAt: null,
        },
        select: { userId: true },
      });
      const alreadyDeactivatedUserIds = new Set(alreadyDeactivated.map(d => d.userId));

      const toDeactivate = validStudents.filter(s => !alreadyDeactivatedUserIds.has(s.userId!));

      if (toDeactivate.length === 0) {
        throw new BadRequestException('All selected students are already deactivated');
      }

      await tx.user.updateMany({
        where: { id: { in: toDeactivate.map(s => s.userId!) } },
        data: { isActive: false },
      });

      await tx.loginDeactivation.createMany({
        data: toDeactivate.map(s => ({
          studentId: s.id,
          userId: s.userId!,
          reason,
          reasonId,
          branchId,
          deactivatedBy: context.userId,
        })),
      });

      await this.audit.log({
        action: 'BULK_DEACTIVATE_LOGIN',
        module: 'STUDENTS',
        context,
        targetType: 'Student',
        afterState: { count: toDeactivate.length, reason },
      });

      return {
        success: toDeactivate.length,
        alreadyDeactivated: alreadyDeactivated.length,
        message: `${toDeactivate.length} student(s) deactivated, ${alreadyDeactivated.length} already deactivated`,
      };
    });
  }

  async reactivateLogin(studentId: string, context: TenantContext) {
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
      include: { user: true },
    });

    if (!student) throw new NotFoundException('Student not found');
    if (!student?.userId) throw new BadRequestException('Student has no login account');

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: student.userId! },
        data: { isActive: true },
      });

      await tx.loginDeactivation.updateMany({
        where: {
          userId: student.userId!,
          reactivatedAt: null,
        },
        data: {
          reactivatedAt: new Date(),
          reactivatedBy: context.userId,
        },
      });

      await this.audit.log({
        action: 'REACTIVATE_LOGIN',
        module: 'STUDENTS',
        context,
        targetId: studentId,
        targetType: 'Student',
      });

      return { success: true, message: 'Student login reactivated' };
    });
  }

  async bulkReactivateLogin(studentIds: string[], context: TenantContext) {
    if (!studentIds || studentIds.length === 0) {
      throw new BadRequestException('No students selected for reactivation');
    }

    return this.prisma.$transaction(async (tx) => {
      const students = await tx.student.findMany({
        where: TenantHelper.applyIsolation({ id: { in: studentIds } }, context),
        include: { user: true },
      });

      const validStudents = students.filter(s => s.userId);
      if (validStudents.length === 0) {
        throw new BadRequestException('No valid students found');
      }

      const userIds = validStudents.map(s => s.userId!);

      await tx.user.updateMany({
        where: { id: { in: userIds } },
        data: { isActive: true },
      });

      await tx.loginDeactivation.updateMany({
        where: {
          userId: { in: userIds },
          reactivatedAt: null,
        },
        data: {
          reactivatedAt: new Date(),
          reactivatedBy: context.userId,
        },
      });

      await this.audit.log({
        action: 'BULK_REACTIVATE_LOGIN',
        module: 'STUDENTS',
        context,
        targetType: 'Student',
        afterState: { count: validStudents.length },
      });

      return {
        success: validStudents.length,
        message: `${validStudents.length} student(s) reactivated`,
      };
    });
  }

  async getLoginDeactivations(context: TenantContext) {
    return this.prisma.loginDeactivation.findMany({
      where: TenantHelper.applyIsolation({}, context),
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
          },
        },
        reasonRef: {
          select: { id: true, title: true },
        },
      },
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
