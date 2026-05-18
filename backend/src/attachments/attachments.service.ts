import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  async createCategory(name: string, description: string | undefined, branchId: string) {
    return this.prisma.attachmentCategory.create({
      data: { name, description, branchId },
    });
  }

  async getCategories(branchId: string) {
    return this.prisma.attachmentCategory.findMany({
      where: { branchId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { resources: true } } },
    });
  }

  async deleteCategory(id: string) {
    const cat = await this.prisma.attachmentCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return this.prisma.attachmentCategory.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async saveUpload(
    title: string,
    categoryId: string,
    classIds: string[],
    sectionIds: string[],
    fileUrl: string,
    fileType: string,
    uploadedBy: string,
    branchId: string,
  ) {
    const activeSession = await this.prisma.academicSession.findFirst({
      where: { branchId, status: "CURRENT" },
    });
    const sessionId = activeSession?.id ?? '';

    return this.prisma.digitalResource.create({
      data: {
        title,
        categoryId,
        classId: classIds?.[0],
        sectionId: sectionIds?.[0],
        fileUrl,
        fileType,
        uploaderId: uploadedBy,
        branchId,
        sessionId,
      },
    });
  }
}
