import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(branchId?: string) {
    return this.prisma.globalSetting.findMany({
      where: {
        OR: [{ branchId: null }, { branchId: branchId || undefined }],
      },
    });
  }

  async updateSetting(dto: UpdateSettingDto, branchId?: string) {
    const bId = branchId || null;

    const existing = await this.prisma.globalSetting.findFirst({
      where: {
        key: dto.key,
        branchId: bId,
      },
    });

    if (existing) {
      return this.prisma.globalSetting.update({
        where: { id: existing.id },
        data: { value: dto.value },
      });
    } else {
      return this.prisma.globalSetting.create({
        data: {
          key: dto.key,
          value: dto.value,
          branchId: bId,
        },
      });
    }
  }

  async getSettingByKey(key: string, branchId?: string) {
    return this.prisma.globalSetting.findFirst({
      where: {
        key,
        branchId: branchId || null,
      },
    });
  }

  async upsertSettings(dtos: UpdateSettingDto[], branchId?: string) {
    const bId = branchId || null;

    return this.prisma.$transaction(
      dtos.map((dto) =>
        this.prisma.globalSetting.upsert({
          where: {
            key_branchId: {
              key: dto.key,
              branchId: bId as string,
            },
          },
          update: { value: dto.value },
          create: {
            key: dto.key,
            value: dto.value,
            branchId: bId,
          },
        }),
      ),
    );
  }
}
