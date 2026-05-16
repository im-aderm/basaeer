import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Branch, UserRole } from '../generated/client/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.BranchCreateInput & {
    adminUserId?: string;
    createAdminUser?: { email: string; firstName: string; lastName: string; password?: string; phone?: string };
  }): Promise<Branch> {
    const { adminUserId, createAdminUser, ...branchData } = data;

    const branch = await this.prisma.branch.create({ data: branchData });

    if (adminUserId) {
      const user = await this.prisma.user.findUnique({ where: { id: adminUserId } });
      if (!user) throw new BadRequestException('Admin user not found');
      await this.prisma.user.update({
        where: { id: adminUserId },
        data: { role: UserRole.BRANCH_ADMIN, branchId: branch.id },
      });
    } else if (createAdminUser) {
      const hashedPassword = await bcrypt.hash(createAdminUser.password || 'Password123!', 8);
      await this.prisma.user.create({
        data: {
          email: createAdminUser.email,
          password: hashedPassword,
          firstName: createAdminUser.firstName,
          lastName: createAdminUser.lastName,
          phone: createAdminUser.phone || null,
          role: UserRole.BRANCH_ADMIN,
          branchId: branch.id,
          mustChangePassword: !createAdminUser.password,
        },
      });
    }

    return branch;
  }

  findAll(): Promise<Branch[]> {
    return this.prisma.branch.findMany();
  }

  findOne(id: string): Promise<Branch | null> {
    return this.prisma.branch.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.BranchUpdateInput): Promise<Branch> {
    return this.prisma.branch.update({
      where: { id },
      data,
    });
  }

  findActive(): Promise<Pick<Branch, 'id' | 'name' | 'code'>[]> {
    return this.prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
  }

  remove(id: string): Promise<Branch> {
    return this.prisma.branch.delete({ where: { id } });
  }
}
