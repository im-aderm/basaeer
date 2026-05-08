import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import { Term, UserRole } from '../generated/client/client';

@Injectable()
export class ResultApprovalService {
    constructor(private readonly prisma: PrismaService) { }

    private branchId(context: TenantContext) {
        if (!context.branchId) throw new ForbiddenException('Branch context required');
        return context.branchId;
    }

    private async audit(context: TenantContext, action: string, details: string) {
        await this.prisma.auditLog.create({ data: { userId: context.userId, action, module: 'RESULT_APPROVAL', details } });
    }

    async submit(dto: any, context: TenantContext) {
        const branchId = this.branchId(context);
        if (!dto.sessionId || !dto.term) throw new BadRequestException('sessionId and term are required');
        const approval = await this.prisma.resultApproval.create({
            data: {
                branchId,
                sessionId: dto.sessionId,
                term: dto.term,
                classId: dto.classId,
                sectionId: dto.sectionId,
                subjectId: dto.subjectId,
                status: 'SUBMITTED',
                currentStep: 'HOD_REVIEW',
                requestedById: context.userId,
            },
        });
        await this.audit(context, 'RESULT_SUBMITTED', `Submitted approval ${approval.id}`);
        return approval;
    }

    async list(query: any, context: TenantContext) {
        const branchId = context.isSuperAdmin && query.branchId ? query.branchId : this.branchId(context);
        return this.prisma.resultApproval.findMany({
            where: {
                branchId,
                ...(query.sessionId && { sessionId: query.sessionId }),
                ...(query.term && { term: query.term as Term }),
                ...(query.status && { status: query.status }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async review(id: string, dto: any, context: TenantContext) {
        const approval = await this.prisma.resultApproval.findFirst({ where: { id, branchId: this.branchId(context) } });
        if (!approval) throw new NotFoundException('Approval request not found');
        if (!['approve', 'reject', 'request_revision'].includes(dto.action)) throw new BadRequestException('Invalid approval action');

        let status: any = approval.status;
        let currentStep = approval.currentStep;
        const role = context.role;
        if (dto.action === 'reject') {
            status = 'REJECTED';
        } else if (dto.action === 'request_revision') {
            status = 'REVISION_REQUESTED';
            currentStep = 'TEACHER';
        } else if (role === UserRole.HOD || role === UserRole.EXAM_OFFICER || role === UserRole.BRANCH_ADMIN || role === UserRole.SUPER_ADMIN) {
            status = 'PRINCIPAL_REVIEW';
            currentStep = 'PRINCIPAL_REVIEW';
        }
        if (dto.action === 'approve' && (role === UserRole.PRINCIPAL || role === UserRole.SUPER_ADMIN || role === UserRole.BRANCH_ADMIN)) {
            status = 'APPROVED';
            currentStep = 'APPROVED';
        }

        const updated = await this.prisma.resultApproval.update({
            where: { id },
            data: {
                status,
                currentStep,
                reviewedById: context.userId,
                rejectionNote: dto.action === 'reject' ? dto.note : approval.rejectionNote,
                revisionNote: dto.action === 'request_revision' ? dto.note : approval.revisionNote,
                approvedAt: status === 'APPROVED' ? new Date() : approval.approvedAt,
            },
        });
        await this.audit(context, 'RESULT_APPROVAL_REVIEWED', `Approval ${id} action ${dto.action}`);
        return updated;
    }

    async publish(dto: any, context: TenantContext) {
        const branchId = this.branchId(context);
        if (!dto.sessionId || !dto.term) throw new BadRequestException('sessionId and term are required');
        const approval = await this.prisma.resultApproval.findFirst({
            where: {
                branchId,
                sessionId: dto.sessionId,
                term: dto.term,
                classId: dto.classId || null,
                sectionId: dto.sectionId || null,
                status: 'APPROVED',
            },
        });
        if (!approval) throw new ForbiddenException('Approved result workflow required before publication');

        const publication = await this.prisma.resultPublication.upsert({
            where: {
                branchId_sessionId_term_classId_sectionId: {
                    branchId,
                    sessionId: dto.sessionId,
                    term: dto.term,
                    classId: dto.classId || null,
                    sectionId: dto.sectionId || null,
                },
            },
            update: { isPublished: true, publishedAt: new Date(), publishedById: context.userId, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null },
            create: { branchId, sessionId: dto.sessionId, term: dto.term, classId: dto.classId, sectionId: dto.sectionId, isPublished: true, publishedAt: new Date(), publishedById: context.userId, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null },
        });

        await this.prisma.resultSummary.updateMany({
            where: {
                branchId,
                sessionId: dto.sessionId,
                term: dto.term,
                ...(dto.sectionId && { student: { sectionId: dto.sectionId } }),
            },
            data: { isLocked: true },
        });
        await this.prisma.resultApproval.update({ where: { id: approval.id }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
        await this.audit(context, 'RESULT_PUBLISHED', `Published results for session ${dto.sessionId}, term ${dto.term}`);
        return publication;
    }

    async revokePublication(id: string, context: TenantContext) {
        const publication = await this.prisma.resultPublication.findFirst({ where: { id, branchId: this.branchId(context) } });
        if (!publication) throw new NotFoundException('Publication not found');
        const updated = await this.prisma.resultPublication.update({ where: { id }, data: { isPublished: false } });
        await this.audit(context, 'RESULT_PUBLICATION_REVOKED', `Revoked publication ${id}`);
        return updated;
    }
}
