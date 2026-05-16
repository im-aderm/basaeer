import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../generated/client/client';
import { IS_PUBLIC_KEY } from './public.decorator';
import { PrismaService } from '../prisma/prisma.service';

export interface TenantContext {
  userId: string;
  branchId: string | null;
  selectedBranchId?: string | null;
  isSuperAdmin: boolean;
  role: UserRole;
}

@Injectable()
export class BranchGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const requestedBranchId =
      request.params?.branchId ||
      request.query?.branchId ||
      request.body?.branchId ||
      (request.route?.path?.includes('/branches/') ? request.params?.id : null);

    // Determine effective branchId
    let effectiveBranchId = user.branchId;

    if (user.role === UserRole.SUPER_ADMIN) {
      // Super Admin: use selectedBranchId (if set) or let them override via query param
      effectiveBranchId = requestedBranchId || user.selectedBranchId || user.branchId;
    } else {
      // Non-SuperAdmin must match their own branch
      if (
        requestedBranchId &&
        user.branchId &&
        user.branchId !== requestedBranchId
      ) {
        throw new ForbiddenException('You do not have access to this branch');
      }
    }

    // Populate tenant context for use in services
    request.tenantContext = {
      userId: user.id,
      branchId: effectiveBranchId,
      selectedBranchId: user.selectedBranchId || null,
      isSuperAdmin: user.role === UserRole.SUPER_ADMIN,
      role: user.role,
    };

    // Sync the resolved branchId back to the Prisma AsyncLocalStorage so the
    // $extends write guard sees the correct value (the JwtStrategy may have set
    // it to null for SA with no selectedBranchId in the JWT).
    this.prisma.setTenantContext(effectiveBranchId, user.id);

    return true;
  }
}
