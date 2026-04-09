import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOnlineAdmissionDto } from './dto/create-online-admission.dto';
import { UpdateOnlineAdmissionDto } from './dto/update-online-admission.dto';
import { UserRole } from '../generated/client/client';
import * as bcrypt from 'bcrypt';

import { MailService } from '../mail/mail.service';

@Injectable()
export class OnlineAdmissionService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    async create(createDto: CreateOnlineAdmissionDto) {
        const { dateOfBirth, admissionDate, approvalDate, consentDate, previousSchools, ...rest } = createDto;
        
        const admission = await this.prisma.onlineAdmission.create({
            data: {
                ...rest,
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
            }
        });

        // Send acknowledgement email
        try {
            await this.mailService.sendAdmissionReceived(admission.guardianEmail || '', `${admission.firstName} ${admission.lastName}`);
        } catch (e) {
            console.error('Failed to send acknowledgement email', e);
        }

        return admission;
    }

    findAll(branchId: string | null) {
        return this.prisma.onlineAdmission.findMany({
            where: { ...(branchId && { branchId }) },
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

    async findOne(id: string) {
        const admission = await this.prisma.onlineAdmission.findUnique({
            where: { id },
            include: {
                desiredClass: true,
                desiredSection: true,
                studentCategory: true,
                academicSession: true,
                previousSchools: true,
            },
        });
        if (!admission) throw new NotFoundException(`Admission application with ID ${id} not found`);
        return admission;
    }

    async update(id: string, updateDto: UpdateOnlineAdmissionDto) {
        const { dateOfBirth, admissionDate, approvalDate, consentDate, previousSchools, ...rest } = updateDto;
        
        // Handle previousSchools update if provided (simple clear and recreate for now)
        if (previousSchools) {
            await this.prisma.previousSchool.deleteMany({
                where: { admissionId: id }
            });
        }

        return this.prisma.onlineAdmission.update({
            where: { id },
            data: {
                ...rest,
                ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
                ...(admissionDate && { admissionDate: new Date(admissionDate) }),
                ...(approvalDate && { approvalDate: new Date(approvalDate) }),
                ...(consentDate && { consentDate: new Date(consentDate) }),
                ...(previousSchools && {
                    previousSchools: {
                        create: previousSchools,
                    }
                }),
            },
            include: {
                previousSchools: true,
            }
        });
    }

    remove(id: string) {
        return this.prisma.onlineAdmission.delete({
            where: { id },
        });
    }

    async verifyPayment(id: string, branchId?: string) {
        return this.prisma.onlineAdmission.update({
            where: { id },
            data: {
                paymentStatus: 'VERIFIED',
            }
        });
    }

    async rejectPayment(id: string, reason: string) {
        return this.prisma.onlineAdmission.update({
            where: { id },
            data: {
                paymentStatus: 'REJECTED',
                rejectionReason: reason // Overloading rejectionReason for payment issues too
            }
        });
    }

    async reject(id: string, reason: string) {
        const admission = await this.findOne(id);
        
        const updated = await this.prisma.onlineAdmission.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectionReason: reason,
            }
        });

        // Send rejection email here
        try {
            await this.mailService.sendRejectionEmail(admission.guardianEmail || '', `${admission.firstName} ${admission.lastName}`, reason);
        } catch (e) {
            console.error('Failed to send rejection email', e);
        }

        return updated;
    }

    async approve(id: string, approvalData?: { classId?: string, sectionId?: string }) {
        const admission = await this.findOne(id);
        if (admission.status === 'ENROLLED') {
            throw new ConflictException('Application is already enrolled');
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Generate Student ID (BMS-YEAR-XXXX)
            const year = new Date().getFullYear();
            const count = await tx.student.count({
                where: { branchId: admission.branchId }
            });
            const studentIdNumber = `BMS-${year}-${(count + 1).toString().padStart(4, '0')}`;

            // 2. Handle Parent Linking/Creation
            let parentId = admission.parentId;

            if (!parentId && admission.guardianEmail) {
                const existingParent = await tx.user.findUnique({
                    where: { email: admission.guardianEmail }
                });

                if (existingParent && existingParent.role === UserRole.PARENT) {
                    parentId = existingParent.id;
                }

                if (!parentId) {
                    const parentPassword = await bcrypt.hash('parent123', 10);
                    const newParent = await tx.user.create({
                        data: {
                            email: admission.guardianEmail,
                            password: parentPassword,
                            firstName: admission.guardianName.split(' ')[0],
                            lastName: (admission.surname || admission.lastName || admission.guardianName.split(' ').slice(1).join(' ')),
                            phone: admission.guardianPhone,
                            role: UserRole.PARENT,
                            branchId: admission.branchId,
                        }
                    });
                    parentId = newParent.id;
                }
            }

            let userId: string | null = null;

            // 3. Create Student User if portal account is requested
            if (admission.createPortalAccount) {
                const email = admission.studentEmail || `std.${admission.firstName.toLowerCase()}.${(admission.surname || admission.lastName).toLowerCase()}${count + 1}@basaeer.com`;
                const hashedPassword = await bcrypt.hash('student123', 10);

                const user = await tx.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        firstName: admission.firstName,
                        lastName: admission.surname || admission.lastName,
                        phone: admission.guardianPhone,
                        role: UserRole.STUDENT,
                        branchId: admission.branchId,
                    }
                });
                userId = user.id;
            }

            // 4. Create Student record
            const student = await tx.student.create({
                data: {
                    userId,
                    parentId,
                    firstName: admission.firstName,
                    lastName: admission.lastName,
                    surname: admission.surname,
                    otherNames: admission.otherNames,
                    dob: admission.dateOfBirth,
                    age: admission.age,
                    branchId: admission.branchId,
                    classId: approvalData?.classId || admission.desiredClassId,
                    sectionId: approvalData?.sectionId || admission.desiredSectionId,
                    categoryId: admission.studentCategoryId,

                    ninNumber: admission.ninNumber,
                    placeOfBirth: admission.placeOfBirth,
                    nationality: admission.nationality,
                    stateOfOrigin: admission.stateOfOrigin,
                    lga: admission.lga,
                    religion: admission.religion,
                    passportPhoto: admission.passportPhoto,

                    guardianOccupation: admission.guardianOccupation,
                    guardianOfficeAddress: admission.guardianOfficeAddress,
                    
                    fatherName: admission.fatherName,
                    fatherOccupation: admission.fatherOccupation,
                    fatherPhone: admission.fatherPhone,
                    motherName: admission.motherName,
                    motherOccupation: admission.motherOccupation,
                    motherPhone: admission.motherPhone,

                    secondaryGuardianName: admission.secondaryGuardianName,
                    secondaryGuardianPhone: admission.secondaryGuardianPhone,
                    secondaryGuardianRelation: admission.secondaryGuardianRelation,

                    address: admission.address,
                    whatsappNumber: admission.whatsappNumber,
                    languagesSpoken: admission.languagesSpoken,
                    city: admission.city,
                    state: admission.state,
                    country: admission.country,
                    emergencyContactName: admission.emergencyContactName,
                    emergencyContactPhone: admission.emergencyContactPhone,
                    emergencyContactRelation: admission.emergencyContactRelation,
                    emergencySickness: admission.emergencySickness,

                    bloodGroup: admission.bloodGroup,
                    genotype: admission.genotype,
                    allergies: admission.allergies,
                    medicalConditions: admission.medicalConditions,
                    hasMedicalCondition: admission.hasMedicalCondition,
                    medicalConditionInfo: admission.medicalConditionInfo,
                    hasLearningDifficulty: admission.hasLearningDifficulty,
                    learningDifficultyInfo: admission.learningDifficultyInfo,
                    hasSpecialNeeds: admission.hasSpecialNeeds,
                    specialNeedsInfo: admission.specialNeedsInfo,
                    familyDoctorName: admission.familyDoctorName,
                    familyDoctorPhone: admission.familyDoctorPhone,

                    birthCertificateUrl: admission.birthCertificateUrl,
                    testimonialUrl: admission.testimonialUrl,
                    transferCertificateUrl: admission.transferCertificateUrl,
                    immunizationCardUrl: admission.immunizationCardUrl,
                    ninUrl: admission.ninUrl,
                    educationalCertUrl: admission.educationalCertUrl,
                    transferLetterUrl: admission.transferLetterUrl,
                    medicalReportUrl: admission.medicalReportUrl,
                    recommendationLetterUrl: admission.recommendationLetterUrl,
                    schoolReportUrl: admission.schoolReportUrl,

                    preferredLanguage: admission.preferredLanguage,
                    religionClassType: admission.religionClassType,
                    scholarshipEligible: admission.scholarshipEligible,
                    referralSource: admission.referralSource,
                }
            });

            // 5. Update Admission status
            await tx.onlineAdmission.update({
                where: { id },
                data: {
                    status: 'ENROLLED',
                    approvalDate: new Date(),
                    admissionNumber: studentIdNumber
                }
            });

            // Send approval email here
            try {
                await this.mailService.sendApprovalEmail(admission.guardianEmail || '', `${admission.firstName} ${admission.lastName}`, studentIdNumber);
            } catch (e) {
                console.error('Failed to send approval email', e);
            }

            return student;
        });
    }

    async getPublicInitData(branchId: string) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
            select: { name: true }
        });

        if (!branch) throw new NotFoundException('Branch not found');

        const [classes, currentSession] = await Promise.all([
            this.prisma.class.findMany({
                where: { branchId },
                select: { id: true, name: true },
                orderBy: { name: 'asc' }
            }),
            this.prisma.academicSession.findFirst({
                where: { isActive: true },
                select: { id: true, name: true }
            })
        ]);

        return {
            branchName: branch.name,
            classes,
            currentSession
        };
    }
}
