import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Branch, UserRole } from '../generated/client/client';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import * as bcrypt from 'bcrypt';

interface ReassignBranchAdminDto {
  newAdminUserId?: string;
  createNewAdminUser?: {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    phone?: string;
  };
}

@Injectable()
export class BranchesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateBranchDto, userId?: string): Promise<Branch> {
    const { adminUserId, createAdminUser, ...branchData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const branch = await tx.branch.create({ data: branchData });

      if (adminUserId) {
        const user = await tx.user.findUnique({ where: { id: adminUserId } });
        if (!user) throw new BadRequestException('Admin user not found');
        await tx.user.update({
          where: { id: adminUserId },
          data: { role: UserRole.BRANCH_ADMIN, branchId: branch.id },
        });
      } else if (createAdminUser) {
        const hashedPassword = await bcrypt.hash(createAdminUser.password || 'Password123!', 8);
        await tx.user.create({
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
    });
  }

  findAll(): Promise<Branch[]> {
    return this.prisma.branch.findMany({
      where: { deletedAt: null },
    });
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.prisma.branch.findFirst({
      where: { id, deletedAt: null },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }

  async update(id: string, data: UpdateBranchDto): Promise<Branch> {
    await this.findOne(id);
    return this.prisma.branch.update({
      where: { id },
      data,
    });
  }

  findActive(): Promise<Pick<Branch, 'id' | 'name' | 'code'>[]> {
    return this.prisma.branch.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
  }

  async remove(id: string): Promise<Branch> {
    await this.findOne(id);
    return this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async reassignBranchAdmin(branchId: string, dto: ReassignBranchAdminDto) {
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) throw new BadRequestException('Branch not found');

    // Find the current branch admin for this branch
    const oldAdmin = await this.prisma.user.findFirst({
      where: { branchId, role: UserRole.BRANCH_ADMIN },
    });

    if (dto.newAdminUserId) {
      // Promote existing user to branch admin
      const newAdmin = await this.prisma.user.findUnique({
        where: { id: dto.newAdminUserId },
      });
      if (!newAdmin) throw new BadRequestException('New admin user not found');

      await this.prisma.$transaction(async (tx) => {
        // Demote old admin if exists
        if (oldAdmin) {
          await tx.user.update({
            where: { id: oldAdmin.id },
            data: { role: UserRole.TEACHER, roleId: null },
          });
        }

        // Promote new admin
        await tx.user.update({
          where: { id: dto.newAdminUserId! },
          data: { role: UserRole.BRANCH_ADMIN, branchId },
        });
      });

      // Notify old admin
      if (oldAdmin) {
        await this.notificationsService.createNotification({
          userId: oldAdmin.id,
          title: 'Branch Admin Access Removed',
          message: `Your administrator access for ${branch.name} has been revoked. You no longer have branch admin privileges.`,
          type: 'SYSTEM_ALERT',
          branchId,
        });
      }

      // Notify new admin
      await this.notificationsService.createNotification({
        userId: dto.newAdminUserId,
        title: 'Branch Admin Access Granted',
        message: `You have been assigned as the Branch Administrator for ${branch.name}.`,
        type: 'SYSTEM_ALERT',
        branchId,
      });

      return {
        message: `Branch admin reassigned from ${oldAdmin?.firstName || 'none'} to ${newAdmin.firstName} ${newAdmin.lastName}`,
        oldAdminId: oldAdmin?.id || null,
        newAdminId: dto.newAdminUserId,
      };
    } else if (dto.createNewAdminUser) {
      // Create new user and assign as branch admin
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.createNewAdminUser.email },
      });
      if (existing) throw new BadRequestException('User with this email already exists');

      const createData = dto.createNewAdminUser!;
      const hashedPassword = await bcrypt.hash(createData.password || 'Password123!', 8);

      await this.prisma.$transaction(async (tx) => {
        // Demote old admin if exists
        if (oldAdmin) {
          await tx.user.update({
            where: { id: oldAdmin.id },
            data: { role: UserRole.TEACHER, roleId: null },
          });
        }

        // Create new admin
        await tx.user.create({
          data: {
            email: createData.email,
            password: hashedPassword,
            firstName: createData.firstName,
            lastName: createData.lastName,
            phone: createData.phone || null,
            role: UserRole.BRANCH_ADMIN,
            branchId,
            mustChangePassword: !createData.password,
          },
        });
      });

      // Notify old admin
      if (oldAdmin) {
        await this.notificationsService.createNotification({
          userId: oldAdmin.id,
          title: 'Branch Admin Access Removed',
          message: `Your administrator access for ${branch.name} has been revoked. A new administrator has been assigned.`,
          type: 'SYSTEM_ALERT',
          branchId,
        });
      }

      return {
        message: `New branch admin created and assigned for ${branch.name}`,
        oldAdminId: oldAdmin?.id || null,
        newAdminEmail: dto.createNewAdminUser.email,
      };
    }

    throw new BadRequestException('Either newAdminUserId or createNewAdminUser must be provided');
  }
}
