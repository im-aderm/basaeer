import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { TenantContext } from '../../auth/branch.guard';
import { TenantHelper } from '../../prisma/tenant-helper';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: createDepartmentDto,
    });
  }

  async findAll(branchId: string | null) {
    return this.prisma.department.findMany({
      where: { ...(branchId && { branchId }) },
    });
  }

  async findOne(id: string, context: TenantContext) {
    const dept = await this.prisma.department.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async remove(id: string, context: TenantContext) {
    const dept = await this.prisma.department.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!dept) throw new NotFoundException('Department not found');
    return this.prisma.department.delete({
      where: { id },
    });
  }
}
