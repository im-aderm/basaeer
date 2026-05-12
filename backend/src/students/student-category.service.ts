import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentCategoryDto } from './dto/create-student-category.dto';
import { UpdateStudentCategoryDto } from './dto/update-student-category.dto';

@Injectable()
export class StudentCategoryService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateStudentCategoryDto) {
    return this.prisma.studentCategory.create({
      data: createDto,
    });
  }

  findAll(branchId: string | null) {
    return this.prisma.studentCategory.findMany({
      where: { ...(branchId && { branchId }) },
      include: { _count: { select: { students: true } } },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.studentCategory.findUnique({
      where: { id },
      include: { students: true },
    });
    if (!category)
      throw new NotFoundException(`Student Category with ID ${id} not found`);
    return category;
  }

  update(id: string, updateDto: UpdateStudentCategoryDto) {
    return this.prisma.studentCategory.update({
      where: { id },
      data: updateDto,
    });
  }

  remove(id: string) {
    return this.prisma.studentCategory.delete({
      where: { id },
    });
  }
}
