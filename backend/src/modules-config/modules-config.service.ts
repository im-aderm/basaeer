import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpsertModuleConfigDto,
  ToggleModuleDto,
} from './dto/module-config.dto';

@Injectable()
export class ModulesConfigService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId?: string) {
    return this.prisma.moduleConfiguration.findMany({
      where: {
        branchId: branchId || null,
      },
    });
  }

  async upsert(dto: UpsertModuleConfigDto) {
    const { moduleKey, branchId, ...rest } = dto;
    const searchBranchId = branchId || null;

    const existing = await this.prisma.moduleConfiguration.findFirst({
      where: {
        moduleKey,
        branchId: searchBranchId,
      },
    });

    if (existing) {
      return this.prisma.moduleConfiguration.update({
        where: { id: existing.id },
        data: { ...rest },
      });
    }

    return this.prisma.moduleConfiguration.create({
      data: {
        moduleKey,
        branchId: searchBranchId,
        ...rest,
      },
    });
  }

  async toggle(moduleKey: string, dto: ToggleModuleDto) {
    const searchBranchId = dto.branchId || null;

    const existing = await this.prisma.moduleConfiguration.findFirst({
      where: {
        moduleKey,
        branchId: searchBranchId,
      },
    });

    if (existing) {
      return this.prisma.moduleConfiguration.update({
        where: { id: existing.id },
        data: { isEnabled: dto.isEnabled },
      });
    }

    return this.prisma.moduleConfiguration.create({
      data: {
        moduleKey,
        branchId: searchBranchId,
        isEnabled: dto.isEnabled,
      },
    });
  }
}
