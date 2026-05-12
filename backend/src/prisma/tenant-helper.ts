import { ForbiddenException } from '@nestjs/common';
import { TenantContext } from '../auth/branch.guard';

export class TenantHelper {
  /**
   * Applies branch isolation to a Prisma where clause.
   * If user is SuperAdmin, no isolation is applied.
   */
  static applyIsolation<T>(
    where: T,
    context: TenantContext,
  ): T & { branchId?: string } {
    if (context.isSuperAdmin) {
      return where as T & { branchId?: string };
    }

    if (!context.branchId) {
      throw new ForbiddenException('User is not assigned to a branch');
    }

    return {
      ...where,
      branchId: context.branchId,
    };
  }

  /**
   * For resources that are nested under another branch-aware resource.
   * This is used when the model itself doesn't have branchId but its parent does.
   */
  static applyNestedIsolation<T>(
    where: T,
    parentField: string,
    context: TenantContext,
  ): T {
    if (context.isSuperAdmin) {
      return where;
    }

    if (!context.branchId) {
      throw new ForbiddenException('User is not assigned to a branch');
    }

    return {
      ...where,
      [parentField]: {
        branchId: context.branchId,
      },
    };
  }
}
