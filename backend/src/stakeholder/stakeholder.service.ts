import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    SendMessageDto,
    CreateConversationDto,
    CreateAlumniDto,
    CreateAlumniEventDto,
    UpdateAlumniEventParticipationDto
} from './dto/stakeholder.dto';

@Injectable()
export class StakeholderService {
    constructor(private prisma: PrismaService) { }

    // --- PARENT PORTAL ---

    async getChildren(parentId: string) {
        return this.prisma.student.findMany({
            where: { parentId },
            include: {
                class: true,
                section: true,
                attendance: { take: 5, orderBy: { date: 'desc' } },
                invoices: { take: 5, orderBy: { createdAt: 'desc' } },
                resultSummaries: { take: 1, orderBy: { createdAt: 'desc' } }
            }
        });
    }

    async getChildAttendance(studentId: string, parentId: string) {
        const student = await this.prisma.student.findUnique({ where: { id: studentId } });
        if (!student || student.parentId !== parentId) throw new ForbiddenException();

        return this.prisma.attendance.findMany({
            where: { studentId },
            orderBy: { date: 'desc' }
        });
    }

    async getChildFinancials(studentId: string, parentId: string) {
        const student = await this.prisma.student.findUnique({ where: { id: studentId } });
        if (!student || student.parentId !== parentId) throw new ForbiddenException();

        return this.prisma.invoice.findMany({
            where: { studentId },
            include: { payments: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    // --- MESSAGING ---

    async createConversation(parentId: string, branchId: string, dto: CreateConversationDto) {
        return this.prisma.conversation.create({
            data: {
                branchId,
                participants: {
                    create: [
                        { userId: parentId },
                        { userId: dto.recipientId }
                    ]
                }
            },
            include: { participants: { include: { user: true } } }
        });
    }

    async sendMessage(senderId: string, dto: SendMessageDto) {
        return this.prisma.$transaction(async (tx) => {
            const message = await tx.message.create({
                data: {
                    content: dto.content,
                    conversationId: dto.conversationId,
                    senderId
                }
            });

            await tx.conversation.update({
                where: { id: dto.conversationId },
                data: { lastMessageAt: new Date() }
            });

            // Update unread count for other participants
            await tx.conversationParticipant.updateMany({
                where: {
                    conversationId: dto.conversationId,
                    NOT: { userId: senderId }
                },
                data: { unreadCount: { increment: 1 } }
            });

            return message;
        });
    }

    async getConversations(userId: string) {
        return this.prisma.conversation.findMany({
            where: { participants: { some: { userId } } },
            include: {
                participants: { include: { user: true } },
                messages: { take: 1, orderBy: { createdAt: 'desc' } }
            },
            orderBy: { lastMessageAt: 'desc' }
        });
    }

    // --- ALUMNI ---

    async createAlumni(branchId: string, dto: CreateAlumniDto) {
        return this.prisma.alumni.create({
            data: {
                ...dto,
                branchId,
                graduationDate: new Date(dto.graduationDate)
            }
        });
    }

    async getAlumni(branchId: string) {
        return this.prisma.alumni.findMany({
            where: { branchId, isPublic: true },
            include: { student: true }
        });
    }

    async createAlumniEvent(branchId: string, dto: CreateAlumniEventDto) {
        return this.prisma.alumniEvent.create({
            data: {
                ...dto,
                branchId,
                eventDate: new Date(dto.eventDate)
            }
        });
    }

    async getAlumniEvents(branchId: string) {
        return this.prisma.alumniEvent.findMany({
            where: { branchId },
            include: { participants: { include: { alumni: { include: { student: true } } } } },
            orderBy: { eventDate: 'asc' }
        });
    }

    async rsvpEvent(alumniId: string, eventId: string, status: string) {
        return this.prisma.alumniEventParticipant.upsert({
            where: { alumniId_eventId: { alumniId, eventId } },
            update: { status },
            create: { alumniId, eventId, status }
        });
    }
}
