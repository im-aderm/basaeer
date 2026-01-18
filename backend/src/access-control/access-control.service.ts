import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccessLogDto } from './dto/access-control.dto';

@Injectable()
export class AccessControlService {
    constructor(private prisma: PrismaService) { }

    async logAccess(branchId: string, dto: CreateAccessLogDto) {
        const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
        if (!user) throw new NotFoundException('User not found');

        return this.prisma.campusAccessLog.create({
            data: {
                ...dto,
                branchId
            },
            include: {
                user: {
                    select: { firstName: true, lastName: true, role: true }
                }
            }
        });
    }

    async getBranchLogs(branchId: string, limit: number = 50) {
        return this.prisma.campusAccessLog.findMany({
            where: { branchId },
            include: {
                user: {
                    select: { firstName: true, lastName: true, role: true }
                }
            },
            orderBy: { scanTime: 'desc' },
            take: limit
        });
    }

    async getUserLogs(userId: string) {
        return this.prisma.campusAccessLog.findMany({
            where: { userId },
            orderBy: { scanTime: 'desc' }
        });
    }
}
