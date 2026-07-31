import { ForbiddenException } from '@nestjs/common';
import { TenantContext } from '../auth/branch.guard';
import { UserRole } from '../generated/client/client';

/** Roles that may view/act on any student's record within their own branch. */
const DEFAULT_STAFF_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.BRANCH_ADMIN,
  UserRole.PRINCIPAL,
  UserRole.EXAM_OFFICER,
  UserRole.ACADEMIC_OFFICER,
  UserRole.HOD,
  UserRole.TEACHER,
];

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

  /**
   * Confirms the caller may view/act on a specific student's record: staff
   * roles are allowed for any student in their own branch (branch scoping
   * must already have been applied when the student record was loaded);
   * a STUDENT caller must be that exact student; a PARENT caller must be
   * that student's linked parent. Throws ForbiddenException otherwise.
   *
   * Generalizes the check originally implemented once in
   * academic-portal.service.ts's assertAccess — apply this everywhere a
   * student-owned record (transcript, tahfeez report, attendance history,
   * assignment submission, ...) is looked up by a non-staff caller, so
   * "is this the right branch" isn't mistaken for "is this the right
   * student".
   */
  static assertOwnStudentRecord(
    student: { userId: string | null; parentId?: string | null },
    context: TenantContext,
    staffRoles: UserRole[] = DEFAULT_STAFF_ROLES,
  ): void {
    if (staffRoles.includes(context.role)) return;
    if (context.role === UserRole.STUDENT && student.userId === context.userId) return;
    if (context.role === UserRole.PARENT && student.parentId === context.userId) return;
    throw new ForbiddenException(
      'You are not authorized to access this student record',
    );
  }
}
