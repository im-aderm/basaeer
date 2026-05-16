import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('No user role found');
    }

    // 1) Check legacy enum-based permissions (from user.role)
    const rolePerms = await this.prisma.rolePermission.findMany({
      where: { role: user.role, isAllowed: true },
    });

    const hasAllFromRole = requiredPermissions.every((required) =>
      rolePerms.some((perm) => `${perm.module}:${perm.action}` === required),
    );
    if (hasAllFromRole) return true;

    // 2) Check custom role permissions (from user.roleId)
    if (user.roleId) {
      const customPerms = await this.prisma.customRolePermission.findMany({
        where: { roleId: user.roleId, isAllowed: true },
      });

      const hasAllFromCustom = requiredPermissions.every((required) =>
        customPerms.some((perm) => `${perm.module}:${perm.action}` === required),
      );
      if (hasAllFromCustom) return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
