import { Injectable } from '@nestjs/common';
import { TenantContext } from '../../auth/branch.guard';

/**
 * Base service for all tenant-scoped services.
 *
 * Provides standardized tenant context resolution and branch filtering.
 * All services that operate on branch-scoped data should extend this class
 * or use its static helpers.
 */
@Injectable()
export abstract class TenantScopedService {
  /**
   * Resolves the Prisma `where` branch filter from a TenantContext.
   * Super admins receive `undefined` (no filter), others receive their branch ID.
   */
  protected branchFilter(
    context: TenantContext,
  ): { branchId: string } | Record<string, never> {
    if (context.isSuperAdmin) {
      return {};
    }
    if (!context.branchId) {
      return { branchId: '' };
    }
    return { branchId: context.branchId };
  }

  /**
   * Resolves the effective branchId from a TenantContext.
   * Returns undefined for super admins (unfiltered), string for scoped users.
   */
  protected effectiveBranchId(context: TenantContext): string | undefined {
    if (context.isSuperAdmin) {
      return undefined;
    }
    return context.branchId || undefined;
  }

  /**
   * Ensures the provided branchId is authorized for the given tenant context.
   * Throws if a non-superadmin tries to access a different branch.
   */
  protected authorizeBranch(
    context: TenantContext,
    targetBranchId: string,
  ): void {
    if (context.isSuperAdmin) return;
    if (context.branchId && context.branchId !== targetBranchId) {
      throw new Error('Branch access denied');
    }
  }

  /**
   * Static helpers for services that don't want to extend this class.
   */
  static branchFilter(
    context: TenantContext,
  ): { branchId: string } | Record<string, never> {
    if (context.isSuperAdmin) return {};
    if (!context.branchId) return { branchId: '' };
    return { branchId: context.branchId };
  }

  static effectiveBranchId(context: TenantContext): string | undefined {
    if (context.isSuperAdmin) return undefined;
    return context.branchId || undefined;
  }
}
