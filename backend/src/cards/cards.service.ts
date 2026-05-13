import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIdCardTemplateDto } from './dto/create-template.dto';
import { UpdateIdCardTemplateDto } from './dto/update-template.dto';
import { GenerateIdCardsDto } from './dto/generate-cards.dto';
import { QRService } from '../attendance/qr.service';
import { CommsService } from '../comms/comms.service';

@Injectable()
export class CardsService {
  constructor(
    private prisma: PrismaService,
    private qrService: QRService,
    private comms: CommsService,
  ) {}

  // Template Operations
  async createTemplate(dto: CreateIdCardTemplateDto) {
    return this.prisma.idCardTemplate.create({
      data: dto,
    });
  }

  async updateTemplate(id: string, dto: UpdateIdCardTemplateDto) {
    return this.prisma.idCardTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async findAllTemplates(branchId: string) {
    return this.prisma.idCardTemplate.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTemplate(id: string) {
    const template = await this.prisma.idCardTemplate.findUnique({
      where: { id },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async deleteTemplate(id: string) {
    return this.prisma.idCardTemplate.delete({
      where: { id },
    });
  }

  // ID Card Operations
  async generateCards(dto: GenerateIdCardsDto) {
    const { templateId, sessionId, studentIds, staffIds } = dto;

    return this.prisma.$transaction(async (tx) => {
      const results: any[] = [];

      // Handle Students
      if (studentIds) {
        for (const studentId of studentIds) {
          const student = await tx.student.findUnique({ where: { id: studentId }, select: { branchId: true } });
          if (!student) continue;

          const card = await tx.idCard.upsert({
            where: {
              studentId_sessionId: {
                studentId,
                sessionId,
              },
            },
            update: {
              templateId,
              status: 'CREATED',
              issueDate: new Date(),
            },
            create: {
              studentId,
              templateId,
              sessionId,
              status: 'CREATED',
              branchId: student.branchId,
            },
            include: {
              student: {
                include: {
                  user: true,
                },
              },
            },
          });
          results.push(card);
        }
      }

      // Handle Staff
      if (staffIds) {
        for (const staffId of staffIds) {
          const staff = await tx.staff.findUnique({
            where: { id: staffId },
            include: { user: { select: { branchId: true } } },
          });
          if (!staff || !staff.user?.branchId) continue;

          const card = await tx.idCard.create({
            data: {
              staffId,
              templateId,
              sessionId,
              status: 'CREATED',
              branchId: staff.user.branchId,
            },
            include: {
              staff: {
                include: {
                  user: true,
                },
              },
            },
          });
          results.push(card);
        }
      }

      // Notify parents when ID cards are generated
      for (const card of results) {
        if (card.student?.userId) {
          const student = await tx.student.findUnique({
            where: { id: card.studentId! },
            select: { parent: { select: { id: true, email: true, firstName: true } } },
          });
          if (student?.parent?.email) {
            this.comms.sendEmail({
              email: student.parent.email,
              subject: 'Student ID Card Ready',
              message: `Dear ${student.parent.firstName},\n\nThe student ID card for your ward has been generated and is ready for download from the parent portal.\n\nRegards,\nBasaer School Management`,
              branchId: sessionId,
            }).catch(() => {});
          }
        }
      }

      return results;
    });
  }

  async findAllCards(branchId: string, sessionId: string) {
    const cards = await this.prisma.idCard.findMany({
      where: {
        student: { branchId },
        sessionId,
      },
      include: {
        student: {
          include: {
            user: true,
            class: true,
            section: true,
            branch: true,
          },
        },
        template: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return cards.map((card) => ({
      ...card,
      qrPayload: card.studentId
        ? this.qrService.generateQRPayload(card.studentId, branchId)
        : null,
    }));
  }

  async findCard(id: string) {
    const card = await this.prisma.idCard.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
            class: true,
            section: true,
            branch: true,
          },
        },
        template: true,
        session: true,
      },
    });
    if (!card) throw new NotFoundException('ID Card not found');

    return {
      ...card,
      qrPayload: card.studentId
        ? this.qrService.generateQRPayload(
            card.studentId,
            card.student?.branchId ?? '',
          )
        : null,
    };
  }
}
