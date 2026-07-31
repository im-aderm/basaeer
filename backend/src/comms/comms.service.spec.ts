import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommsService } from './comms.service';
import { PrismaService } from '../prisma/prisma.service';
import { BranchBrandingService } from '../branches/branch-branding.service';
import { getQueueToken } from '@nestjs/bullmq';
import { CommsRecipientGroup } from '@basaer/shared-types';

/**
 * Regression tests for the finding that the frontend's recipient-group
 * dropdown (ALL_STUDENTS/ALL_STAFF/PARENTS/ALUMNI) sent values that never
 * matched what this service checked for (students/staff/default-all), so
 * every campaign silently broadcast to the entire branch regardless of the
 * audience actually selected. Both sides now share CommsRecipientGroup.
 */
describe('CommsService.getRecipients', () => {
  let service: CommsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { findMany: jest.fn().mockResolvedValue([]) },
      alumni: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommsService,
        { provide: PrismaService, useValue: prisma },
        { provide: BranchBrandingService, useValue: {} },
        { provide: getQueueToken('email'), useValue: {} },
        { provide: getQueueToken('sms'), useValue: {} },
      ],
    }).compile();

    service = module.get<CommsService>(CommsService);
  });

  it('throws on an unrecognized recipient group instead of silently defaulting to all', async () => {
    await expect(
      (service as any).getRecipients('ALL_STUDENTS', 'branch-1'),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('STUDENTS queries only the STUDENT role, not STUDENT+PARENT combined', async () => {
    await (service as any).getRecipients(CommsRecipientGroup.STUDENTS, 'branch-1');
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ role: 'STUDENT' }) }),
    );
  });

  it('PARENTS queries only the PARENT role', async () => {
    await (service as any).getRecipients(CommsRecipientGroup.PARENTS, 'branch-1');
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ role: 'PARENT' }) }),
    );
  });

  it('ALUMNI resolves recipients via Alumni -> Student -> User, filtered to active users', async () => {
    prisma.alumni.findMany.mockResolvedValue([
      { student: { user: { id: 'u1', email: 'a@x.com', phone: null, isActive: true } } },
      { student: { user: { id: 'u2', email: 'b@x.com', phone: null, isActive: false } } },
      { student: { user: null } },
    ]);

    const result = await (service as any).getRecipients(CommsRecipientGroup.ALUMNI, 'branch-1');
    expect(result).toEqual([{ id: 'u1', email: 'a@x.com', phone: null, isActive: true }]);
  });

  it('ALL queries every active user in the branch with no role filter', async () => {
    await (service as any).getRecipients(CommsRecipientGroup.ALL, 'branch-1');
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { branchId: 'branch-1', isActive: true },
      select: { id: true, email: true, phone: true },
    });
  });
});
