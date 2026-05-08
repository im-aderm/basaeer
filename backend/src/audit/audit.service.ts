import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async log(
        action: string,
        module: string,
        context: TenantContext,
        details?: any,
        reason?: string
    ) {
        return this.logAction(context.userId, action, module, details, reason);
    }

    async logAction(
        userId: string,
        action: string,
        module: string,
        details?: any,
        reason?: string
    ) {
        return this.prisma.auditLog.create({
            data: {
                action,
                module,
                userId,
                details: details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null,
                reason,
            },
        });
    }

    async getLogs(query: {
        userId?: string;
        module?: string;
        action?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }) {
        const { userId, module, action, startDate, endDate, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (userId) where.userId = userId;
        if (module) where.module = module;
        if (action) where.action = action;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [items, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        }
                    }
                }
            }),
            this.prisma.auditLog.count({ where })
        ]);

        return {
            items,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit)
        };
    }
}
