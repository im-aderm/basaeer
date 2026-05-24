import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    campusEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    eventPackage: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    eventSchedule: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    eventGallery: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    eventApplication: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockAuditService = {
    log: jest.fn(),
    logAction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEvents', () => {
    it('should filter by branchId for non-super admins', async () => {
      const ctx: TenantContext = {
        userId: 'user-1',
        branchId: 'branch-1',
        isSuperAdmin: false,
        role: UserRole.BRANCH_ADMIN,
      };

      await service.getEvents(ctx);

      expect(prisma.campusEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            branchId: 'branch-1',
          }),
        }),
      );
    });

    it('should not filter by branchId for super admins', async () => {
      const ctx: TenantContext = {
        userId: 'user-1',
        branchId: null,
        isSuperAdmin: true,
        role: UserRole.SUPER_ADMIN,
      };

      await service.getEvents(ctx);

      expect(prisma.campusEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });
  });
});
