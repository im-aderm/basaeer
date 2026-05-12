import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
} from './dto/template.dto';

@Injectable()
export class ReportTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportTemplateDto, branchId: string) {
    if (dto.isDefault) {
      // Unset previous default
      await this.prisma.reportTemplate.updateMany({
        where: { branchId, type: dto.type, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.reportTemplate.create({
      data: {
        ...dto,
        branchId,
      },
    });
  }

  async findAll(branchId: string) {
    return this.prisma.reportTemplate.findMany({
      where: { branchId, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, branchId: string) {
    const template = await this.prisma.reportTemplate.findFirst({
      where: { id, branchId },
    });

    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }

    return template;
  }

  async update(id: string, dto: UpdateReportTemplateDto, branchId: string) {
    await this.findOne(id, branchId);

    if (dto.isDefault) {
      const template = await this.prisma.reportTemplate.findUnique({
        where: { id },
      });
      await this.prisma.reportTemplate.updateMany({
        where: { branchId, type: template?.type, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.reportTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, branchId: string) {
    await this.findOne(id, branchId);
    return this.prisma.reportTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getDefaultTemplate(type: string, branchId: string) {
    return this.prisma.reportTemplate.findFirst({
      where: { branchId, type, isDefault: true, isActive: true },
    });
  }
}
