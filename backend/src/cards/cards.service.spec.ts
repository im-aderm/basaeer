import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './cards.service';
import { PrismaService } from '../prisma/prisma.service';
import { QRService } from '../attendance/qr.service';
import { CommsService } from '../comms/comms.service';
import { UserRole } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';

/**
 * Regression test for the finding that generateCards never validated that
 * target student/staff ids belonged to the caller's own branch — a branch
 * admin could generate an ID card for a student in a different branch just
 * by supplying their id.
 */
describe('CardsService.generateCards branch scoping', () => {
  let service: CardsService;
  let tx: any;
  let prisma: any;

  const branchAdminCtx: TenantContext = {
    userId: 'admin-1',
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: UserRole.BRANCH_ADMIN,
  };

  beforeEach(async () => {
    tx = {
      student: { findUnique: jest.fn() },
      staff: { findUnique: jest.fn() },
      idCard: { upsert: jest.fn(), create: jest.fn() },
    };
    prisma = {
      $transaction: jest.fn((fn: any) => fn(tx)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: PrismaService, useValue: prisma },
        { provide: QRService, useValue: {} },
        { provide: CommsService, useValue: { sendEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  it('skips generating a card for a student in a different branch', async () => {
    tx.student.findUnique.mockResolvedValue({ branchId: 'other-branch' });

    const results = await service.generateCards(
      { templateId: 't1', sessionId: 's1', studentIds: ['student-1'] } as any,
      branchAdminCtx,
    );

    expect(tx.idCard.upsert).not.toHaveBeenCalled();
    expect(results).toEqual([]);
  });

  it('generates a card for a student in the caller own branch', async () => {
    tx.student.findUnique.mockResolvedValue({ branchId: 'branch-1' });
    tx.idCard.upsert.mockResolvedValue({ id: 'card-1', studentId: 'student-1' });

    await service.generateCards(
      { templateId: 't1', sessionId: 's1', studentIds: ['student-1'] } as any,
      branchAdminCtx,
    );

    expect(tx.idCard.upsert).toHaveBeenCalled();
  });

  it('skips generating a card for staff in a different branch', async () => {
    tx.staff.findUnique.mockResolvedValue({ user: { branchId: 'other-branch' } });

    await service.generateCards(
      { templateId: 't1', sessionId: 's1', staffIds: ['staff-1'] } as any,
      branchAdminCtx,
    );

    expect(tx.idCard.create).not.toHaveBeenCalled();
  });

  it('a SUPER_ADMIN can generate cards across branches', async () => {
    const superAdminCtx: TenantContext = {
      userId: 'sa-1',
      branchId: null,
      isSuperAdmin: true,
      role: UserRole.SUPER_ADMIN,
    };
    tx.student.findUnique.mockResolvedValue({ branchId: 'any-branch' });
    tx.idCard.upsert.mockResolvedValue({ id: 'card-1', studentId: 'student-1' });

    await service.generateCards(
      { templateId: 't1', sessionId: 's1', studentIds: ['student-1'] } as any,
      superAdminCtx,
    );

    expect(tx.idCard.upsert).toHaveBeenCalled();
  });
});
