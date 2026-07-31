import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StakeholderService } from './stakeholder.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Regression test for the finding that rsvpEvent passed the caller's own
 * userId straight through as if it were an alumniId (a comment admitted
 * this was a placeholder), silently creating malformed
 * AlumniEventParticipant rows. It should resolve the Alumni record linked
 * to the caller via Student.userId instead.
 */
describe('StakeholderService.rsvpEvent', () => {
  let service: StakeholderService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      alumni: { findFirst: jest.fn() },
      alumniEventParticipant: { upsert: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [StakeholderService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<StakeholderService>(StakeholderService);
  });

  it('resolves the Alumni record via Student.userId, not the raw userId', async () => {
    prisma.alumni.findFirst.mockResolvedValue({ id: 'alumni-1' });
    prisma.alumniEventParticipant.upsert.mockResolvedValue({ id: 'p1' });

    await service.rsvpEvent('user-1', 'event-1', 'GOING');

    expect(prisma.alumni.findFirst).toHaveBeenCalledWith({
      where: { student: { userId: 'user-1' } },
      select: { id: true },
    });
    expect(prisma.alumniEventParticipant.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { alumniId_eventId: { alumniId: 'alumni-1', eventId: 'event-1' } },
      }),
    );
  });

  it('throws NotFoundException when the caller has no linked alumni record', async () => {
    prisma.alumni.findFirst.mockResolvedValue(null);
    await expect(service.rsvpEvent('user-1', 'event-1', 'GOING')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.alumniEventParticipant.upsert).not.toHaveBeenCalled();
  });
});
