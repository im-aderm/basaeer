import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: {
    academicSession: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      academicSession: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Regression tests for the finding that GET /sessions and /sessions/active
  // were unauthenticated and returned every branch's data unfiltered.
  describe('branch scoping', () => {
    it('findAll scopes by branchId when one is provided', async () => {
      prisma.academicSession.findMany.mockResolvedValue([]);
      await service.findAll('branch-1');
      expect(prisma.academicSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { branchId: 'branch-1' } }),
      );
    });

    it('findActive scopes by branchId when one is provided', async () => {
      prisma.academicSession.findFirst.mockResolvedValue(null);
      await service.findActive('branch-1');
      expect(prisma.academicSession.findFirst).toHaveBeenCalledWith({
        where: { status: 'CURRENT', branchId: 'branch-1' },
      });
    });

    it('findOne only matches a session within the given branch', async () => {
      prisma.academicSession.findFirst.mockResolvedValue(null);
      await service.findOne('session-1', 'branch-1');
      expect(prisma.academicSession.findFirst).toHaveBeenCalledWith({
        where: { id: 'session-1', branchId: 'branch-1' },
      });
    });

    it('remove throws NotFoundException instead of deleting a session outside the caller branch', async () => {
      prisma.academicSession.findFirst.mockResolvedValue(null);
      await expect(service.remove('session-1', 'branch-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.academicSession.delete).not.toHaveBeenCalled();
    });

    it('update throws NotFoundException instead of updating a session outside the caller branch', async () => {
      prisma.academicSession.findFirst.mockResolvedValue(null);
      await expect(
        service.update('session-1', { name: 'x' } as any, 'branch-1'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.academicSession.update).not.toHaveBeenCalled();
    });
  });
});
