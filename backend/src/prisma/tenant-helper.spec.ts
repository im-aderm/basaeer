import { ForbiddenException } from '@nestjs/common';
import { TenantHelper } from './tenant-helper';
import { UserRole } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';

/**
 * assertOwnStudentRecord generalizes the ownership check originally
 * implemented once (academic-portal.service.ts's assertAccess) and is now
 * reused across transcript, tahfeez, attendance, and assignment lookups —
 * the four places the audit found checking branch membership but never
 * that the caller was looking at their own (or their own child's) record.
 */
describe('TenantHelper.assertOwnStudentRecord', () => {
  const student = { userId: 'student-user-1', parentId: 'parent-user-1' };

  const ctx = (role: UserRole, userId: string): TenantContext => ({
    userId,
    branchId: 'branch-1',
    isSuperAdmin: role === UserRole.SUPER_ADMIN,
    role,
  });

  it('allows staff roles regardless of userId', () => {
    for (const role of [
      UserRole.SUPER_ADMIN,
      UserRole.BRANCH_ADMIN,
      UserRole.PRINCIPAL,
      UserRole.EXAM_OFFICER,
      UserRole.ACADEMIC_OFFICER,
      UserRole.HOD,
      UserRole.TEACHER,
    ]) {
      expect(() =>
        TenantHelper.assertOwnStudentRecord(student, ctx(role, 'someone-else')),
      ).not.toThrow();
    }
  });

  it('allows a STUDENT caller who is the student themself', () => {
    expect(() =>
      TenantHelper.assertOwnStudentRecord(student, ctx(UserRole.STUDENT, 'student-user-1')),
    ).not.toThrow();
  });

  it('blocks a STUDENT caller looking at a different student', () => {
    expect(() =>
      TenantHelper.assertOwnStudentRecord(student, ctx(UserRole.STUDENT, 'some-other-student')),
    ).toThrow(ForbiddenException);
  });

  it('allows a PARENT caller who is the linked parent', () => {
    expect(() =>
      TenantHelper.assertOwnStudentRecord(student, ctx(UserRole.PARENT, 'parent-user-1')),
    ).not.toThrow();
  });

  it('blocks a PARENT caller who is not the linked parent', () => {
    expect(() =>
      TenantHelper.assertOwnStudentRecord(student, ctx(UserRole.PARENT, 'some-other-parent')),
    ).toThrow(ForbiddenException);
  });

  it('blocks any other role entirely', () => {
    expect(() =>
      TenantHelper.assertOwnStudentRecord(student, ctx(UserRole.RECEPTIONIST, 'someone')),
    ).toThrow(ForbiddenException);
  });
});
