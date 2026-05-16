import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdmissionInterviewDto, UpdateAdmissionInterviewDto, CompleteInterviewDto, BulkScheduleInterviewDto } from './dto/create-admission-interview.dto';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class AdmissionInterviewService {
  private readonly logger = new Logger(AdmissionInterviewService.name);

  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateAdmissionInterviewDto, context: TenantContext) {
    const branchId = createDto.branchId || context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    if (!context.isSuperAdmin && context.branchId !== branchId) {
      throw new ForbiddenException('You do not have access to this branch');
    }

    // Verify admission exists and belongs to branch
    const admission = await this.prisma.onlineAdmission.findFirst({
      where: TenantHelper.applyIsolation({ id: createDto.admissionId }, context),
    });
    if (!admission) throw new NotFoundException('Admission not found');

    // Check if interview already exists
    const existing = await this.prisma.admissionInterview.findFirst({
      where: TenantHelper.applyIsolation({ admissionId: createDto.admissionId }, context),
    });
    if (existing) throw new ConflictException('Interview already scheduled for this admission');

    return this.prisma.$transaction(async (tx) => {
      const interview = await tx.admissionInterview.create({
        data: {
          ...createDto,
          branchId,
          interviewDate: new Date(createDto.interviewDate),
        },
        include: {
          admission: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              guardianEmail: true,
              guardianPhone: true,
              desiredClass: { select: { id: true, name: true } },
            },
          },
          branch: { select: { id: true, name: true } },
        },
      });

      // Update admission status
      await tx.onlineAdmission.update({
        where: { id: createDto.admissionId },
        data: { status: 'INTERVIEW_SCHEDULED' },
      });

      return interview;
    });
  }

  async findAll(context: TenantContext, filters?: { status?: string; dateFrom?: string; dateTo?: string }) {
    const where = TenantHelper.applyIsolation({}, context);

    if (filters?.status) {
      (where as any).status = filters.status;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      (where as any).interviewDate = {};
      if (filters.dateFrom) (where as any).interviewDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) (where as any).interviewDate.lte = new Date(filters.dateTo);
    }

    return this.prisma.admissionInterview.findMany({
      where,
      include: {
        admission: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            gender: true,
            guardianEmail: true,
            guardianPhone: true,
            desiredClass: { select: { id: true, name: true } },
            desiredSection: { select: { id: true, name: true } },
            status: true,
          },
        },
        branch: { select: { id: true, name: true } },
      },
      orderBy: { interviewDate: 'asc' },
    });
  }

  async findOne(id: string, context: TenantContext) {
    const interview = await this.prisma.admissionInterview.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
      include: {
        admission: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherNames: true,
            gender: true,
            dateOfBirth: true,
            guardianName: true,
            guardianRelation: true,
            guardianEmail: true,
            guardianPhone: true,
            desiredClass: { select: { id: true, name: true } },
            desiredSection: { select: { id: true, name: true } },
            status: true,
          },
        },
        branch: { select: { id: true, name: true } },
      },
    });

    if (!interview) throw new NotFoundException('Interview not found or access denied');
    return interview;
  }

  async update(id: string, updateDto: UpdateAdmissionInterviewDto, context: TenantContext) {
    const interview = await this.findOne(id, context);

    const data: any = { ...updateDto };
    if (updateDto.interviewDate) data.interviewDate = new Date(updateDto.interviewDate);

    return this.prisma.admissionInterview.update({
      where: { id },
      data,
    });
  }

  async complete(id: string, completeDto: CompleteInterviewDto, context: TenantContext) {
    const interview = await this.findOne(id, context);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.admissionInterview.update({
        where: { id },
        data: {
          status: 'COMPLETED' as any,
          outcome: (completeDto.outcome || 'PENDING_REVIEW') as any,
          notes: completeDto.notes,
        },
      });

      // Update admission status based on outcome
      let admissionStatus: string = 'INTERVIEW_COMPLETED';
      if (completeDto.outcome === 'FAIL') {
        admissionStatus = 'REJECTED';
      }

      await tx.onlineAdmission.update({
        where: { id: interview.admissionId },
        data: {
          status: admissionStatus as any,
          ...(completeDto.outcome === 'FAIL' && { rejectionReason: completeDto.notes || 'Interview not passed' }),
        },
      });

      return updated;
    });
  }

  async bulkSchedule(dto: BulkScheduleInterviewDto, context: TenantContext) {
    const branchId = context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    const results = { success: 0, failed: 0, details: [] as string[] };

    for (const admissionId of dto.admissionIds) {
      try {
        const admission = await this.prisma.onlineAdmission.findFirst({
          where: TenantHelper.applyIsolation({ id: admissionId }, context),
        });
        if (!admission) {
          results.failed++;
          results.details.push(`Admission ${admissionId} not found`);
          continue;
        }

        const existing = await this.prisma.admissionInterview.findFirst({
          where: TenantHelper.applyIsolation({ admissionId }, context),
        });
        if (existing) {
          results.failed++;
          results.details.push(`Interview already scheduled for ${admission.firstName} ${admission.lastName}`);
          continue;
        }

        await this.prisma.$transaction(async (tx) => {
          await tx.admissionInterview.create({
            data: {
              admissionId,
              branchId,
              interviewDate: new Date(dto.interviewDate),
              venue: dto.venue,
              interviewerName: dto.interviewerName,
              status: 'SCHEDULED',
            },
          });

          await tx.onlineAdmission.update({
            where: { id: admissionId },
            data: { status: 'INTERVIEW_SCHEDULED' },
          });
        });

        results.success++;
        results.details.push(`Interview scheduled for ${admission.firstName} ${admission.lastName}`);
      } catch (error: any) {
        results.failed++;
        results.details.push(`Failed: ${error.message}`);
      }
    }

    return results;
  }

  async remove(id: string, context: TenantContext) {
    const interview = await this.findOne(id, context);

    return this.prisma.$transaction(async (tx) => {
      await tx.admissionInterview.delete({ where: { id } });

      // Reset admission status
      return tx.onlineAdmission.update({
        where: { id: interview.admissionId },
        data: { status: 'DOCUMENT_REVIEW' },
      });
    });
  }
}
