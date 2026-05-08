
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Subject } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class SubjectsService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.SubjectCreateInput, context: TenantContext): Promise<Subject> {
        const branchId = (data.branch as any)?.connect?.id || context.branchId;
        if (!branchId) throw new ForbiddenException('Branch context required');
        
        return this.prisma.subject.create({ 
            data: {
                ...data,
                branch: { connect: { id: branchId } }
            }
        });
    }

    async findAll(branchId: string | null): Promise<Subject[]> {
        return this.prisma.subject.findMany({
            where: { ...(branchId && { branchId }) },
        });
    }

    async findOne(id: string, context: TenantContext): Promise<Subject> {
        const subject = await this.prisma.subject.findFirst({
            where: TenantHelper.applyIsolation({ id }, context),
        });
        if (!subject) throw new NotFoundException('Subject not found');
        return subject;
    }

    async update(id: string, data: Prisma.SubjectUpdateInput, context: TenantContext): Promise<Subject> {
        await this.findOne(id, context);
        return this.prisma.subject.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, context: TenantContext): Promise<Subject> {
        await this.findOne(id, context);
        return this.prisma.subject.delete({
            where: { id },
        });
    }

    async assignTeacher(subjectId: string, teacherId: string, context: TenantContext): Promise<Subject> {
        await this.findOne(subjectId, context);
        return this.prisma.subject.update({
            where: { id: subjectId },
            data: {
                teachers: {
                    connect: { id: teacherId },
                },
            },
        });
    }
}
