import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOnlineAdmissionDto } from './dto/create-online-admission.dto';
import { UpdateOnlineAdmissionDto } from './dto/update-online-admission.dto';
import { UserRole } from '../generated/client/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OnlineAdmissionService {
    constructor(private prisma: PrismaService) { }

    create(createDto: CreateOnlineAdmissionDto) {
        const { dateOfBirth, admissionDate, approvalDate, consentDate, ...rest } = createDto;
        return this.prisma.onlineAdmission.create({
            data: {
                ...rest,
                dateOfBirth: new Date(dateOfBirth),
                ...(admissionDate && { admissionDate: new Date(admissionDate) }),
                ...(approvalDate && { approvalDate: new Date(approvalDate) }),
                ...(consentDate && { consentDate: new Date(consentDate) }),
            },
        });
    }

    findAll(branchId: string | null) {
        return this.prisma.onlineAdmission.findMany({
            where: { ...(branchId && { branchId }) },
            include: {
                desiredClass: true,
                desiredSection: true,
                studentCategory: true,
                academicSession: true,
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
            },
        });
        if (!admission) throw new NotFoundException(`Admission application with ID ${id} not found`);
        return admission;
    }

    update(id: string, updateDto: UpdateOnlineAdmissionDto) {
        const { dateOfBirth, admissionDate, approvalDate, consentDate, ...rest } = updateDto;
        return this.prisma.onlineAdmission.update({
            where: { id },
            data: {
                ...rest,
                ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
                ...(admissionDate && { admissionDate: new Date(admissionDate) }),
                ...(approvalDate && { approvalDate: new Date(approvalDate) }),
                ...(consentDate && { consentDate: new Date(consentDate) }),
            },
        });
    }

    remove(id: string) {
        return this.prisma.onlineAdmission.delete({
            where: { id },
        });
    }

    async approve(id: string) {
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

            let userId: string | null = null;

            // 2. Create User if portal account is requested
            if (admission.createPortalAccount) {
                const email = admission.studentEmail || `std.${admission.firstName.toLowerCase()}.${admission.lastName.toLowerCase()}${count + 1}@basaeer.com`;
                const hashedPassword = await bcrypt.hash('student123', 10);

                const user = await tx.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        firstName: admission.firstName,
                        lastName: admission.lastName,
                        phone: admission.guardianPhone,
                        role: UserRole.STUDENT,
                        branchId: admission.branchId,
                    }
                });
                userId = user.id;
            }

            // 3. Create Student record
            const student = await tx.student.create({
                data: {
                    userId,
                    firstName: admission.firstName,
                    lastName: admission.lastName,
                    otherNames: admission.otherNames,
                    dob: admission.dateOfBirth,
                    branchId: admission.branchId,
                    classId: admission.desiredClassId,
                    sectionId: admission.desiredSectionId,
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
                }
            });

            // 4. Update Admission status
            await tx.onlineAdmission.update({
                where: { id },
                data: {
                    status: 'ENROLLED',
                    approvalDate: new Date(),
                    admissionNumber: studentIdNumber
                }
            });

            return student;
        });
    }
}
