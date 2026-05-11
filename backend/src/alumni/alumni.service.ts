import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlumniProfileDto, UpdateAlumniProfileDto, CreateAlumniEventDto } from './dto/alumni.dto';

@Injectable()
export class AlumniService {
    constructor(private prisma: PrismaService) {}

    async createProfile(dto: CreateAlumniProfileDto) {
        const existing = await this.prisma.alumniProfile.findFirst({
            where: {
                OR: [
                    { userId: dto.userId },
                    ...(dto.studentId ? [{ studentId: dto.studentId }] : []),
                ],
            },
        });

        if (existing) {
            throw new ConflictException('Alumni profile already exists for this user/student');
        }

        return this.prisma.alumniProfile.create({
            data: dto,
        });
    }

    async updateProfile(id: string, dto: UpdateAlumniProfileDto) {
        return this.prisma.alumniProfile.update({
            where: { id },
            data: dto,
        });
    }

    async findAllProfiles(branchId: string, year?: number) {
        return this.prisma.alumniProfile.findMany({
            where: {
                user: { branchId },
                ...(year && { graduationYear: year }),
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async getProfile(userId: string) {
        const profile = await this.prisma.alumniProfile.findUnique({
            where: { userId },
            include: {
                user: true,
                student: true,
            },
        });

        if (!profile) throw new NotFoundException('Alumni profile not found');
        return profile;
    }

    async createEvent(dto: CreateAlumniEventDto, branchId: string) {
        return this.prisma.alumniEvent.create({
            data: {
                ...dto,
                date: new Date(dto.date),
                branchId,
            },
        });
    }

    async findAllEvents(branchId: string) {
        return this.prisma.alumniEvent.findMany({
            where: { branchId },
            include: {
                _count: {
                    select: { registrations: true },
                },
            },
            orderBy: { date: 'asc' },
        });
    }

    async registerForEvent(eventId: string, userId: string) {
        return this.prisma.alumniRegistration.upsert({
            where: {
                eventId_userId: { eventId, userId },
            },
            update: { status: 'REGISTERED' },
            create: {
                eventId,
                userId,
                status: 'REGISTERED',
            },
        });
    }

    async getEventAttendees(eventId: string) {
        return this.prisma.alumniRegistration.findMany({
            where: { eventId },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }
}
