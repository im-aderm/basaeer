import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';

@Injectable()
export class AcademicSessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId: string, context: TenantContext) {
    return this.prisma.academicSession.findMany({
      where: { branchId },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string, context: TenantContext) {
    const session = await this.prisma.academicSession.findUnique({
      where: { id },
    });
    if (!session) {
      throw new NotFoundException('Academic session not found');
    }
    return session;
  }

  async create(data: {
    name: string;
    startDate: string;
    endDate: string;
    branchId: string;
  }, context: TenantContext) {
    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Check for duplicate name in the same branch
    const existing = await this.prisma.academicSession.findFirst({
      where: {
        branchId: data.branchId,
        name: data.name,
      },
    });
    if (existing) {
      throw new BadRequestException('A session with this name already exists for this branch');
    }

    // If this is the first session for the branch, make it CURRENT
    const sessionCount = await this.prisma.academicSession.count({
      where: { branchId: data.branchId },
    });

    const status = sessionCount === 0 ? 'CURRENT' : 'UPCOMING';

    // If setting as CURRENT, ensure no other CURRENT session exists
    if (status === 'CURRENT') {
      await this.prisma.academicSession.updateMany({
        where: {
          branchId: data.branchId,
          status: 'CURRENT',
        },
        data: { status: 'COMPLETED' },
      });
    }

    return this.prisma.academicSession.create({
      data: {
        ...data,
        startDate,
        endDate,
        status: status as any,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      startDate?: string;
      endDate?: string;
      status?: 'UPCOMING' | 'CURRENT' | 'COMPLETED';
    },
    context: TenantContext,
  ) {
    const existing = await this.prisma.academicSession.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Academic session not found');
    }

    // Validate dates if provided
    const startDate = data.startDate ? new Date(data.startDate) : existing.startDate;
    const endDate = data.endDate ? new Date(data.endDate) : existing.endDate;
    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // If transitioning to CURRENT, mark other CURRENT sessions as COMPLETED
    if (data.status === 'CURRENT') {
      await this.prisma.academicSession.updateMany({
        where: {
          branchId: existing.branchId,
          status: 'CURRENT',
          id: { not: id },
        },
        data: { status: 'COMPLETED' },
      });
    }

    // Prevent transitioning COMPLETED sessions back to other statuses
    if (existing.status === 'COMPLETED' && data.status && data.status !== 'COMPLETED') {
      throw new BadRequestException('Cannot change status of a completed session');
    }

    return this.prisma.academicSession.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.startDate && { startDate }),
        ...(data.endDate && { endDate }),
        ...(data.status && { status: data.status as any }),
      },
    });
  }

  async remove(id: string, context: TenantContext) {
    const existing = await this.prisma.academicSession.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Academic session not found');
    }

    // Check if session has any associated data
    const studentCount = await this.prisma.student.count({
      where: { sessionId: id } as any,
    });
    if (studentCount > 0) {
      throw new BadRequestException(
        'Cannot delete session with associated records. Please delete all records first.',
      );
    }

    return this.prisma.academicSession.delete({
      where: { id },
    });
  }

  async getActiveSession(branchId: string) {
    return this.prisma.academicSession.findFirst({
      where: {
        branchId,
        status: 'CURRENT',
      },
    });
  }
}
