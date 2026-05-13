import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOnlineAdmissionDto } from './dto/create-online-admission.dto';
import { UpdateOnlineAdmissionDto } from './dto/update-online-admission.dto';
import { UserRole } from '../generated/client/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class OnlineAdmissionService {
  private readonly logger = new Logger(OnlineAdmissionService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
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

  findAll(context: TenantContext) {
    return this.prisma.onlineAdmission.findMany({
      where: TenantHelper.applyIsolation({}, context),
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
      const count = await tx.student.count({
        where: { branchId },
      });
      const studentIdNumber = `BMS-${year}-${(count + 1).toString().padStart(4, '0')}`;

      let parentId = admission.parentId;

      if (!parentId && admission.guardianEmail) {
        const existingParent = await tx.user.findUnique({
          where: { email: admission.guardianEmail },
        });

        if (existingParent && existingParent.role === UserRole.PARENT) {
          parentId = existingParent.id;
        }

        if (!parentId) {
          const parentPassword = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 10);
          const newParent = await tx.user.create({
            data: {
              email: admission.guardianEmail,
              password: parentPassword,
              firstName: admission.guardianName.split(' ')[0],
              lastName:
                admission.lastName ||
                admission.guardianName.split(' ').slice(1).join(' '),
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
          `std.${admission.firstName.toLowerCase()}.${admission.lastName.toLowerCase()}${count + 1}@basaer.com`;
        const hashedPassword = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 10);

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

    const [classes, currentSession, settings] = await Promise.all([
      this.prisma.class.findMany({
        where: { branchId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.academicSession.findFirst({
        where: { isActive: true, branchId },
        select: { id: true, name: true },
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
    ]);

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return {
      branchName: branch.name,
      classes,
      currentSession,
      bankDetails: {
        bankName: settingsMap.admission_bank_name || '',
        accountNumber: settingsMap.admission_account_number || '',
        accountName: settingsMap.admission_account_name || '',
      },
      admissionFee: settingsMap.admission_fee || '',
    };
  }
}
