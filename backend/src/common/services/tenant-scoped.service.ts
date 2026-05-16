import { Injectable } from '@nestjs/common';
import { TenantContext } from '../../auth/branch.guard';

@Injectable()
export abstract class TenantScopedService {
  /** Resolves the Prisma `where` branch filter from a TenantContext. */
  protected branchFilter(
    context: TenantContext,
  ): { branchId: string } | Record<string, never> {
    const bid = context.selectedBranchId || context.branchId;
    if (!bid) return {};
    return { branchId: bid };
  }

  protected effectiveBranchId(context: TenantContext): string | undefined {
    return context.selectedBranchId || context.branchId || undefined;
  }

  protected authorizeBranch(
    context: TenantContext,
    targetBranchId: string,
  ): void {
    const bid = context.selectedBranchId || context.branchId;
    if (bid && bid !== targetBranchId) {
      throw new Error('Branch access denied');
    }
  }

  static branchFilter(
    context: TenantContext,
  ): { branchId: string } | Record<string, never> {
    const bid = context.selectedBranchId || context.branchId;
    if (!bid) return {};
    return { branchId: bid };
  }

  static effectiveBranchId(context: TenantContext): string | undefined {
    return context.selectedBranchId || context.branchId || undefined;
  }
}
