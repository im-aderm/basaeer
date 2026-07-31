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
      emailTemplate: { findUnique: jest.fn() },
      smsTemplate: { findUnique: jest.fn() },
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

/**
 * Regression tests for the finding that birthday-student/birthday-staff
 * save a STUDENT_BIRTHDAY/STAFF_BIRTHDAY config with a template reference
 * like "EMAIL:<id>"/"SMS:<id>", but this worker only ever read the generic
 * BIRTHDAY_WISH config and treated `template` as literal text — so those
 * two pages' settings were never read, and even a type-only fix would have
 * sent the literal string "EMAIL:<uuid>" as the message.
 */
describe('AutomationWorker birthday config resolution', () => {
  let worker: AutomationWorker;
  let prisma: any;
  let comms: { sendSms: jest.Mock; sendEmail: jest.Mock };

  beforeEach(async () => {
    comms = { sendSms: jest.fn(), sendEmail: jest.fn() };
    prisma = {
      automationConfig: { findFirst: jest.fn() },
      emailTemplate: { findUnique: jest.fn() },
      smsTemplate: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationWorker,
        { provide: PrismaService, useValue: prisma },
        { provide: CommsService, useValue: comms },
        { provide: NotificationsService, useValue: { createNotification: jest.fn() } },
      ],
    }).compile();

    worker = module.get<AutomationWorker>(AutomationWorker);
  });

  const student = {
    id: 's1',
    firstName: 'Amina',
    lastName: 'Bello',
    email: 'amina@example.com',
    phone: '+2340000000',
    branchId: 'branch-1',
    kind: 'STUDENT' as const,
  };

  it('prefers the audience-specific config (STUDENT_BIRTHDAY) over the generic BIRTHDAY_WISH', async () => {
    prisma.automationConfig.findFirst.mockResolvedValueOnce({
      template: 'Happy day, student!',
    });

    await (worker as any).dispatchBirthdayWish(student);

    expect(prisma.automationConfig.findFirst).toHaveBeenCalledWith({
      where: { branchId: 'branch-1', type: 'STUDENT_BIRTHDAY', isEnabled: true },
    });
    expect(comms.sendSms).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Happy day, student!' }),
    );
  });

  it('falls back to BIRTHDAY_WISH when no audience-specific config is enabled', async () => {
    prisma.automationConfig.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ template: 'Generic happy birthday!' });

    await (worker as any).dispatchBirthdayWish(student);

    expect(prisma.automationConfig.findFirst).toHaveBeenNthCalledWith(2, {
      where: { branchId: 'branch-1', type: 'BIRTHDAY_WISH', isEnabled: true },
    });
    expect(comms.sendSms).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Generic happy birthday!' }),
    );
  });

  it('resolves an EMAIL: template reference to its real content for the email channel', async () => {
    prisma.automationConfig.findFirst.mockResolvedValueOnce({ template: 'EMAIL:tpl-1' });
    prisma.emailTemplate.findUnique.mockResolvedValue({ body: 'Real email body for {{name}}' });

    await (worker as any).dispatchBirthdayWish(student);

    expect(prisma.emailTemplate.findUnique).toHaveBeenCalledWith({ where: { id: 'tpl-1' } });
    expect(comms.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Real email body for Amina Bello'),
      }),
    );
    // The SMS channel has no SMS: reference to resolve, so it falls back to
    // the default text rather than sending the literal "EMAIL:tpl-1" string.
    expect(comms.sendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.not.stringContaining('EMAIL:'),
      }),
    );
  });
});
