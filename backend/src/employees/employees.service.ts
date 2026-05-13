import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateAwardDto } from './dto/hr-ops.dto';
import { UserRole } from '../generated/client/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async createEmployee(data: CreateEmployeeDto) {
    const {
      email,
      password,
      firstName,
      lastName,
      branchId,
      role,
      phone,
      departmentId,
      designationId,
    } = data;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password || tempPassword, 10);

    // Transaction: Create User + Staff
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          mustChangePassword: !password,
          firstName,
          lastName,
          phone,
          role: UserRole.HR,
          branchId,
        },
      });

      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          designation: designationId,
          departmentId: departmentId || null,
          designationId: designationId || null,
        },
      });

      return { user, staff, tempPassword: password ? undefined : tempPassword };
    });
  }

  async findAllEmployees(branchId: string | null) {
    return this.prisma.staff.findMany({
      where: {
        ...(branchId && {
          user: {
            branchId,
          },
        }),
      },
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
            branchId: true,
          },
        },
        department: true,
        designationRef: true,
      },
    });
  }

  async findAllTeachers(branchId: string | null) {
    return this.prisma.staff.findMany({
      where: {
        ...(branchId && {
          user: {
            branchId,
            role: UserRole.TEACHER,
          },
        }),
        ...(!branchId && {
          user: {
            role: UserRole.TEACHER,
          },
        }),
      },
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
            branchId: true,
          },
        },
        department: true,
        designationRef: true,
      },
    });
  }

  async updateStaffStatus(id: string, status: any, context: TenantContext) {
    const staff = await this.prisma.staff.findFirst({
      where: TenantHelper.applyNestedIsolation({ id }, 'user', context),
    });
    if (!staff) throw new NotFoundException('Staff not found');
    return this.prisma.staff.update({
      where: { id },
      data: { status },
    });
  }

  async findOneStaff(id: string, context: TenantContext) {
    const staff = await this.prisma.staff.findFirst({
      where: TenantHelper.applyNestedIsolation({ id }, 'user', context),
      include: {
        user: true,
        department: true,
        designationRef: true,
        salaryTemplate: true,
        awards: true,
        salaryAdvances: true,
      },
    });
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async findByUserId(userId: string, context: TenantContext) {
    const staff = await this.prisma.staff.findFirst({
      where: TenantHelper.applyNestedIsolation({ userId }, 'user', context),
    });
    if (!staff)
      throw new NotFoundException('Staff profile not found for this user');
    return staff;
  }

  // --- Staff Awards ---
  async createAward(data: CreateAwardDto, branchId: string) {
    const staff = await this.prisma.staff.findUnique({ where: { id: data.staffId } });
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    return this.prisma.staffAward.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        staffId: data.staffId,
        branchId,
      },
    });
  }

  async findAllAwards(branchId?: string) {
    return this.prisma.staffAward.findMany({
      where: branchId ? { staff: { user: { branchId } } } : {},
      include: { staff: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyAwards(staffId: string) {
    return this.prisma.staffAward.findMany({
      where: { staffId },
      include: { staff: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- Salary Advances ---
  async requestAdvance(staffId: string, amount: number, reason: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: { select: { branchId: true } } },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    return this.prisma.advanceSalary.create({
      data: {
        staffId,
        amount,
        reason,
        branchId: staff.user?.branchId ?? '',
      },
    });
  }

  async findAllAdvances(branchId?: string) {
    return this.prisma.advanceSalary.findMany({
      where: branchId ? { staff: { user: { branchId } } } : {},
      include: { staff: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyAdvances(staffId: string) {
    return this.prisma.advanceSalary.findMany({
      where: { staffId },
      include: { staff: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateAdvanceStatus(id: string, status: string, context: TenantContext) {
    const advance = await this.prisma.advanceSalary.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!advance) throw new NotFoundException('Advance not found');
    return this.prisma.advanceSalary.update({
      where: { id },
      data: { status: status as any },
    });
  }

  // --- Staff Attendance ---
  async recordAttendance(data: {
    staffId: string;
    date: string;
    status: any;
    remarks?: string;
  }) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: data.staffId },
      include: { user: true },
    });
    if (!staff || !staff.user) {
      throw new NotFoundException(`Staff ${data.staffId} not found`);
    }
    if (!staff.user.branchId) {
      throw new BadRequestException(
        `Branch ID not found for staff ${data.staffId}`,
      );
    }
    const branchId = staff.user.branchId;

    return this.prisma.staffAttendance.upsert({
      where: {
        staffId_date: {
          staffId: data.staffId,
          date: new Date(data.date),
        },
      },
      update: {
        status: data.status,
        remarks: data.remarks,
        branchId,
      },
      create: {
        staffId: data.staffId,
        date: new Date(data.date),
        status: data.status,
        remarks: data.remarks,
        branchId,
      },
    });
  }

  async getBranchAttendance(branchId: string, date: string) {
    return this.prisma.staffAttendance.findMany({
      where: {
        date: new Date(date),
        staff: {
          user: {
            branchId,
          },
        },
      },
      include: {
        staff: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async getStaffAttendanceHistory(staffId: string, context: TenantContext) {
    const staff = await this.prisma.staff.findFirst({
      where: TenantHelper.applyNestedIsolation({ id: staffId }, 'user', context),
    });
    if (!staff) throw new NotFoundException('Staff not found');
    return this.prisma.staffAttendance.findMany({
      where: { staffId },
      orderBy: { date: 'desc' },
    });
  }
}
