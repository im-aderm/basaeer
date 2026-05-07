
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Class, Section } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class ClassesService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.ClassCreateInput, context: TenantContext): Promise<Class> {
        const branchId = (data.branch as any)?.connect?.id || context.branchId;
        if (!branchId) throw new ForbiddenException('Branch context required');
        
        return this.prisma.class.create({ 
            data: {
                ...data,
                branch: { connect: { id: branchId } }
            } 
        });
    }

    async findAll(context: TenantContext): Promise<Class[]> {
        return this.prisma.class.findMany({
            where: TenantHelper.applyIsolation({}, context),
            include: { sections: true },
        });
    }

    async findOne(id: string, context: TenantContext): Promise<Class> {
        const cls = await this.prisma.class.findFirst({
            where: TenantHelper.applyIsolation({ id }, context),
            include: { sections: true },
        });
        if (!cls) throw new NotFoundException('Class not found');
        return cls;
    }

    async addSection(classId: string, name: string, context: TenantContext): Promise<Section> {
        // Ownership check
        await this.findOne(classId, context);

        return this.prisma.section.create({
            data: {
                name,
                class: { connect: { id: classId } },
            },
        });
    }

    async assignTeacher(classId: string, teacherId: string, context: TenantContext): Promise<Class> {
        // Ownership check
        await this.findOne(classId, context);

        return this.prisma.class.update({
            where: { id: classId },
            data: {
                classTeacher: { connect: { id: teacherId } },
            },
        });
    }
}
