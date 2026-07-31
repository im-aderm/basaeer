import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, AcademicSession } from '../generated/client/client';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: Prisma.AcademicSessionCreateInput,
  ): Promise<AcademicSession> {
    // If this session is CURRENT, deactivate all others
    if ((data as any).status === 'CURRENT') {
      await this.prisma.academicSession.updateMany({
        where: { branchId: (data as any).branchId, status: 'CURRENT' },
        data: { status: 'COMPLETED' },
      });
    }
    return this.prisma.academicSession.create({ data });
  }

  async findAll(branchId?: string): Promise<AcademicSession[]> {
    return this.prisma.academicSession.findMany({
      where: { branchId },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string, branchId?: string): Promise<AcademicSession | null> {
    return this.prisma.academicSession.findFirst({ where: { id, branchId } });
  }

  async findActive(branchId?: string): Promise<AcademicSession | null> {
    return this.prisma.academicSession.findFirst({
      where: { status: 'CURRENT', branchId },
    });
  }

  async update(
    id: string,
    data: Prisma.AcademicSessionUpdateInput,
    branchId?: string,
  ): Promise<AcademicSession> {
    const existing = await this.prisma.academicSession.findFirst({
      where: { id, branchId },
    });
    if (!existing) {
      throw new NotFoundException('Academic session not found');
    }
    if ((data as any).status === 'CURRENT') {
      await this.prisma.academicSession.updateMany({
        where: { branchId: existing.branchId, NOT: { id } },
        data: { status: 'COMPLETED' },
      });
    }
    return this.prisma.academicSession.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, branchId?: string): Promise<AcademicSession> {
    const existing = await this.prisma.academicSession.findFirst({
      where: { id, branchId },
    });
    if (!existing) {
      throw new NotFoundException('Academic session not found');
    }
    return this.prisma.academicSession.delete({ where: { id } });
  }
}
