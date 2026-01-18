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

  findAll(branchId: string, classId?: string, sectionId?: string) {
    return this.prisma.student.findMany({
      where: {
        branchId,
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
}
