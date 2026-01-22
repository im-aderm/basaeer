import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../generated/client/client';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class BranchGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

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

        // Super Admin can access any branch
        if (user.role === UserRole.SUPER_ADMIN) {
            return true;
        }

        const branchId = request.params?.branchId ||
            request.query?.branchId ||
            request.body?.branchId ||
            (request.route?.path?.includes('/branches/') ? request.params?.id : null);

        if (branchId && user.branchId && user.branchId !== branchId) {
            throw new ForbiddenException('You do not have access to this branch');
        }

        // Specific logic for BRANCH_ADMIN and other roles:
        // They should generally only be able to interact with data where branchId matches theirs.
        // If no branchId is provided in the request, we assume the service will filter by user.branchId.

        return true;
    }
}
