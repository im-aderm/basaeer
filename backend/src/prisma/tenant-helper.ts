import { ForbiddenException } from '@nestjs/common';
import { TenantContext } from '../auth/branch.guard';

export class TenantHelper {
  static applyIsolation<T>(
    where: T,
    context: TenantContext,
    options?: { softDelete?: boolean },
  ): T & { branchId?: string; deletedAt?: null } {
    const result: any = { ...where };

    if (options?.softDelete) {
      result.deletedAt = null;
    }

    if (context.isSuperAdmin) {
      return result as T & { branchId?: string; deletedAt?: null };
    }

    if (!context.branchId) {
      throw new ForbiddenException('User is not assigned to a branch');
    }

    result.branchId = context.branchId;
    return result;
  }

  static applyNestedIsolation<T>(
    where: T,
    parentField: string,
    context: TenantContext,
    options?: { softDelete?: boolean },
  ): T {
    const result: any = { ...where };

    if (options?.softDelete) {
      result[parentField] = { ...result[parentField], deletedAt: null };
    }

    if (context.isSuperAdmin) {
      return result;
    }

    if (!context.branchId) {
      throw new ForbiddenException('User is not assigned to a branch');
    }

    result[parentField] = {
      ...result[parentField],
      branchId: context.branchId,
    };

    return result;
  }
}
