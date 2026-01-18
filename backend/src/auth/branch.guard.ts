import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../generated/client/client';

@Injectable()
export class BranchGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
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
