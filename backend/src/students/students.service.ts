import { Injectable, ConflictException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/client/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) { }

  async create(createStudentDto: CreateStudentDto) {
    const { email, password, firstName, lastName, branchId, classId, sectionId, dob, phone, parentId } = createStudentDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password || 'student123', 10);

    // Transaction: Create User + Student
    return this.prisma.$transaction(async (tx) => {
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
  }

  findAll(branchId: string | null, classId?: string, sectionId?: string) {
    return this.prisma.student.findMany({
      where: {
        ...(branchId && { branchId }), // Only filter by branchId if it's provided
        ...(classId && { classId }),
        ...(sectionId && { sectionId }),
      },
      include: {
        user: true,
        class: true,
        section: true,
        transportAssignment: true,
        assessmentRecords: true, // Useful for marks entry
      }
    });
  }

  findOne(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        class: true,
        section: true,
        parent: { include: { student: true } },
        attendance: { take: 30, orderBy: { date: 'desc' } }, // Latest 30 records
        transportAssignment: { include: { route: true, vehicle: true } },
        certificates: true
      }
    });
  }

  async importStudents(fileBuffer: Buffer, branchId: string) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new Error('Invalid Excel file: No worksheet found');
    }

    const studentsToCreate: any[] = [];
    const errors: string[] = [];

    // Helper to resolve class/section IDs from names
    const classes = await this.prisma.class.findMany({ where: { branchId } });
    const sections = await this.prisma.section.findMany({
      where: { class: { branchId } }
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

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

      // Resolve classId
      let classId: string | null = null;
      if (className) {
        const classMatch = classes.find(c => c.name.toLowerCase() === className.toLowerCase() || c.id === className);
        classId = classMatch?.id || null;
      }

      // Resolve sectionId
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

  update(id: string, updateStudentDto: UpdateStudentDto) {
    return this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
    });
  }

  remove(id: string) {
    return this.prisma.student.delete({
      where: { id },
    });
  }

  // Deactivation Reasons
  async fetchDeactivationReasons(branchId: string | null) {
    return this.prisma.deactivationReason.findMany({
      where: {
        ...(branchId ? { branchId } : {})
      },
      include: {
        _count: {
          select: { deactivations: true }
        }
      }
    });
  }

  async createDeactivationReason(data: any) {
    return this.prisma.deactivationReason.create({
      data
    });
  }

  async updateDeactivationReason(id: string, data: any) {
    return this.prisma.deactivationReason.update({
      where: { id },
      data
    });
  }

  async deleteDeactivationReason(id: string) {
    return this.prisma.deactivationReason.delete({
      where: { id }
    });
  }

  // Login Deactivation
  async deactivateLogin(studentIds: string[], reason: string, branchId: string | null, reasonId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const students = await tx.student.findMany({
        where: { id: { in: studentIds } },
        include: { user: true }
      });

      const deactivations: any[] = [];
      for (const student of students) {
        if (student.userId) {
          // Deactivate User
          await tx.user.update({
            where: { id: student.userId },
            data: { isActive: false }
          });

          // Record Deactivation
          const deactivation = await tx.loginDeactivation.create({
            data: {
              studentId: student.id,
              userId: student.userId,
              reason,
              reasonId,
              branchId: branchId || student.branchId // Use passed branchId or student's branchId
            }
          });
          deactivations.push(deactivation);
        }
      }
      return deactivations;
    });
  }

  async reactivateLogin(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (student?.userId) {
      return this.prisma.user.update({
        where: { id: student.userId },
        data: { isActive: true }
      });
    }
    return null;
  }

  async getLoginDeactivations(branchId: string | null) {
    return this.prisma.loginDeactivation.findMany({
      where: branchId ? { branchId } : {},
      orderBy: { createdAt: 'desc' }
    });
  }

  async getStats(branchId: string) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, newThisMonth, totalAttendance] = await Promise.all([
      this.prisma.student.count({
        where: branchId ? { branchId } : {}
      }),
      this.prisma.student.count({
        where: {
          ...(branchId && { branchId }),
          createdAt: { gte: firstDayOfMonth }
        }
      }),
      this.prisma.attendance.findMany({
        where: {
          student: branchId ? { branchId } : {}
        },
        select: { status: true }
      })
    ]);

    const activeClasses = await this.prisma.class.count({
      where: branchId ? { branchId } : {}
    });

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


