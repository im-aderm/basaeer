import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/client/client';
import * as bcrypt from 'bcrypt';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) { }

  async create(createStudentDto: CreateStudentDto, context: TenantContext) {
    const { email, password, firstName, lastName, classId, sectionId, dob, phone, parentId } = createStudentDto;
    const branchId = createStudentDto.branchId || context.branchId;

    if (!branchId) {
      throw new ForbiddenException('Branch context is required');
    }

    // Ensure user has access to this branch
    if (!context.isSuperAdmin && context.branchId !== branchId) {
      throw new ForbiddenException('You do not have access to this branch');
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password || 'student123', 10);

    // Transaction: Create User + Student
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
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

      return { user, student };
    });

    await this.audit.log('CREATE_STUDENT', 'STUDENTS', context, { studentId: result.student.id, email });
    return result;
  }

  findAll(context: TenantContext, classId?: string, sectionId?: string) {
    return this.prisma.student.findMany({
      where: TenantHelper.applyIsolation({
        ...(classId && { classId }),
        ...(sectionId && { sectionId }),
      }, context),
      include: {
        user: true,
        class: true,
        section: true,
        transportAssignment: true,
        assessmentRecords: true,
      }
    });
  }

  async findOne(id: string, context: TenantContext) {
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
      include: {
        user: true,
        class: true,
        section: true,
        parent: { include: { student: true } },
        attendance: { take: 30, orderBy: { date: 'desc' } },
        transportAssignment: { include: { route: true, vehicle: true } },
        certificates: true
      }
    });

    if (!student) {
      throw new NotFoundException('Student not found or access denied');
    }

    return student;
  }

  async importStudents(fileBuffer: Buffer, context: TenantContext) {
    const branchId = context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required for import');

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new Error('Invalid Excel file: No worksheet found');
    }

    const studentsToCreate: any[] = [];
    const errors: string[] = [];

    const classes = await this.prisma.class.findMany({ where: { branchId } });
    const sections = await this.prisma.section.findMany({
      where: { class: { branchId } }
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const email = row.getCell(1).value?.toString();
      const firstName = row.getCell(2).value?.toString();
      const lastName = row.getCell(3).value?.toString();
      const phone = row.getCell(4).value?.toString() || null;
      const dobValue = row.getCell(5).value;
      const className = row.getCell(6).value?.toString();
      const sectionName = row.getCell(7).value?.toString();

      if (!email || !firstName || !lastName) {
        errors.push(`Row ${rowNumber}: Missing required fields (email, firstName, lastName)`);
        return;
      }

      let classId: string | null = null;
      if (className) {
        const classMatch = classes.find(c => c.name.toLowerCase() === className.toLowerCase() || c.id === className);
        classId = classMatch?.id || null;
      }

      let sectionId: string | null = null;
      if (sectionName && classId) {
        const sectionMatch = sections.find(s => s.classId === classId && (s.name.toLowerCase() === sectionName.toLowerCase() || s.id === sectionName));
        sectionId = sectionMatch?.id || null;
      }

      studentsToCreate.push({
        email,
        firstName,
        lastName,
        phone,
        dob: dobValue ? new Date(dobValue.toString()) : null,
        classId,
        sectionId,
        branchId
      });
    });

    const results = {
      success: 0,
      failed: 0,
      details: [] as string[]
    };

    const hashedPassword = await bcrypt.hash('student123', 10);

    for (const studentData of studentsToCreate) {
      try {
        await this.prisma.$transaction(async (tx) => {
          const existingUser = await tx.user.findUnique({ where: { email: studentData.email } });
          if (existingUser) {
            throw new Error(`Email ${studentData.email} already exists`);
          }

          const user = await tx.user.create({
            data: {
              email: studentData.email,
              password: hashedPassword,
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              phone: studentData.phone,
              role: UserRole.STUDENT,
              branchId: studentData.branchId,
            },
          });

          await tx.student.create({
            data: {
              userId: user.id,
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              branchId: studentData.branchId,
              classId: studentData.classId,
              sectionId: studentData.sectionId,
              dob: studentData.dob,
            },
          });
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.details.push(`Failed to import ${studentData.email}: ${error.message}`);
      }
    }

    return {
      message: `Import completed: ${results.success} succeeded, ${results.failed} failed.`,
      ...results,
      parsingErrors: errors
    };
  }

  async update(id: string, updateStudentDto: UpdateStudentDto, context: TenantContext) {
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

    return this.prisma.student.delete({
      where: { id },
    });
  }

  // Deactivation Reasons
  async fetchDeactivationReasons(context: TenantContext) {
    return this.prisma.deactivationReason.findMany({
      where: TenantHelper.applyIsolation({}, context),
      include: {
        _count: {
          select: { deactivations: true }
        }
      }
    });
  }

  async createDeactivationReason(data: any, context: TenantContext) {
    const branchId = data.branchId || context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');
    
    return this.prisma.deactivationReason.create({
      data: { ...data, branchId }
    });
  }

  async updateDeactivationReason(id: string, data: any, context: TenantContext) {
    // Ownership check
    const reason = await this.prisma.deactivationReason.findFirst({
      where: TenantHelper.applyIsolation({ id }, context)
    });
    if (!reason) throw new NotFoundException('Reason not found');

    return this.prisma.deactivationReason.update({
      where: { id },
      data
    });
  }

  async deleteDeactivationReason(id: string, context: TenantContext) {
    // Ownership check
    const reason = await this.prisma.deactivationReason.findFirst({
      where: TenantHelper.applyIsolation({ id }, context)
    });
    if (!reason) throw new NotFoundException('Reason not found');

    return this.prisma.deactivationReason.delete({
      where: { id }
    });
  }

  // Login Deactivation
  async deactivateLogin(studentIds: string[], reason: string, context: TenantContext, reasonId?: string) {
    const branchId = context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    return this.prisma.$transaction(async (tx) => {
      const students = await tx.student.findMany({
        where: TenantHelper.applyIsolation({ id: { in: studentIds } }, context),
        include: { user: true }
      });

      const deactivations: any[] = [];
      for (const student of students) {
        if (student.userId) {
          await tx.user.update({
            where: { id: student.userId },
            data: { isActive: false }
          });

          const deactivation = await tx.loginDeactivation.create({
            data: {
              studentId: student.id,
              userId: student.userId,
              reason,
              reasonId,
              branchId
            }
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
      include: { user: true }
    });

    if (!student) throw new NotFoundException('Student not found');

    if (student?.userId) {
      return this.prisma.user.update({
        where: { id: student.userId },
        data: { isActive: true }
      });
    }
    return null;
  }

  async getLoginDeactivations(context: TenantContext) {
    return this.prisma.loginDeactivation.findMany({
      where: TenantHelper.applyIsolation({}, context),
      orderBy: { createdAt: 'desc' }
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
          createdAt: { gte: firstDayOfMonth }
        }
      }),
      this.prisma.attendance.findMany({
        where: { branchId: context.branchId || undefined },
        select: { status: true }
      })
    ]);

    const activeClasses = await this.prisma.class.count({ where });

    const attendanceRate = totalAttendance.length > 0
      ? (totalAttendance.filter(a => ['PRESENT', 'LATE'].includes(a.status)).length / totalAttendance.length) * 100
      : 0;

    return {
      total,
      newThisMonth,
      activeClasses,
      attendanceRate: `${attendanceRate.toFixed(1)}%`
    };
  }
}


