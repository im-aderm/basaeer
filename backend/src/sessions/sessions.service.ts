import { Injectable } from '@nestjs/common';
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

  async findAll(): Promise<AcademicSession[]> {
    return this.prisma.academicSession.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string): Promise<AcademicSession | null> {
    return this.prisma.academicSession.findUnique({ where: { id } });
  }

  async findActive(): Promise<AcademicSession | null> {
    return this.prisma.academicSession.findFirst({
      where: { status: "CURRENT" },
    });
  }

  async update(
    id: string,
    data: Prisma.AcademicSessionUpdateInput,
  ): Promise<AcademicSession> {
    if ((data as any).status === 'CURRENT') {
      await this.prisma.academicSession.updateMany({
        where: { branchId: (data as any).branchId || undefined, NOT: { id } },
        data: { status: 'COMPLETED' },
      });
    }
    return this.prisma.academicSession.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<AcademicSession> {
    return this.prisma.academicSession.delete({ where: { id } });
  }
}
