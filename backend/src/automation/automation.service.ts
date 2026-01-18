import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAutomationConfigDto } from './dto/automation.dto';

@Injectable()
export class AutomationService {
    constructor(private prisma: PrismaService) { }

    async getConfigs(branchId: string) {
        return this.prisma.automationConfig.findMany({
            where: { branchId }
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
