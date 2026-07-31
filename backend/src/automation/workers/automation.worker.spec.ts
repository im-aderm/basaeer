import { Test, TestingModule } from '@nestjs/testing';
import { AutomationWorker } from './automation.worker';
import { PrismaService } from '../../prisma/prisma.service';
import { CommsService } from '../../comms/comms.service';
import { NotificationsService } from '../../notifications/notifications.service';

/**
 * Regression test for the finding that this cron worker (running outside
 * NestJS's request lifecycle, so TenantContextInterceptor never runs for
 * it) called Prisma directly with no ambient tenant context at all. Each
 * person/config's dispatch must be wrapped in its own branch context via
 * runInTenantContext, since a single run processes many branches at once.
 */
describe('AutomationWorker tenant context propagation', () => {
  let worker: AutomationWorker;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn(),
      automationConfig: { findFirst: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
      automationExecution: { create: jest.fn() },
      invoice: { findMany: jest.fn() },
      attendance: { findMany: jest.fn() },
      runInTenantContext: jest.fn((_branchId: any, _sessionId: any, _userId: any, fn: () => any) => fn()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationWorker,
        { provide: PrismaService, useValue: prisma },
        { provide: CommsService, useValue: { sendSms: jest.fn(), sendEmail: jest.fn() } },
        { provide: NotificationsService, useValue: { createNotification: jest.fn() } },
      ],
    }).compile();

    worker = module.get<AutomationWorker>(AutomationWorker);
  });

  it('wraps each birthday dispatch in the correct branch context', async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([
        { id: 's1', firstName: 'A', lastName: 'B', email: null, phone: null, branchId: 'branch-1' },
      ])
      .mockResolvedValueOnce([]);
    prisma.automationConfig.findFirst.mockResolvedValue(null); // not enabled -> short-circuits

    await worker.handleBirthdayWishes();

    expect(prisma.runInTenantContext).toHaveBeenCalledWith(
      'branch-1',
      null,
      'system',
      expect.any(Function),
    );
  });

  it('wraps each fee-reminder branch config in its own context', async () => {
    prisma.automationConfig.findMany.mockResolvedValue([
      { id: 'c1', branchId: 'branch-2', triggerDays: 3, template: null },
    ]);
    prisma.invoice.findMany.mockResolvedValue([]);

    await worker.handleFeeReminders();

    expect(prisma.runInTenantContext).toHaveBeenCalledWith(
      'branch-2',
      null,
      'system',
      expect.any(Function),
    );
  });
});
