import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAutomationConfigDto, UpsertAutomationConfigDto } from './dto/automation.dto';

@Injectable()
export class AutomationService {
    constructor(private prisma: PrismaService) { }

    async getConfigs(branchId?: string) {
        return this.prisma.automationConfig.findMany({
            where: { branchId: branchId || undefined }
        });
    }

    async upsertConfig(dto: UpsertAutomationConfigDto) {
        const { branchId, type, ...rest } = dto;
        return this.prisma.automationConfig.upsert({
            where: { branchId_type: { branchId: branchId || '', type } },
            update: { ...rest },
            create: {
                branchId: branchId || '',
                type,
                ...rest
            }
        });
    }

    async updateConfig(branchId: string, type: string, dto: UpdateAutomationConfigDto) {
        return this.prisma.automationConfig.upsert({
            where: { branchId_type: { branchId, type } },
            update: { ...dto },
            create: {
                branchId,
                type,
                ...dto
            }
        });
    }

    async listJobs(branchId?: string) {
        return this.prisma.scheduledJob.findMany({
            where: {
                branchId: branchId || null
            }
        });
    }

    async toggleJob(id: string, isEnabled: boolean) {
        return this.prisma.scheduledJob.update({
            where: { id },
            data: { isEnabled }
        });
    }

    async seedInitialConfigs(branchId: string) {
        const types = ['BIRTHDAY_WISH', 'FEE_REMINDER', 'ATTENDANCE_ALERT'];
        for (const type of types) {
            await this.prisma.automationConfig.upsert({
                where: { branchId_type: { branchId, type } },
                update: {},
                create: {
                    branchId,
                    type,
                    isEnabled: false,
                    template: `Default template for ${type}`
                }
            });
        }
    }
}
