import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getSettings(branchId?: string) {
        return this.prisma.globalSetting.findMany({
            where: {
                OR: [
                    { branchId: null },
                    { branchId: branchId || undefined }
                ]
            }
        });
    }

    async updateSetting(dto: UpdateSettingDto, branchId?: string) {
        return this.prisma.globalSetting.upsert({
            where: { key: dto.key },
            update: { value: dto.value, branchId: branchId || null },
            create: { key: dto.key, value: dto.value, branchId: branchId || null }
        });
    }

    async getSettingByKey(key: string) {
        return this.prisma.globalSetting.findUnique({
            where: { key }
        });
    }
}
