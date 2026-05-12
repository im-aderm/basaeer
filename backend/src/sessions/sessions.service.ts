import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, AcademicSession } from '../generated/client/client';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: Prisma.AcademicSessionCreateInput,
  ): Promise<AcademicSession> {
    // If this session is active, deactivate all others
    if (data.isActive) {
      await this.prisma.academicSession.updateMany({
        where: { isActive: true },
        data: { isActive: false },
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
      where: { isActive: true },
    });
  }

  async update(
    id: string,
    data: Prisma.AcademicSessionUpdateInput,
  ): Promise<AcademicSession> {
    if (data.isActive === true) {
      await this.prisma.academicSession.updateMany({
        where: { isActive: true, NOT: { id } },
        data: { isActive: false },
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
