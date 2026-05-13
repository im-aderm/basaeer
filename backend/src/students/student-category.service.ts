import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentCategoryDto } from './dto/create-student-category.dto';
import { UpdateStudentCategoryDto } from './dto/update-student-category.dto';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class StudentCategoryService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateStudentCategoryDto, context: TenantContext) {
    return this.prisma.studentCategory.create({
      data: {
        ...createDto,
        branchId: createDto.branchId || context.branchId!,
      },
    });
  }

  findAll(branchId: string | null) {
    return this.prisma.studentCategory.findMany({
      where: { ...(branchId && { branchId }) },
      include: { _count: { select: { students: true } } },
    });
  }

  async findOne(id: string, context: TenantContext) {
    const category = await this.prisma.studentCategory.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
      include: { students: true },
    });
    if (!category)
      throw new NotFoundException(`Student Category with ID ${id} not found`);
    return category;
  }

  async update(id: string, updateDto: UpdateStudentCategoryDto, context: TenantContext) {
    const existing = await this.prisma.studentCategory.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException(`Student Category with ID ${id} not found`);
    return this.prisma.studentCategory.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string, context: TenantContext) {
    const existing = await this.prisma.studentCategory.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException(`Student Category with ID ${id} not found`);
    return this.prisma.studentCategory.delete({
      where: { id },
    });
  }
}
