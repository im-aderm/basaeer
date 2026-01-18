import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
    constructor(private prisma: PrismaService) { }

    async create(createDepartmentDto: CreateDepartmentDto) {
        return this.prisma.department.create({
            data: createDepartmentDto,
        });
    }

    async findAll(branchId: string) {
        return this.prisma.department.findMany({
            where: { branchId },
        });
    }

    async findOne(id: string) {
        return this.prisma.department.findUnique({
            where: { id },
        });
    }

    async remove(id: string) {
        return this.prisma.department.delete({
            where: { id },
        });
    }
}
