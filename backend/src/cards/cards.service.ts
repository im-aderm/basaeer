import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIdCardTemplateDto } from './dto/create-template.dto';
import { UpdateIdCardTemplateDto } from './dto/update-template.dto';
import { GenerateIdCardsDto } from './dto/generate-cards.dto';
import { QRService } from '../attendance/qr.service';

@Injectable()
export class CardsService {
    constructor(
        private prisma: PrismaService,
        private qrService: QRService
    ) { }

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
                        },
                        include: {
                            student: {
                                include: {
                                    user: true,
                                }
                            }
                        }
                    });
                    results.push(card);
                }
            }

            // Handle Staff
            if (staffIds) {
                for (const staffId of staffIds) {
                    // Logic for staff cards (could be unique per session too if required)
                    // Currently model only has unique for student/session
                    const card = await tx.idCard.create({
                        data: {
                            staffId,
                            templateId,
                            sessionId,
                            status: 'CREATED',
                        },
                        include: {
                            staff: {
                                include: {
                                    user: true,
                                }
                            }
                        }
                    });
                    results.push(card);
                }
            }

            // TODO: Trigger parent notifications here in Phase 9

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

        return cards.map(card => ({
            ...card,
            qrPayload: card.studentId ? this.qrService.generateQRPayload(card.studentId, branchId) : null
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
            qrPayload: card.studentId ? this.qrService.generateQRPayload(card.studentId, card.student?.branchId!) : null
        };
    }
}
