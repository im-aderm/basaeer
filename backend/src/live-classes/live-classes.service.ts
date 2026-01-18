import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from './encryption.service';
import { GoogleMeetService } from './google-meet.service';
import {
    CreateGoogleMeetConfigDto,
    UpdateGoogleMeetConfigDto,
    CreateSessionDto,
    UpdateSessionDto,
    RecordParticipantDto
} from './dto/live-classes.dto';

@Injectable()
export class LiveClassesService {
    constructor(
        private prisma: PrismaService,
        private encryption: EncryptionService,
        private googleMeet: GoogleMeetService
    ) { }

    // ==================== Configuration Management ====================

    async createOrUpdateConfig(dto: CreateGoogleMeetConfigDto) {
        // Encrypt sensitive fields
        const encryptedServiceAccount = this.encryption.encrypt(dto.serviceAccountJson);
        const encryptedClientSecret = this.encryption.encrypt(dto.clientSecret);
        const encryptedApiKey = this.encryption.encrypt(dto.apiKey);

        return this.prisma.googleMeetConfig.upsert({
            where: { branchId: dto.branchId },
            update: {
                serviceAccountJson: encryptedServiceAccount,
                projectId: dto.projectId,
                clientId: dto.clientId,
                clientSecret: encryptedClientSecret,
                apiKey: encryptedApiKey,
                isEnabled: dto.isEnabled ?? true,
                defaultDuration: dto.defaultDuration ?? 60,
                allowRecording: dto.allowRecording ?? false,
                requireApproval: dto.requireApproval ?? true,
            },
            create: {
                branchId: dto.branchId,
                serviceAccountJson: encryptedServiceAccount,
                projectId: dto.projectId,
                clientId: dto.clientId,
                clientSecret: encryptedClientSecret,
                apiKey: encryptedApiKey,
                isEnabled: dto.isEnabled ?? true,
                defaultDuration: dto.defaultDuration ?? 60,
                allowRecording: dto.allowRecording ?? false,
                requireApproval: dto.requireApproval ?? true,
            },
        });
    }

    async getConfig(branchId: string) {
        const config = await this.prisma.googleMeetConfig.findUnique({
            where: { branchId },
        });

        if (!config) {
            throw new NotFoundException('Google Meet configuration not found for this branch');
        }

        // Return config without decrypted sensitive fields
        return {
            id: config.id,
            branchId: config.branchId,
            projectId: config.projectId,
            clientId: config.clientId,
            isEnabled: config.isEnabled,
            defaultDuration: config.defaultDuration,
            allowRecording: config.allowRecording,
            requireApproval: config.requireApproval,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt,
        };
    }

    async testConnection(branchId: string) {
        return this.googleMeet.testConnection(branchId);
    }

    // ==================== Session Management ====================

    async createSession(branchId: string, hostId: string, dto: CreateSessionDto) {
        const config = await this.prisma.googleMeetConfig.findUnique({
            where: { branchId },
        });

        if (!config || !config.isEnabled) {
            throw new BadRequestException('Google Meet is not enabled for this branch');
        }

        // Get host email
        const host = await this.prisma.staff.findUnique({
            where: { id: hostId },
            include: { user: true },
        });

        if (!host) {
            throw new NotFoundException('Host staff member not found');
        }

        // Calculate end time if not provided
        const startTime = new Date(dto.scheduledStart);
        const endTime = dto.scheduledEnd
            ? new Date(dto.scheduledEnd)
            : new Date(startTime.getTime() + config.defaultDuration * 60000);

        // Create Google Meet
        const meetingData = await this.googleMeet.createMeeting({
            branchId,
            title: dto.title,
            description: dto.description,
            startTime,
            endTime,
            hostEmail: host.user.email,
        });

        // Create session in database
        return this.prisma.liveClassSession.create({
            data: {
                title: dto.title,
                description: dto.description,
                meetingId: meetingData.meetingId || '',
                hostUrl: meetingData.hostUrl || '',
                participantUrl: meetingData.participantUrl || '',
                classId: dto.classId,
                sectionId: dto.sectionId,
                subjectId: dto.subjectId,
                hostId,
                scheduledStart: startTime,
                scheduledEnd: endTime,
                branchId,
                status: 'SCHEDULED',
            },
            include: {
                host: { include: { user: true } },
                class: true,
                section: true,
                subject: true,
            },
        });
    }

    async getSessions(branchId: string, filters?: {
        status?: string;
        classId?: string;
        sectionId?: string;
        hostId?: string;
    }) {
        return this.prisma.liveClassSession.findMany({
            where: {
                branchId,
                status: filters?.status,
                classId: filters?.classId,
                sectionId: filters?.sectionId,
                hostId: filters?.hostId,
            },
            include: {
                host: { include: { user: true } },
                class: true,
                section: true,
                subject: true,
                _count: { select: { participants: true } },
            },
            orderBy: { scheduledStart: 'desc' },
        });
    }

    async getSessionById(id: string) {
        const session = await this.prisma.liveClassSession.findUnique({
            where: { id },
            include: {
                host: { include: { user: true } },
                class: true,
                section: true,
                subject: true,
                participants: {
                    include: { user: true },
                    orderBy: { joinedAt: 'desc' },
                },
            },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        return session;
    }

    async updateSession(id: string, dto: UpdateSessionDto) {
        return this.prisma.liveClassSession.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                scheduledStart: dto.scheduledStart ? new Date(dto.scheduledStart) : undefined,
                scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : undefined,
                status: dto.status,
            },
            include: {
                host: { include: { user: true } },
                class: true,
                section: true,
                subject: true,
            },
        });
    }

    async startSession(id: string) {
        return this.prisma.liveClassSession.update({
            where: { id },
            data: {
                status: 'LIVE',
                actualStart: new Date(),
            },
        });
    }

    async endSession(id: string) {
        return this.prisma.liveClassSession.update({
            where: { id },
            data: {
                status: 'ENDED',
                actualEnd: new Date(),
            },
        });
    }

    async cancelSession(id: string, branchId: string) {
        const session = await this.prisma.liveClassSession.findUnique({
            where: { id },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        // Delete from Google Calendar
        try {
            await this.googleMeet.deleteMeeting(branchId, session.meetingId);
        } catch (error) {
            console.error('Failed to delete Google Meet:', error);
            // Continue with cancellation even if Google deletion fails
        }

        return this.prisma.liveClassSession.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
    }

    // ==================== Participant Management ====================

    async recordParticipant(sessionId: string, dto: RecordParticipantDto) {
        const session = await this.prisma.liveClassSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        if (dto.action === 'join') {
            return this.prisma.meetingParticipant.upsert({
                where: {
                    sessionId_userId: {
                        sessionId,
                        userId: dto.userId,
                    },
                },
                update: {
                    joinedAt: new Date(),
                    leftAt: null,
                    duration: null,
                },
                create: {
                    sessionId,
                    userId: dto.userId,
                    joinedAt: new Date(),
                },
            });
        } else {
            // Leave action
            const participant = await this.prisma.meetingParticipant.findUnique({
                where: {
                    sessionId_userId: {
                        sessionId,
                        userId: dto.userId,
                    },
                },
            });

            if (!participant || !participant.joinedAt) {
                throw new BadRequestException('Participant has not joined yet');
            }

            const leftAt = new Date();
            const duration = Math.floor((leftAt.getTime() - participant.joinedAt.getTime()) / 1000);

            return this.prisma.meetingParticipant.update({
                where: {
                    sessionId_userId: {
                        sessionId,
                        userId: dto.userId,
                    },
                },
                data: {
                    leftAt,
                    duration,
                },
            });
        }
    }

    async getParticipants(sessionId: string) {
        return this.prisma.meetingParticipant.findMany({
            where: { sessionId },
            include: { user: true },
            orderBy: { joinedAt: 'desc' },
        });
    }

    async getAttendanceReport(sessionId: string) {
        const session = await this.getSessionById(sessionId);
        const participants = await this.getParticipants(sessionId);

        return {
            session: {
                id: session.id,
                title: session.title,
                scheduledStart: session.scheduledStart,
                scheduledEnd: session.scheduledEnd,
                actualStart: session.actualStart,
                actualEnd: session.actualEnd,
                status: session.status,
            },
            totalParticipants: participants.length,
            participants: participants.map(p => ({
                userId: p.userId,
                name: `${p.user.firstName} ${p.user.lastName}`,
                email: p.user.email,
                joinedAt: p.joinedAt,
                leftAt: p.leftAt,
                duration: p.duration,
            })),
        };
    }
}
