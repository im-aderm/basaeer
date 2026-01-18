import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentsService {
    constructor(private prisma: PrismaService) { }

    async createAssignment(data: any) {
        return this.prisma.assignment.create({
            data: {
                ...data,
                dueDate: new Date(data.dueDate),
            },
        });
    }

    async findAll(branchId: string) {
        return this.prisma.assignment.findMany({
            where: { subject: { branchId } },
            include: { subject: true, section: true, teacher: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByStudent(studentId: string) {
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            select: { sectionId: true, classId: true }
        });

        if (!student) throw new NotFoundException('Student not found');

        return this.prisma.assignment.findMany({
            where: {
                OR: [
                    { sectionId: student.sectionId ?? undefined },
                    { section: { classId: student.classId ?? undefined } }
                ]
            },
            include: {
                subject: true,
                teacher: { include: { user: true } },
                submissions: {
                    where: { studentId }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
            include: { subject: true, section: true, teacher: { include: { user: true } }, submissions: true },
        });
        if (!assignment) throw new NotFoundException('Assignment not found');
        return assignment;
    }

    async update(id: string, data: any) {
        return this.prisma.assignment.update({
            where: { id },
            data: {
                ...data,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            },
        });
    }

    async remove(id: string) {
        return this.prisma.assignment.delete({ where: { id } });
    }

    // --- Submissions ---
    async submitAssignment(data: any) {
        const { assignmentId, studentId, contentUrl } = data;
        return this.prisma.submission.upsert({
            where: {
                assignmentId_studentId: { assignmentId, studentId }
            },
            update: {
                contentUrl,
                status: 'SUBMITTED',
                updatedAt: new Date()
            },
            create: {
                assignmentId,
                studentId,
                contentUrl,
                status: 'SUBMITTED'
            }
        });
    }

    async getSubmissions(assignmentId: string) {
        return this.prisma.submission.findMany({
            where: { assignmentId },
            include: { student: { include: { user: true } } },
        });
    }

    async gradeSubmission(submissionId: string, grade: number, feedback?: string) {
        return this.prisma.submission.update({
            where: { id: submissionId },
            data: {
                grade,
                feedback,
                status: 'GRADED'
            }
        });
    }
}
