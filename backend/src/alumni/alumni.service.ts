import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAlumniProfileDto,
  UpdateAlumniProfileDto,
  CreateAlumniEventDto,
} from './dto/alumni.dto';

@Injectable()
export class AlumniService {
  constructor(private prisma: PrismaService) {}

  async createProfile(dto: CreateAlumniProfileDto) {
    const existing = await this.prisma.alumni.findFirst({
      where: {
        OR: [...(dto.studentId ? [{ studentId: dto.studentId }] : [])],
      },
    });

    if (existing) {
      throw new ConflictException(
        'Alumni profile already exists for this student',
      );
    }

    return this.prisma.alumni.create({
      data: {
        studentId: dto.studentId ?? '',
        graduationDate: dto.graduationYear
          ? new Date(`${dto.graduationYear}-01-01`)
          : new Date(),
        currentOccupation: dto.currentRole,
        currentCompany: dto.currentCompany,
        higherEducation: dto.university,
        isPublic: dto.isMentoring ?? true,
        branchId: 'default',
      },
    });
  }

  async updateProfile(id: string, dto: UpdateAlumniProfileDto) {
    return this.prisma.alumni.update({
      where: { id },
      data: {
        currentOccupation: dto.currentRole,
        currentCompany: dto.currentCompany,
        higherEducation: dto.university,
        isPublic: dto.isMentoring,
      },
    });
  }

  async findAllProfiles(branchId: string, year?: number) {
    return this.prisma.alumni.findMany({
      where: {
        branchId,
        ...(year && {
          graduationDate: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        }),
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            user: { select: { email: true } },
          },
        },
      },
    });
  }

  async getProfile(studentId: string) {
    const profile = await this.prisma.alumni.findUnique({
      where: { studentId },
      include: {
        student: true,
      },
    });

    if (!profile) throw new NotFoundException('Alumni profile not found');
    return profile;
  }

  async createEvent(dto: CreateAlumniEventDto, branchId: string) {
    return this.prisma.alumniEvent.create({
      data: {
        title: dto.title,
        description: dto.description,
        eventDate: new Date(dto.date),
        location: dto.location,
        branchId,
      },
    });
  }

  async findAllEvents(branchId: string) {
    return this.prisma.alumniEvent.findMany({
      where: { branchId },
      include: {
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { eventDate: 'asc' },
    });
  }

  async registerForEvent(eventId: string, alumniId: string) {
    return this.prisma.alumniEventParticipant.upsert({
      where: {
        alumniId_eventId: { alumniId, eventId },
      },
      update: { status: 'REGISTERED' },
      create: {
        eventId,
        alumniId,
        status: 'REGISTERED',
      },
    });
  }

  async getEventAttendees(eventId: string) {
    return this.prisma.alumniEventParticipant.findMany({
      where: { eventId },
      include: {
        alumni: {
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
      },
    });
  }
}
