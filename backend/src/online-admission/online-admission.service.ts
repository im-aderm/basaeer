import { BCRYPT_ROUNDS } from '../common/constants/security.constants';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOnlineAdmissionDto } from './dto/create-online-admission.dto';
import { UpdateOnlineAdmissionDto } from './dto/update-online-admission.dto';
import { UserRole } from '../generated/client/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { FinanceService } from '../finance/finance.service';
import { CommsService } from '../comms/comms.service';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class OnlineAdmissionService {
  private readonly logger = new Logger(OnlineAdmissionService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private commsService: CommsService,
    private auditService: AuditService,
    private financeService: FinanceService,
  ) {}

  async create(createDto: CreateOnlineAdmissionDto, context?: TenantContext | null) {
    const branchId = createDto.branchId || context?.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    // Duplicate check: same guardian + same student within 30 days
    if (createDto.guardianEmail) {
      const recentCutoff = new Date();
      recentCutoff.setDate(recentCutoff.getDate() - 30);
      const duplicate = await this.prisma.onlineAdmission.findFirst({
        where: {
          guardianEmail: createDto.guardianEmail,
          firstName: createDto.firstName,
          lastName: createDto.lastName,
          dateOfBirth: new Date(createDto.dateOfBirth),
          createdAt: { gte: recentCutoff },
          branchId,
        },
      });
      if (duplicate) {
        throw new ConflictException(
          'An application for this student was already submitted within the last 30 days. Please contact the school if you have questions.',
        );
      }
    }

    const {
      dateOfBirth,
      admissionDate,
      approvalDate,
      consentDate,
      previousSchools,
      surname,
      ...rest
    } = createDto;

    const admission = await this.prisma.onlineAdmission.create({
      data: {
        ...(rest as any),
        branchId,
        dateOfBirth: new Date(dateOfBirth),
        ...(admissionDate && { admissionDate: new Date(admissionDate) }),
        ...(approvalDate && { approvalDate: new Date(approvalDate) }),
        ...(consentDate && { consentDate: new Date(consentDate) }),
        previousSchools: {
          create: previousSchools || [],
        },
      },
      include: {
        previousSchools: true,
      },
    });

    try {
      await this.mailService.sendAdmissionReceived(
        admission.guardianEmail || '',
        `${admission.firstName} ${admission.lastName}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${admission.guardianEmail}`,
        error,
      );
    }

    return admission;
  }

  async findAll(
    context: TenantContext,
    filters?: {
      status?: string;
      page?: number;
      limit?: number;
      search?: string;
    },
  ) {
    const where: any = TenantHelper.applyIsolation({}, context);
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.search) {
      const search = filters.search;
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { guardianEmail: { contains: search, mode: 'insensitive' } },
        { guardianPhone: { contains: search } },
        { admissionNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.onlineAdmission.findMany({
        where,
        skip,
        take: limit,
        include: {
          desiredClass: true,
          desiredSection: true,
          studentCategory: true,
          academicSession: true,
          previousSchools: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.onlineAdmission.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string, context: TenantContext) {
    const admission = await this.prisma.onlineAdmission.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
      include: {
        desiredClass: true,
        desiredSection: true,
        studentCategory: true,
        academicSession: true,
        previousSchools: true,
      },
    });
    if (!admission)
      throw new NotFoundException(
        `Admission application not found or access denied`,
      );
    return admission;
  }

  async update(
    id: string,
    updateDto: UpdateOnlineAdmissionDto,
    context: TenantContext,
  ) {
    // Ownership check
    await this.findOne(id, context);

    const {
      dateOfBirth,
      admissionDate,
      approvalDate,
      consentDate,
      previousSchools,
      ...rest
    } = updateDto;

    return this.prisma.$transaction(async (tx) => {
      if (previousSchools) {
        await tx.previousSchool.deleteMany({
          where: { admissionId: id },
        });
      }

      return tx.onlineAdmission.update({
        where: { id },
        data: {
          ...(rest as any),
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(admissionDate && { admissionDate: new Date(admissionDate) }),
          ...(approvalDate && { approvalDate: new Date(approvalDate) }),
          ...(consentDate && { consentDate: new Date(consentDate) }),
          ...(previousSchools && {
            previousSchools: {
              create: previousSchools,
            },
          }),
        },
        include: {
          previousSchools: true,
        },
      });
    });
  }

  async remove(id: string, context: TenantContext) {
    const admission = await this.findOne(id, context);
    await this.prisma.onlineAdmission.delete({
      where: { id },
    });

    await this.auditService.log({
      action: 'ADMISSION_DELETED',
      module: 'ONLINE_ADMISSION',
      context,
      targetId: id,
      targetType: 'OnlineAdmission',
      details: { status: admission.status, studentName: `${admission.firstName} ${admission.lastName}` },
    });

    return admission;
  }

  async verifyPayment(id: string, context: TenantContext) {
    const admission = await this.findOne(id, context);
    if (admission.paymentStatus !== 'PENDING') {
      throw new BadRequestException('Payment has already been processed');
    }
    const result = await this.prisma.onlineAdmission.update({
      where: { id },
      data: {
        paymentStatus: 'VERIFIED' as any,
      },
    });

    await this.auditService.log({
      action: 'PAYMENT_VERIFIED',
      module: 'ONLINE_ADMISSION',
      context,
      targetId: id,
      targetType: 'OnlineAdmission',
    });

    return result;
  }

  async rejectPayment(id: string, reason: string, context: TenantContext) {
    await this.findOne(id, context);
    const result = await this.prisma.onlineAdmission.update({
      where: { id },
      data: {
        paymentStatus: 'REJECTED',
        rejectionReason: reason,
      },
    });

    await this.auditService.log({
      action: 'PAYMENT_REJECTED',
      module: 'ONLINE_ADMISSION',
      context,
      targetId: id,
      targetType: 'OnlineAdmission',
      reason,
    });

    return result;
  }

  async reject(id: string, reason: string, context: TenantContext) {
    const admission = await this.findOne(id, context);

    const updated = await this.prisma.onlineAdmission.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
    });

    await this.auditService.log({
      action: 'ADMISSION_REJECTED',
      module: 'ONLINE_ADMISSION',
      context,
      targetId: id,
      targetType: 'OnlineAdmission',
      reason,
    });

    try {
      await this.mailService.sendRejectionEmail(
        admission.guardianEmail || '',
        `${admission.firstName} ${admission.lastName}`,
        reason,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send rejection email to ${admission.guardianEmail}`,
        error,
      );
    }

    return updated;
  }

  async approve(
    id: string,
    context: TenantContext,
    approvalData?: { classId?: string; sectionId?: string },
  ) {
    const admission = await this.findOne(id, context);
    if (admission.status === 'ENROLLED') {
      throw new ConflictException('Application is already enrolled');
    }
    if (admission.status === 'REJECTED' || admission.status === 'CANCELLED') {
      throw new BadRequestException('Cannot approve a rejected or cancelled application');
    }

    const branchId = admission.branchId;

    const result = await this.prisma.$transaction(async (tx) => {
      const year = new Date().getFullYear();

      const counter = await tx.counter.upsert({
        where: { branchId_model: { branchId, model: 'Student' } },
        update: { lastValue: { increment: 1 } },
        create: { branchId, model: 'Student', lastValue: 1 },
      });
      const studentIdNumber = `BMS-${year}-${counter.lastValue.toString().padStart(4, '0')}`;

      let parentId = admission.parentId;

      if (!parentId && admission.guardianEmail) {
        const existingParent = await tx.user.findUnique({
          where: { email: admission.guardianEmail },
        });

        if (existingParent && existingParent.role === UserRole.PARENT) {
          parentId = existingParent.id;
        }

        if (!parentId) {
          const parentPassword = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), BCRYPT_ROUNDS);
          const guardianNameParts = (admission.guardianName || '').trim().split(/\s+/);
          const newParent = await tx.user.create({
            data: {
              email: admission.guardianEmail,
              password: parentPassword,
              firstName: guardianNameParts[0] || 'Guardian',
              lastName:
                admission.lastName ||
                guardianNameParts.slice(1).join(' ') || 'Unknown',
              phone: admission.guardianPhone,
              role: UserRole.PARENT,
              branchId,
              mustChangePassword: true,
            },
          });
          parentId = newParent.id;
        }
      }

      let userId: string | null = null;

      if (admission.createPortalAccount) {
        const email =
          admission.studentEmail ||
          `std.${admission.firstName.toLowerCase()}.${admission.lastName.toLowerCase()}.${counter.lastValue}@basaer.com`;
        const hashedPassword = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), BCRYPT_ROUNDS);

        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName: admission.firstName,
            lastName: admission.lastName,
            phone: admission.guardianPhone,
            role: UserRole.STUDENT,
            branchId,
            mustChangePassword: true,
          },
        });
        userId = user.id;
      }

      const student = await tx.student.create({
        data: {
          userId,
          parentId,
          firstName: admission.firstName,
          lastName: admission.lastName,
          otherNames: admission.otherNames,
          dob: admission.dateOfBirth,
          branchId,
          classId: approvalData?.classId || admission.desiredClassId,
          sectionId: approvalData?.sectionId || admission.desiredSectionId,
          categoryId: admission.studentCategoryId,
          placeOfBirth: admission.placeOfBirth,
          nationality: admission.nationality,
          stateOfOrigin: admission.stateOfOrigin,
          lga: admission.lga,
          religion: admission.religion,
          passportPhoto: admission.passportPhoto,
          guardianOccupation: admission.guardianOccupation,
          guardianOfficeAddress: admission.guardianOfficeAddress,
          secondaryGuardianName: admission.secondaryGuardianName,
          secondaryGuardianPhone: admission.secondaryGuardianPhone,
          secondaryGuardianRelation: admission.secondaryGuardianRelation,
          city: admission.city,
          state: admission.state,
          country: admission.country,
          emergencyContactName: admission.emergencyContactName,
          emergencyContactPhone: admission.emergencyContactPhone,
          emergencyContactRelation: admission.emergencyContactRelation,
          bloodGroup: admission.bloodGroup,
          genotype: admission.genotype,
          allergies: admission.allergies,
          medicalConditions: admission.medicalConditions,
          specialNeeds: admission.specialNeeds,
          familyDoctorName: admission.familyDoctorName,
          familyDoctorPhone: admission.familyDoctorPhone,
          birthCertificateUrl: admission.birthCertificateUrl,
          testimonialUrl: admission.testimonialUrl,
          transferCertificateUrl: admission.transferCertificateUrl,
          immunizationCardUrl: admission.immunizationCardUrl,
          preferredLanguage: admission.preferredLanguage,
          religionClassType: admission.religionClassType,
          scholarshipEligible: admission.scholarshipEligible,
          referralSource: admission.referralSource,
        },
      });

      await tx.onlineAdmission.update({
        where: { id },
        data: {
          status: 'ENROLLED',
          approvalDate: new Date(),
          admissionNumber: studentIdNumber,
        },
      });

      await this.auditService.log({
        action: 'ADMISSION_APPROVED',
        module: 'ONLINE_ADMISSION',
        context,
        targetId: id,
        targetType: 'OnlineAdmission',
        details: { studentIdNumber, classId: student.classId, sectionId: student.sectionId },
      });

      try {
        await this.mailService.sendApprovalEmail(
          admission.guardianEmail || '',
          `${admission.firstName} ${admission.lastName}`,
          studentIdNumber,
        );
      } catch (error) {
        this.logger.error(`Failed to send approval email`, error);
      }

      return student;
    });

    // After the student is enrolled, optionally raise the admission/registration
    // fee as an invoice so it can be collected — and discounted — through the
    // normal finance flow. Runs outside the enrolment transaction and is
    // non-fatal: a billing hiccup must never block an approval.
    await this.createAdmissionFeeInvoice(result.id, branchId, context);

    return result;
  }

  /**
   * Raises the admission/registration fee as an invoice for a newly-enrolled
   * student. Opt-in via the `admission_generate_fee_invoice` setting so existing
   * schools that collect the fee another way are unaffected. The invoice is a
   * normal fee invoice, so the existing invoice-discount flow applies to it.
   */
  private async createAdmissionFeeInvoice(
    studentId: string,
    branchId: string,
    context: TenantContext,
  ): Promise<void> {
    try {
      const settings = await this.prisma.globalSetting.findMany({
        where: {
          key: { in: ['admission_generate_fee_invoice', 'admission_fee'] },
          OR: [{ branchId }, { branchId: null }],
        },
        select: { key: true, value: true, branchId: true },
      });
      const pick = (key: string) =>
        settings.find((s) => s.key === key && s.branchId === branchId)?.value ??
        settings.find((s) => s.key === key && s.branchId === null)?.value ??
        '';

      if (pick('admission_generate_fee_invoice') !== 'true') return;

      const fee = parseFloat(pick('admission_fee') || '0');
      if (!fee || fee <= 0) return;

      // Find-or-create the "Admission Fee" category for this branch.
      let category = await this.prisma.feeCategory.findFirst({
        where: { branchId, name: 'Admission Fee' },
      });
      if (!category) {
        category = await this.prisma.feeCategory.create({
          data: {
            name: 'Admission Fee',
            description: 'One-time admission / registration fee',
            branchId,
          },
        });
      }

      const dueDate = new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000,
      ).toISOString();

      await this.financeService.createInvoice(
        {
          studentId,
          dueDate,
          branchId,
          items: [{ categoryId: category.id, amount: fee }],
        },
        context,
      );
    } catch (err) {
      this.logger.error(
        `Failed to create admission fee invoice for student ${studentId}: ${(err as Error).message}`,
      );
    }
  }

  async getPublicInitData(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { name: true },
    });

    if (!branch) throw new NotFoundException('Branch not found');

    const [classes, sessions, settings, sections] = await Promise.all([
      this.prisma.class.findMany({
        where: { branchId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.academicSession.findMany({
        where: { branchId },
        select: { id: true, name: true, status: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.globalSetting.findMany({
        where: {
          OR: [
            { branchId },
            { branchId: null },
          ],
          key: {
            in: [
              'admission_bank_name',
              'admission_account_number',
              'admission_account_name',
              'admission_fee',
            ],
          },
        },
        select: { key: true, value: true },
      }),
      this.prisma.section.findMany({
        where: { class: { branchId } },
        select: { id: true, name: true, classId: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    // Group sections by classId
    const sectionsByClass: Record<string, { id: string; name: string }[]> = {};
    for (const section of sections) {
      if (!sectionsByClass[section.classId]) {
        sectionsByClass[section.classId] = [];
      }
      sectionsByClass[section.classId].push({ id: section.id, name: section.name });
    }

    return {
      branchName: branch.name,
      classes,
      sessions,
      sections: sectionsByClass,
      currentSession: sessions.find(s => s.status === 'CURRENT') || sessions[0] || null,
      bankDetails: {
        bankName: settingsMap.admission_bank_name || '',
        accountNumber: settingsMap.admission_account_number || '',
        accountName: settingsMap.admission_account_name || '',
      },
      admissionFee: settingsMap.admission_fee || '',
    };
  }

  async getPipeline(context: TenantContext) {
    const where = TenantHelper.applyIsolation({}, context);

    const total = await this.prisma.onlineAdmission.count({ where });
    const statusCounts = await this.prisma.onlineAdmission.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    }) as unknown as Array<{ status: string; _count: { status: number } }>;

    const pipeline: Record<string, number> = {
      APPLICATION_RECEIVED: 0,
      DOCUMENT_REVIEW: 0,
      INTERVIEW_SCHEDULED: 0,
      INTERVIEW_COMPLETED: 0,
      EXAM_SCHEDULED: 0,
      EXAM_COMPLETED: 0,
      ADMISSION_OFFERED: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      WAITLISTED: 0,
      ENROLLED: 0,
      CANCELLED: 0,
    };

    for (const item of statusCounts) {
      if (item.status) {
        pipeline[item.status] = item._count.status;
      }
    }
    pipeline.TOTAL = total;

    return pipeline;
  }

  async makeOffer(
    id: string,
    context: TenantContext,
    offerData: {
      offeredClassId?: string;
      offeredSectionId?: string;
      reassignmentReason?: string;
      offerDeadline?: string;
    },
  ) {
    const admission = await this.findOne(id, context);

    if (admission.status === 'ENROLLED') {
      throw new ConflictException('Application is already enrolled');
    }
    if (admission.status === 'REJECTED' || admission.status === 'CANCELLED') {
      throw new BadRequestException('Cannot make offer on rejected/cancelled application');
    }

    if (offerData.offerDeadline && new Date(offerData.offerDeadline) <= new Date()) {
      throw new BadRequestException('Offer deadline must be in the future');
    }

    const deadline = offerData.offerDeadline
      ? new Date(offerData.offerDeadline)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default

    const updated = await this.prisma.onlineAdmission.update({
      where: { id },
      data: {
        status: 'ADMISSION_OFFERED',
        offeredClassId: offerData.offeredClassId || admission.desiredClassId,
        offeredSectionId: offerData.offeredSectionId || admission.desiredSectionId,
        classReassignmentReason: offerData.reassignmentReason,
        offerLetterSentAt: new Date(),
        offerDeadline: deadline,
      },
      include: {
        offeredClass: { select: { id: true, name: true } },
        offeredSection: { select: { id: true, name: true } },
        desiredClass: { select: { id: true, name: true } },
        desiredSection: { select: { id: true, name: true } },
      },
    });

    await this.auditService.log({
      action: 'OFFER_MADE',
      module: 'ONLINE_ADMISSION',
      context,
      targetId: id,
      targetType: 'OnlineAdmission',
      details: { offeredClassId: updated.offeredClassId, deadline: deadline.toISOString() },
    });

    // Send offer email
    try {
      const offeredClassName = updated.offeredClass?.name || 'N/A';
      const offeredSectionName = updated.offeredSection?.name || 'N/A';
      await this.mailService.sendAdmissionOffer(
        admission.guardianEmail || '',
        `${admission.firstName} ${admission.lastName}`,
        offeredClassName,
        offeredSectionName,
        deadline,
        admission.branchId,
      );

      // Send SMS notification
      if (admission.guardianPhone) {
        await this.commsService.sendSms({
          phone: admission.guardianPhone,
          message: `Dear ${admission.guardianName}, admission offer for ${admission.firstName} ${admission.lastName} - Class: ${offeredClassName}. Please respond by ${deadline.toLocaleDateString()}.`,
          branchId: admission.branchId,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to send offer notification`, error);
    }

    return updated;
  }

  async acceptOffer(id: string, context: TenantContext) {
    const admission = await this.findOne(id, context);

    if (admission.status !== 'ADMISSION_OFFERED') {
      throw new BadRequestException('No pending offer to accept');
    }

    if (admission.offerAcceptedAt) {
      throw new BadRequestException('Offer has already been accepted');
    }

    if (admission.offerDeadline && new Date(admission.offerDeadline) < new Date()) {
      throw new BadRequestException('Offer has expired');
    }

    const result = await this.prisma.onlineAdmission.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        offerAcceptedAt: new Date(),
      },
    });

    await this.auditService.log({
      action: 'OFFER_ACCEPTED',
      module: 'ONLINE_ADMISSION',
      context,
      targetId: id,
      targetType: 'OnlineAdmission',
    });

    return result;
  }

  async declineOffer(id: string, reason: string, context: TenantContext) {
    const admission = await this.findOne(id, context);

    if (admission.status !== 'ADMISSION_OFFERED') {
      throw new BadRequestException('No pending offer to decline');
    }

    const result = await this.prisma.onlineAdmission.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        offerDeclinedAt: new Date(),
        offerDeclineReason: reason,
      },
    });

    await this.auditService.log({
      action: 'OFFER_DECLINED',
      module: 'ONLINE_ADMISSION',
      context,
      targetId: id,
      targetType: 'OnlineAdmission',
      reason,
    });

    return result;
  }

  async addToWaitlist(id: string, context: TenantContext, data?: { position?: number; notes?: string }) {
    const admission = await this.findOne(id, context);

    // Find max waitlist position if not specified
    let position = data?.position;
    if (!position) {
      const maxWaitlist = await this.prisma.onlineAdmission.aggregate({
        where: TenantHelper.applyIsolation({ waitlistPosition: { not: null } }, context),
        _max: { waitlistPosition: true },
      });
      position = (maxWaitlist._max.waitlistPosition || 0) + 1;
    }

    const result = await this.prisma.onlineAdmission.update({
      where: { id },
      data: {
        status: 'WAITLISTED',
        waitlistPosition: position,
        waitlistNotes: data?.notes,
      },
    });

    await this.auditService.log({
      action: 'WAITLIST_ADDED',
      module: 'ONLINE_ADMISSION',
      context,
      targetId: id,
      targetType: 'OnlineAdmission',
      details: { position, notes: data?.notes },
    });

    return result;
  }

  async advanceFromWaitlist(id: string, context: TenantContext) {
    const admission = await this.findOne(id, context);

    if (admission.status !== 'WAITLISTED') {
      throw new BadRequestException('Application is not on waitlist');
    }

    await this.auditService.log({
      action: 'WAITLIST_ADVANCED',
      module: 'ONLINE_ADMISSION',
      context,
      targetId: id,
      targetType: 'OnlineAdmission',
    });

    // Decrement waitlist positions for remaining applicants behind this one
    if (admission.waitlistPosition) {
      await this.prisma.onlineAdmission.updateMany({
        where: {
          status: 'WAITLISTED',
          waitlistPosition: { gt: admission.waitlistPosition },
          branchId: admission.branchId,
        },
        data: {
          waitlistPosition: { decrement: 1 },
        },
      });
    }

    // Make offer to waitlisted applicant
    return this.makeOffer(id, context, {
      offeredClassId: admission.desiredClassId,
      offeredSectionId: admission.desiredSectionId || undefined,
    });
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async handleExpiredOffersCron() {
    this.logger.log('Running expired offers cron job');
    const expired = await this.prisma.onlineAdmission.findMany({
      where: {
        status: 'ADMISSION_OFFERED',
        offerDeadline: { lt: new Date() },
      },
    });

    for (const admission of expired) {
      await this.prisma.onlineAdmission.update({
        where: { id: admission.id },
        data: {
          status: 'WAITLISTED',
          offerDeadline: null,
          offeredClassId: null,
          offeredSectionId: null,
          offerLetterSentAt: null,
        },
      });

      try {
        await this.mailService.sendOfferExpired(
          admission.guardianEmail || '',
          `${admission.firstName} ${admission.lastName}`,
          admission.branchId,
        );
      } catch (error) {
        this.logger.error(`Failed to send expiry notification`, error);
      }
    }

    this.logger.log(`Expired offers cron: ${expired.length} offers expired`);
  }

  async checkExpiredOffers(context: TenantContext) {
    const expired = await this.prisma.onlineAdmission.findMany({
      where: TenantHelper.applyIsolation(
        {
          status: 'ADMISSION_OFFERED',
          offerDeadline: { lt: new Date() },
        },
        context,
      ),
    });

    for (const admission of expired) {
      await this.prisma.onlineAdmission.update({
        where: { id: admission.id },
        data: {
          status: 'WAITLISTED',
          offerDeadline: null,
          offeredClassId: null,
          offeredSectionId: null,
          offerLetterSentAt: null,
        },
      });

      try {
        await this.mailService.sendOfferExpired(
          admission.guardianEmail || '',
          `${admission.firstName} ${admission.lastName}`,
          admission.branchId,
        );
      } catch (error) {
        this.logger.error(`Failed to send expiry notification`, error);
      }
    }

    return { count: expired.length, ids: expired.map(a => a.id) };
  }
}
