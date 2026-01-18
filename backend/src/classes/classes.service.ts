
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Class, Section } from '../generated/client/client';

@Injectable()
export class ClassesService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.ClassCreateInput): Promise<Class> {
        return this.prisma.class.create({ data });
    }

    async findAll(branchId: string): Promise<Class[]> {
        return this.prisma.class.findMany({
            where: { branchId },
            include: { sections: true },
        });
    }

    async findOne(id: string): Promise<Class | null> {
        return this.prisma.class.findUnique({
            where: { id },
            include: { sections: true },
        });
    }

    async addSection(classId: string, name: string): Promise<Section> {
        return this.prisma.section.create({
            data: {
                name,
                class: { connect: { id: classId } },
            },
        });
    }

    async assignTeacher(classId: string, teacherId: string): Promise<Class> {
        return this.prisma.class.update({
            where: { id: classId },
            data: {
                classTeacher: { connect: { id: teacherId } },
            },
        });
    }
}
