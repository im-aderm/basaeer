import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';

@Injectable()
export class CertificatesService {
    constructor(private prisma: PrismaService) { }

    async create(createCertificateDto: CreateCertificateDto, issuedByUserId: string) {
        return this.prisma.certificate.create({
            data: {
                ...createCertificateDto,
                issuedByUserId,
            },
            include: {
                student: {
                    include: {
                        user: true,
                        class: true,
                    }
                },
                issuedBy: true,
            },
        });
    }

    async findAll(branchId: string | null) {
        return this.prisma.certificate.findMany({
            where: { ...(branchId && { branchId }) },
            include: {
                student: {
                    include: {
                        user: true,
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.certificate.findUnique({
            where: { id },
            include: {
                student: {
                    include: {
                        user: true,
                        class: true,
                        branch: true,
                    }
                },
                issuedBy: true,
            },
        });
    }

    async findByStudent(studentId: string) {
        return this.prisma.certificate.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async remove(id: string) {
        return this.prisma.certificate.delete({
            where: { id },
        });
    }
}
