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
  sessionId?: string | null;
  selectedBranchId?: string | null;
  selectedSessionId?: string | null;
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

    const requestedSessionId =
      request.params?.sessionId ||
      request.query?.sessionId ||
      request.body?.sessionId;

    // Determine effective branchId
    let effectiveBranchId = user.branchId;

    if (user.role === UserRole.SUPER_ADMIN) {
      // Super Admin: use selectedBranchId (if set) or let them override via query param.
      // No fallback to user.branchId — SA must explicitly select a branch to write.
      effectiveBranchId = requestedBranchId || user.selectedBranchId || null;
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

    // Determine effective sessionId
    let effectiveSessionId = requestedSessionId || user.selectedSessionId || null;

    // Populate tenant context for use in services
    request.tenantContext = {
      userId: user.id,
      branchId: effectiveBranchId,
      sessionId: effectiveSessionId,
      selectedBranchId: user.selectedBranchId || null,
      selectedSessionId: user.selectedSessionId || null,
      isSuperAdmin: user.role === UserRole.SUPER_ADMIN,
      role: user.role,
    };

    // Tenant context isolation is handled by TenantContextInterceptor (global)
    // which wraps the request in AsyncLocalStorage.run() to prevent cross-request leakage.

    return true;
  }
}
