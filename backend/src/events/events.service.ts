import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import { CreateCampusEventDto, UpdateEventRSVPDto } from './dto/events.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async createEvent(branchId: string, dto: CreateCampusEventDto) {
    return this.prisma.campusEvent.create({
      data: {
        ...dto,
        branchId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async getEvents(branchId: string, isPublic?: boolean) {
    return this.prisma.campusEvent.findMany({
      where: {
        branchId,
        ...(isPublic !== undefined ? { isPublic } : {}),
      },
      include: {
        _count: {
          select: { rsvps: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async getEventDetails(id: string, context: TenantContext) {
    const event = await this.prisma.campusEvent.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
      include: {
        rsvps: {
          include: {
            user: {
              select: { firstName: true, lastName: true, role: true },
            },
          },
        },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async updateRSVP(eventId: string, userId: string, dto: UpdateEventRSVPDto) {
    return this.prisma.eventRSVP.upsert({
      where: {
        eventId_userId: { eventId, userId },
      },
      update: { status: dto.status },
      create: { eventId, userId, status: dto.status },
    });
  }

  async deleteEvent(id: string, context: TenantContext) {
    const event = await this.prisma.campusEvent.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!event) throw new NotFoundException('Event not found');
    return this.prisma.campusEvent.delete({ where: { id } });
  }
}
