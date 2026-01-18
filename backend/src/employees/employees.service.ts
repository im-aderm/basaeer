import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UserRole } from '../generated/client/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
    constructor(private prisma: PrismaService) { }

    async createEmployee(data: CreateEmployeeDto) {
        const { email, password, firstName, lastName, branchId, role, phone, departmentId, designationId } = data;

        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password || 'staff123', 10);

        // Transaction: Create User + Staff
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    phone,
                    role: role || UserRole.TEACHER,
                    branchId,
                },
            });

            const staff = await tx.staff.create({
                data: {
                    userId: user.id,
                    departmentId,
                    designationId,
                },
            });

            return { user, staff };
        });
    }

    async findAllEmployees(branchId: string) {
        return this.prisma.staff.findMany({
            where: {
                user: {
                    branchId,
                }
            },
            include: {
                user: true,
                department: true,
                designationRef: true
            }
        });
    }

    async findAllTeachers(branchId: string) {
        return this.prisma.staff.findMany({
            where: {
                user: {
                    branchId,
                    role: UserRole.TEACHER
                }
            },
            include: {
                user: true,
                department: true,
                designationRef: true
            }
        });
    }

    async updateStaffStatus(id: string, status: any) {
        return this.prisma.staff.update({
            where: { id },
            data: { status }
        });
    }

    async findOneStaff(id: string) {
        const staff = await this.prisma.staff.findUnique({
            where: { id },
            include: {
                user: true,
                department: true,
                designationRef: true,
                salaryTemplate: true,
                awards: true,
                salaryAdvances: true
            }
        });
        if (!staff) throw new NotFoundException('Staff not found');
        return staff;
    }

    async findByUserId(userId: string) {
        const staff = await this.prisma.staff.findUnique({
            where: { userId }
        });
        if (!staff) throw new NotFoundException('Staff profile not found for this user');
        return staff;
    }

    // --- Staff Awards ---
    async createAward(data: any) {
        return this.prisma.staffAward.create({
            data: {
                ...data,
                date: new Date(data.awardDate || data.date),
            },
        });
    }

    async findAllAwards(branchId?: string) {
        return this.prisma.staffAward.findMany({
            where: branchId ? { staff: { user: { branchId } } } : {},
            include: { staff: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findMyAwards(staffId: string) {
        return this.prisma.staffAward.findMany({
            where: { staffId },
            include: { staff: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    // --- Salary Advances ---
    async requestAdvance(staffId: string, amount: number, reason: string) {
        return this.prisma.advanceSalary.create({
            data: {
                staffId,
                amount,
                reason,
            },
        });
    }

    async findAllAdvances(branchId?: string) {
        return this.prisma.advanceSalary.findMany({
            where: branchId ? { staff: { user: { branchId } } } : {},
            include: { staff: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findMyAdvances(staffId: string) {
        return this.prisma.advanceSalary.findMany({
            where: { staffId },
            include: { staff: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateAdvanceStatus(id: string, status: string) {
        return this.prisma.advanceSalary.update({
            where: { id },
            data: { status },
        });
    }
}
