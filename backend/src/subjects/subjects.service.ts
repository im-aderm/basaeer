
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Subject } from '../generated/client/client';

@Injectable()
export class SubjectsService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.SubjectCreateInput): Promise<Subject> {
        return this.prisma.subject.create({ data });
    }

    async findAll(branchId: string): Promise<Subject[]> {
        return this.prisma.subject.findMany({
            where: { branchId },
        });
    }

    async findOne(id: string): Promise<Subject | null> {
        return this.prisma.subject.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: Prisma.SubjectUpdateInput): Promise<Subject> {
        return this.prisma.subject.update({
            where: { id },
            data,
        });
    }

    async remove(id: string): Promise<Subject> {
        return this.prisma.subject.delete({
            where: { id },
        });
    }

    async assignTeacher(subjectId: string, teacherId: string): Promise<Subject> {
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
