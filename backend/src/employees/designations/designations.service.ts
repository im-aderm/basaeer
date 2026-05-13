import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { TenantContext } from '../../auth/branch.guard';
import { TenantHelper } from '../../prisma/tenant-helper';

@Injectable()
export class DesignationsService {
  constructor(private prisma: PrismaService) {}

  async create(createDesignationDto: CreateDesignationDto) {
    return this.prisma.designation.create({
      data: createDesignationDto,
    });
  }

  async findAll(branchId: string | null) {
    return this.prisma.designation.findMany({
      where: { ...(branchId && { branchId }) },
    });
  }

  async findOne(id: string, context: TenantContext) {
    const desig = await this.prisma.designation.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!desig) throw new NotFoundException('Designation not found');
    return desig;
  }

  async remove(id: string, context: TenantContext) {
    const desig = await this.prisma.designation.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!desig) throw new NotFoundException('Designation not found');
    return this.prisma.designation.delete({
      where: { id },
    });
  }
}
