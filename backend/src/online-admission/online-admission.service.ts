import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOnlineAdmissionDto } from './dto/create-online-admission.dto';
import { UpdateOnlineAdmissionDto } from './dto/update-online-admission.dto';
import { UserRole } from '../generated/client/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { CommsService } from '../comms/comms.service';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class OnlineAdmissionService {
  private readonly logger = new Logger(OnlineAdmissionService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private commsService: CommsService,
  ) {}

  async create(createDto: CreateOnlineAdmissionDto, context: TenantContext) {
    const branchId = createDto.branchId || context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

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

  findAll(context: TenantContext, filters?: { status?: string }) {
    const where: any = TenantHelper.applyIsolation({}, context);
    if (filters?.status) {
      where.status = filters.status;
    }
    return this.prisma.onlineAdmission.findMany({
      where,
      include: {
        desiredClass: true,
        desiredSection: true,
        studentCategory: true,
        academicSession: true,
        previousSchools: true,
      },
      orderBy: { createdAt: 'desc' },
    });
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

    if (previousSchools) {
      await this.prisma.previousSchool.deleteMany({
        where: { admissionId: id },
      });
    }

    return this.prisma.onlineAdmission.update({
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
  }

  async remove(id: string, context: TenantContext) {
    await this.findOne(id, context);
    return this.prisma.onlineAdmission.delete({
      where: { id },
    });
  }

  async verifyPayment(id: string, context: TenantContext) {
    await this.findOne(id, context);
    return this.prisma.onlineAdmission.update({
      where: { id },
      data: {
        paymentStatus: 'VERIFIED' as any,
      },
    });
  }

  async rejectPayment(id: string, reason: string, context: TenantContext) {
    await this.findOne(id, context);
    return this.prisma.onlineAdmission.update({
      where: { id },
      data: {
        paymentStatus: 'REJECTED',
        rejectionReason: reason,
      },
    });
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

    const branchId = admission.branchId;

    return this.prisma.$transaction(async (tx) => {
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
          const parentPassword = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 8);
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
        const hashedPassword = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 8);

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

    if (admission.offerDeadline && new Date(admission.offerDeadline) < new Date()) {
      throw new BadRequestException('Offer has expired');
    }

    return this.prisma.onlineAdmission.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        offerAcceptedAt: new Date(),
      },
    });
  }

  async declineOffer(id: string, reason: string, context: TenantContext) {
    const admission = await this.findOne(id, context);

    if (admission.status !== 'ADMISSION_OFFERED') {
      throw new BadRequestException('No pending offer to decline');
    }

    return this.prisma.onlineAdmission.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        offerDeclinedAt: new Date(),
        offerDeclineReason: reason,
      },
    });
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

    return this.prisma.onlineAdmission.update({
      where: { id },
      data: {
        status: 'WAITLISTED',
        waitlistPosition: position,
        waitlistNotes: data?.notes,
      },
    });
  }

  async advanceFromWaitlist(id: string, context: TenantContext) {
    const admission = await this.findOne(id, context);

    if (admission.status !== 'WAITLISTED') {
      throw new BadRequestException('Application is not on waitlist');
    }

    // Make offer to waitlisted applicant
    return this.makeOffer(id, context, {
      offeredClassId: admission.desiredClassId,
      offeredSectionId: admission.desiredSectionId || undefined,
    });
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
