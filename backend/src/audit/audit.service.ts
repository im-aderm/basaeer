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
        return this.prisma.auditLog.create({
            data: {
                action,
                module,
                userId: context.userId,
                details: details ? JSON.stringify(details) : null,
                reason,
            },
        });
    }
}
