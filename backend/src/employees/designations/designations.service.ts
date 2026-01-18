import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDesignationDto } from './dto/create-designation.dto';

@Injectable()
export class DesignationsService {
    constructor(private prisma: PrismaService) { }

    async create(createDesignationDto: CreateDesignationDto) {
        return this.prisma.designation.create({
            data: createDesignationDto,
        });
    }

    async findAll(branchId: string) {
        return this.prisma.designation.findMany({
            where: { branchId },
        });
    }

    async findOne(id: string) {
        return this.prisma.designation.findUnique({
            where: { id },
        });
    }

    async remove(id: string) {
        return this.prisma.designation.delete({
            where: { id },
        });
    }
}
