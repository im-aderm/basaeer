import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAutomationConfigDto, UpsertAutomationConfigDto } from './dto/automation.dto';
import { TenantContext } from '../auth/branch.guard';

@Injectable()
export class AutomationService {
    constructor(private prisma: PrismaService) { }

    async getConfigs(tenantContext: TenantContext | string) {
        const branchId = typeof tenantContext === 'string'
            ? tenantContext
            : (tenantContext.isSuperAdmin ? undefined : tenantContext.branchId);
        return this.prisma.automationConfig.findMany({
            where: branchId ? { branchId } : undefined,
        });
    }

    async upsertConfig(dto: UpsertAutomationConfigDto, tenantContext: TenantContext) {
        const branchId = tenantContext.isSuperAdmin
            ? (dto.branchId || tenantContext.branchId || '')
            : (tenantContext.branchId || '');
        const { type, ...rest } = dto;
        return this.prisma.automationConfig.upsert({
            where: { branchId_type: { branchId, type } },
            update: { ...rest },
            create: {
                branchId,
                type,
                ...rest,
            },
        });
    }

    async updateConfig(type: string, dto: UpdateAutomationConfigDto, tenantContext: TenantContext) {
        const branchId = tenantContext.branchId || '';
        return this.prisma.automationConfig.upsert({
            where: { branchId_type: { branchId, type } },
            update: { ...dto },
            create: {
                branchId,
                type,
                ...dto,
            },
        });
    }

    async listJobs(tenantContext: TenantContext) {
        const branchId = tenantContext.isSuperAdmin ? undefined : tenantContext.branchId;
        return this.prisma.scheduledJob.findMany({
            where: branchId ? { branchId } : undefined,
        });
    }

    async toggleJob(id: string, isEnabled: boolean) {
        return this.prisma.scheduledJob.update({
            where: { id },
            data: { isEnabled },
        });
    }

    async seedInitialConfigs(tenantContext: TenantContext) {
        const branchId = tenantContext.branchId || '';
        const types = ['BIRTHDAY_WISH', 'FEE_REMINDER', 'ATTENDANCE_ALERT'];
        for (const type of types) {
            await this.prisma.automationConfig.upsert({
                where: { branchId_type: { branchId, type } },
                update: {},
                create: {
                    branchId,
                    type,
                    isEnabled: false,
                    template: `Default template for ${type}`,
                },
            });
        }
    }

    async getExecutions(tenantContext: TenantContext, limit: number = 50) {
        const branchId = tenantContext.isSuperAdmin ? undefined : tenantContext.branchId;
        return this.prisma.automationExecution.findMany({
            where: branchId ? { branchId } : undefined,
            orderBy: { executedAt: 'desc' },
            take: limit,
            include: {
                config: { select: { type: true, isEnabled: true } },
            },
        });
    }

    async getExecutionStats(tenantContext: TenantContext) {
        const branchId = tenantContext.isSuperAdmin ? undefined : tenantContext.branchId;
        const where = branchId ? { branchId } : {};

        const [total, successful, failed, last24h] = await Promise.all([
            this.prisma.automationExecution.count({ where }),
            this.prisma.automationExecution.count({ where: { ...where, status: 'SUCCESS' } }),
            this.prisma.automationExecution.count({ where: { ...where, status: 'FAILED' } }),
            this.prisma.automationExecution.count({
                where: {
                    ...where,
                    executedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                },
            }),
        ]);

        return { total, successful, failed, last24h };
    }
}
