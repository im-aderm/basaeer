import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class AssignmentsService {
    constructor(private prisma: PrismaService) { }

    async createAssignment(data: any, context: TenantContext) {
        const branchId = data.branchId || context.branchId;
        if (!branchId) throw new ForbiddenException('Branch context required');

        return this.prisma.assignment.create({
            data: {
                ...data,
                branchId,
                dueDate: new Date(data.dueDate),
            },
        });
    }

    async findAll(context: TenantContext, filters?: any) {
        return this.prisma.assignment.findMany({
            where: TenantHelper.applyIsolation({
                section: filters?.classId ? { classId: filters.classId } : undefined,
                subjectId: filters?.subjectId || undefined,
            }, context),
            include: { subject: true, section: true, teacher: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByStudent(studentId: string, context: TenantContext) {
        const student = await this.prisma.student.findFirst({
            where: TenantHelper.applyIsolation({ id: studentId }, context),
            select: { sectionId: true, classId: true }
        });

        if (!student) throw new NotFoundException('Student not found or access denied');

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

    async findOne(id: string, context: TenantContext) {
        const assignment = await this.prisma.assignment.findFirst({
            where: TenantHelper.applyIsolation({ id }, context),
            include: { subject: true, section: true, teacher: { include: { user: true } }, submissions: true },
        });
        if (!assignment) throw new NotFoundException('Assignment not found or access denied');
        return assignment;
    }

    async update(id: string, data: any, context: TenantContext) {
        await this.findOne(id, context);
        return this.prisma.assignment.update({
            where: { id },
            data: {
                ...data,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            },
        });
    }

    async remove(id: string, context: TenantContext) {
        await this.findOne(id, context);
        return this.prisma.assignment.delete({ where: { id } });
    }

    // --- Submissions ---
    async submitAssignment(data: any, context: TenantContext) {
        const { assignmentId, studentId, contentUrl } = data;
        
        // Ownership check
        await this.findOne(assignmentId, context);
        const student = await this.prisma.student.findFirst({
            where: TenantHelper.applyIsolation({ id: studentId }, context)
        });
        if (!student) throw new NotFoundException('Student not found');

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

    async getSubmissions(assignmentId: string, context: TenantContext) {
        await this.findOne(assignmentId, context);
        return this.prisma.submission.findMany({
            where: { assignmentId },
            include: { student: { include: { user: true } } },
        });
    }

    async gradeSubmission(submissionId: string, grade: number, feedback: string | undefined, context: TenantContext) {
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: { assignment: true }
        });

        if (!submission) throw new NotFoundException('Submission not found');
        
        // Ownership check on parent assignment
        await this.findOne(submission.assignmentId, context);

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
