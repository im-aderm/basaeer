import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';

/**
 * Regression test for the finding that UsersController never applied
 * BranchGuard, so updateStatus's TenantContext parameter was always
 * undefined and TenantHelper.applyIsolation threw a TypeError (a 500) on
 * every call. This exercises the service with a real, populated context —
 * the shape BranchGuard now actually supplies since the guard was added.
 */
describe('UsersService.updateStatus', () => {
  let service: UsersService;
  let prisma: any;

  const branchAdminCtx: TenantContext = {
    userId: 'admin-1',
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: UserRole.BRANCH_ADMIN,
  };

  beforeEach(async () => {
    prisma = {
      user: { findFirst: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('updates status for a user within the caller branch', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u1', branchId: 'branch-1' });
    prisma.user.update.mockResolvedValue({ id: 'u1', isActive: false });

    await service.updateStatus('u1', false, branchAdminCtx);

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'u1', branchId: 'branch-1' },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { isActive: false },
    });
  });

  it('404s instead of updating a user outside the caller branch', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.updateStatus('u1', false, branchAdminCtx)).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
