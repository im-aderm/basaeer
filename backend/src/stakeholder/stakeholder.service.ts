import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import {
  SendMessageDto,
  CreateConversationDto,
  CreateAlumniDto,
  CreateAlumniEventDto,
  UpdateAlumniEventParticipationDto,
} from './dto/stakeholder.dto';

@Injectable()
export class StakeholderService {
  constructor(private prisma: PrismaService) {}

  // --- PARENT PORTAL ---

  async getChildren(parentId: string) {
    return this.prisma.student.findMany({
      where: { parentId },
      include: {
        class: true,
        section: true,
        attendance: { take: 30, orderBy: { date: 'desc' } },
        invoices: {
          include: { payments: true },
          orderBy: { createdAt: 'desc' },
        },
        resultSummaries: {
          take: 1,
          orderBy: { term: 'desc' },
        },
      },
    });
  }

  async getChildAttendance(studentId: string, parentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student || student.parentId !== parentId)
      throw new ForbiddenException();

    return this.prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    });
  }

  async getChildFinancials(studentId: string, parentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student || student.parentId !== parentId)
      throw new ForbiddenException();

    return this.prisma.invoice.findMany({
      where: { studentId },
      include: {
        items: { include: { category: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getChildHomework(studentId: string, parentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student || student.parentId !== parentId)
      throw new ForbiddenException();

    return this.prisma.assignment.findMany({
      where: {
        sectionId: student.sectionId || '',
      },
      include: {
        subject: true,
        submissions: {
          where: { studentId },
        },
      },
      orderBy: { dueDate: 'desc' },
    });
  }

  async getChildExams(studentId: string, parentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student || student.parentId !== parentId)
      throw new ForbiddenException();

    return this.prisma.assessmentRecord.findMany({
      where: { studentId },
      include: {
        subject: true,
        session: true,
      },
      orderBy: [{ sessionId: 'desc' }, { term: 'desc' }],
    });
  }

  async getParentEvents(parentId: string) {
    const children = await this.prisma.student.findMany({
      where: { parentId },
      select: { branchId: true },
    });

    const branchIds = [...new Set(children.map((c) => c.branchId))];

    return this.prisma.campusEvent.findMany({
      where: {
        branchId: { in: branchIds },
      },
      orderBy: { startDate: 'asc' },
      take: 10,
    });
  }

  // --- ADMIN PARENT MANAGEMENT ---

  async getAllParentsAdmin(branchId?: string) {
    return this.prisma.user.findMany({
      where: {
        role: 'PARENT',
        ...(branchId && { branchId }),
      },
      include: {
        children: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getParentDetailsAdmin(parentId: string, context: TenantContext) {
    const parent = await this.prisma.user.findFirst({
      where: TenantHelper.applyIsolation({ id: parentId, role: 'PARENT' }, context),
      include: {
        children: {
          include: {
            class: true,
            section: true,
            invoices: {
              select: {
                balance: true,
              },
            },
          },
        },
      },
    });

    if (!parent || parent.role !== 'PARENT')
      throw new NotFoundException('Parent not found');
    return parent;
  }

  async linkStudentToParent(parentId: string, studentId: string, context: TenantContext) {
    // Ensure parent exists
    const parent = await this.prisma.user.findFirst({
      where: TenantHelper.applyIsolation({ id: parentId, role: 'PARENT' }, context),
    });
    if (!parent) throw new NotFoundException('Parent not found');

    // Ensure student exists
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.student.update({
      where: { id: studentId },
      data: { parentId },
    });
  }

  async unlinkStudentFromParent(studentId: string, context: TenantContext) {
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
    });
    if (!student) throw new NotFoundException('Student not found');
    return this.prisma.student.update({
      where: { id: studentId },
      data: { parentId: null },
    });
  }

  // --- MESSAGING ---

  async createConversation(
    parentId: string,
    branchId: string,
    dto: CreateConversationDto,
  ) {
    return this.prisma.conversation.create({
      data: {
        branchId,
        participants: {
          create: [{ userId: parentId }, { userId: dto.recipientId }],
        },
      },
      include: { participants: { include: { user: true } } },
    });
  }

  async sendMessage(senderId: string, dto: SendMessageDto) {
    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          content: dto.content,
          conversationId: dto.conversationId,
          senderId,
        },
      });

      await tx.conversation.update({
        where: { id: dto.conversationId },
        data: { lastMessageAt: new Date() },
      });

      // Update unread count for other participants
      await tx.conversationParticipant.updateMany({
        where: {
          conversationId: dto.conversationId,
          NOT: { userId: senderId },
        },
        data: { unreadCount: { increment: 1 } },
      });

      return message;
    });
  }

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  // --- ALUMNI ---

  async createAlumni(branchId: string, dto: CreateAlumniDto) {
    return this.prisma.alumni.create({
      data: {
        ...dto,
        branchId,
        graduationDate: new Date(dto.graduationDate),
      },
    });
  }

  async getAlumni(branchId?: string) {
    return this.prisma.alumni.findMany({
      where: { branchId, isPublic: true },
      include: { student: true },
    });
  }

  async createAlumniEvent(branchId: string, dto: CreateAlumniEventDto) {
    return this.prisma.alumniEvent.create({
      data: {
        ...dto,
        branchId,
        eventDate: new Date(dto.eventDate),
      },
    });
  }

  async getAlumniEvents(branchId?: string) {
    return this.prisma.alumniEvent.findMany({
      where: { branchId },
      include: {
        participants: { include: { alumni: { include: { student: true } } } },
      },
      orderBy: { eventDate: 'asc' },
    });
  }

  async rsvpEvent(userId: string, eventId: string, status: string) {
    // The caller supplies their own userId, not an alumniId — resolve the
    // Alumni record linked to them via Student.userId (an alumnus is a
    // former Student). Previously this passed userId straight through as
    // if it were an alumniId, silently creating malformed participant rows.
    const alumni = await this.prisma.alumni.findFirst({
      where: { student: { userId } },
      select: { id: true },
    });
    if (!alumni) {
      throw new NotFoundException('No alumni record is linked to this account');
    }

    return this.prisma.alumniEventParticipant.upsert({
      where: { alumniId_eventId: { alumniId: alumni.id, eventId } },
      update: { status: status as any },
      create: { alumniId: alumni.id, eventId, status: status as any },
    });
  }
}
