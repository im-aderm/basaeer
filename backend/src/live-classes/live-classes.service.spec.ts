import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LiveClassesService } from './live-classes.service';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from './encryption.service';
import { GoogleMeetService } from './google-meet.service';

/**
 * Regression tests for the finding that getSessionById/updateSession/
 * startSession/endSession/cancelSession took a bare session id with no
 * branch check at all — any teacher/admin from any branch could read or
 * mutate another branch's live-class session, including its real Google
 * Meet host/join links.
 */
describe('LiveClassesService branch scoping', () => {
  let service: LiveClassesService;
  let prisma: any;
  let googleMeet: any;

  beforeEach(async () => {
    prisma = {
      liveClassSession: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    googleMeet = { deleteMeeting: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveClassesService,
        { provide: PrismaService, useValue: prisma },
        { provide: EncryptionService, useValue: {} },
        { provide: GoogleMeetService, useValue: googleMeet },
      ],
    }).compile();

    service = module.get<LiveClassesService>(LiveClassesService);
  });

  const cases: Array<[string, (svc: LiveClassesService) => Promise<any>]> = [
    ['getSessionById', (svc) => svc.getSessionById('s1', 'branch-1')],
    ['updateSession', (svc) => svc.updateSession('s1', 'branch-1', {} as any)],
    ['startSession', (svc) => svc.startSession('s1', 'branch-1')],
    ['endSession', (svc) => svc.endSession('s1', 'branch-1')],
    ['cancelSession', (svc) => svc.cancelSession('s1', 'branch-1')],
  ];

  it.each(cases)('%s 404s for a session outside the caller branch', async (_name, call) => {
    prisma.liveClassSession.findFirst.mockResolvedValue(null);
    await expect(call(service)).rejects.toThrow(NotFoundException);
    expect(prisma.liveClassSession.update).not.toHaveBeenCalled();
  });

  it('getSessionById scopes the lookup by id AND branchId', async () => {
    prisma.liveClassSession.findFirst.mockResolvedValue({ id: 's1', branchId: 'branch-1' });
    prisma.liveClassSession.findUnique.mockResolvedValue({ id: 's1' });
    await service.getSessionById('s1', 'branch-1');
    expect(prisma.liveClassSession.findFirst).toHaveBeenCalledWith({
      where: { id: 's1', branchId: 'branch-1' },
    });
  });

  it('cancelSession only deletes the Google Meet event once branch ownership is confirmed', async () => {
    prisma.liveClassSession.findFirst.mockResolvedValue({
      id: 's1',
      branchId: 'branch-1',
      meetingId: 'meet-1',
    });
    prisma.liveClassSession.update.mockResolvedValue({ id: 's1', status: 'CANCELLED' });

    await service.cancelSession('s1', 'branch-1');

    expect(googleMeet.deleteMeeting).toHaveBeenCalledWith('branch-1', 'meet-1');
    expect(prisma.liveClassSession.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { status: 'CANCELLED' },
    });
  });
});
