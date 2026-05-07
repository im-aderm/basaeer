
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User, UserRole } from '../generated/client/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
    }

    async createSuperAdmin(): Promise<User> {
        const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@basaeer.com';
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) return existing;

        const password = process.env.SEED_ADMIN_PASSWORD;
        if (!password) {
            throw new Error('SEED_ADMIN_PASSWORD environment variable is required to bootstrap SuperAdmin.');
        }

        return this.createUser({
            email,
            password,
            firstName: 'Super',
            lastName: 'Admin',
            role: UserRole.SUPER_ADMIN,
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id }
        });
    }

    async findAll(branchId?: string, role?: UserRole) {
        return this.prisma.user.findMany({
            where: {
                ...(branchId && { branchId }),
                ...(role && { role }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateStatus(id: string, isActive: boolean) {
        return this.prisma.user.update({
            where: { id },
            data: { isActive },
        });
    }

    async updatePassword(id: string, passwordHashed: string) {
        return this.prisma.user.update({
            where: { id },
            data: { password: passwordHashed }
        });
    }

    async setPasswordResetToken(id: string, hash: string, expires: Date) {
        return this.prisma.user.update({
            where: { id },
            data: {
                resetTokenHash: hash,
                resetTokenExpires: expires,
            },
        });
    }

    async findByResetToken(hash: string) {
        return this.prisma.user.findFirst({
            where: {
                resetTokenHash: hash,
                resetTokenExpires: {
                    gt: new Date(),
                },
            },
        });
    }

    async clearResetToken(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: {
                resetTokenHash: null,
                resetTokenExpires: null,
            },
        });
    }
}
