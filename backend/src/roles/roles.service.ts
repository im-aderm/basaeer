import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto, CreateUserAndAssignRoleDto } from './dto/assign-role.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../generated/client/client';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId?: string, isSuperAdmin = false) {
    if (isSuperAdmin) {
      return this.prisma.role.findMany({
        where: branchId ? { branchId } : {},
        orderBy: { priority: 'asc' },
        include: { _count: { select: { users: true, permissions: true } } },
      });
    }
    // Non-SA: see their branch's roles + system-wide roles
    return this.prisma.role.findMany({
      where: { OR: [{ branchId }, { branchId: null }] },
      orderBy: { priority: 'asc' },
      include: { _count: { select: { users: true, permissions: true } } },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async findBySlug(slug: string) {
    const role = await this.prisma.role.findUnique({ where: { slug } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(dto: CreateRoleDto, actorBranchId?: string, isSuperAdmin = false) {
    if (dto.branchId && !isSuperAdmin) {
      throw new ForbiddenException('Only Super Admin can create system-wide roles');
    }
    const existing = await this.prisma.role.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Role with this slug already exists');

    return this.prisma.role.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        branchId: dto.branchId || actorBranchId || null,
        isSystem: dto.isSystem || false,
        priority: dto.priority || 0,
      },
    });
  }

  async update(id: string, dto: UpdateRoleDto, actorBranchId?: string, isSuperAdmin = false) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    if (!isSuperAdmin) {
      if (role.isSystem) throw new ForbiddenException('Cannot modify system roles');
      if (role.branchId !== actorBranchId) throw new ForbiddenException('Cannot modify roles from other branches');
    }
    if (role.isSystem) throw new BadRequestException('Cannot modify system roles');

    return this.prisma.role.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, actorBranchId?: string, isSuperAdmin = false) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    if (!isSuperAdmin) {
      if (role.isSystem) throw new ForbiddenException('Cannot delete system roles');
      if (role.branchId !== actorBranchId) throw new ForbiddenException('Cannot delete roles from other branches');
    }
    if (role.isSystem) throw new BadRequestException('Cannot delete system roles');

    // Unlink all users from this role before deletion
    await this.prisma.user.updateMany({ where: { roleId: id }, data: { roleId: null } });
    return this.prisma.role.delete({ where: { id } });
  }

  // ── Role Permissions ──────────────────────────────────────────────────

  async getPermissions(roleId: string) {
    return this.prisma.customRolePermission.findMany({ where: { roleId } });
  }

  async updatePermission(roleId: string, dto: UpdatePermissionDto, actorBranchId?: string, isSuperAdmin = false) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');
    if (!isSuperAdmin) {
      if (role.isSystem) throw new ForbiddenException('Cannot modify system role permissions');
      if (role.branchId !== actorBranchId) throw new ForbiddenException('Cannot modify permissions for roles from other branches');
    }

    return this.prisma.customRolePermission.upsert({
      where: { roleId_module_action: { roleId, module: dto.module, action: dto.action } },
      update: { isAllowed: dto.isAllowed },
      create: { roleId, module: dto.module, action: dto.action, isAllowed: dto.isAllowed },
    });
  }

  async bulkUpdatePermissions(roleId: string, permissions: UpdatePermissionDto[], actorBranchId?: string, isSuperAdmin = false) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');
    if (!isSuperAdmin) {
      if (role.isSystem) throw new ForbiddenException('Cannot modify system role permissions');
      if (role.branchId !== actorBranchId) throw new ForbiddenException('Cannot modify permissions for roles from other branches');
    }

    return this.prisma.$transaction(
      permissions.map((p) =>
        this.prisma.customRolePermission.upsert({
          where: { roleId_module_action: { roleId, module: p.module, action: p.action } },
          update: { isAllowed: p.isAllowed },
          create: { roleId, module: p.module, action: p.action, isAllowed: p.isAllowed },
        }),
      ),
    );
  }

  // ── Modules & Seed ─────────────────────────────────────────────────────

  async getModules() {
    const [customPerms, legacyPerms] = await Promise.all([
      this.prisma.customRolePermission.findMany({ select: { module: true }, distinct: ['module'] }),
      this.prisma.rolePermission.findMany({ select: { module: true }, distinct: ['module'] }),
    ]);
    const modules = new Set<string>();
    customPerms.forEach((p) => modules.add(p.module));
    legacyPerms.forEach((p) => modules.add(p.module));
    return Array.from(modules).sort();
  }

  async seedPermissions() {
    const roles = await this.prisma.role.findMany({
      where: { isSystem: true },
    });
    const legacyPerms = await this.prisma.rolePermission.findMany();
    if (legacyPerms.length === 0) return { message: 'No legacy permissions to sync', count: 0 };

    let count = 0;
    for (const role of roles) {
      const slug = role.slug;
      const legacyRolePerms = legacyPerms.filter((p) => p.role.toLowerCase() === slug);
      for (const perm of legacyRolePerms) {
        await this.prisma.customRolePermission.upsert({
          where: { roleId_module_action: { roleId: role.id, module: perm.module, action: perm.action } },
          update: { isAllowed: perm.isAllowed },
          create: { roleId: role.id, module: perm.module, action: perm.action, isAllowed: perm.isAllowed },
        });
        count++;
      }
    }
    return { message: `Synced ${count} permissions across ${roles.length} system roles`, count };
  }

  // ── User Assignment ────────────────────────────────────────────────────

  async assignRoleToUser(dto: AssignRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role not found');
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: dto.userId },
      data: { roleId: dto.roleId },
    });
  }

  async createUserAndAssignRole(dto: CreateUserAndAssignRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const hashedPassword = await bcrypt.hash(dto.password || 'Password123!', 8);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone || null,
        role: dto.role || UserRole.TEACHER,
        branchId: dto.branchId || role.branchId || null,
        roleId: dto.roleId,
        mustChangePassword: !dto.password,
      },
    });

    return user;
  }

  async getUsersByRole(roleId: string) {
    return this.prisma.user.findMany({
      where: { roleId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    });
  }

  async removeRoleFromUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId: null },
    });
  }
}