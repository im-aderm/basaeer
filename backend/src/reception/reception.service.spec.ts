
import { Test, TestingModule } from '@nestjs/testing';
import { ReceptionService } from './reception.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
    admissionEnquiry: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    callLog: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    visitorLog: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    complaint: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    postalRecord: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

describe('ReceptionService', () => {
    let service: ReceptionService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReceptionService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<ReceptionService>(ReceptionService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createEnquiry', () => {
        it('should create an enquiry', async () => {
            const dto = {
                name: 'John Doe',
                phone: '1234567890',
                email: 'john@example.com',
                type: 'ADMISSION',
                status: 'PENDING',
                branchId: 'branch-1',
                description: 'Test enquiry',
                assignedTo: 'staff-1',
            };

            mockPrismaService.admissionEnquiry.create.mockResolvedValue(dto);

            const result = await service.createEnquiry(dto as any);
            expect(result).toEqual(dto);
            expect(mockPrismaService.admissionEnquiry.create).toHaveBeenCalledWith({
                data: dto,
            });
        });
    });

    describe('getVisitorLogs', () => {
        it('should return visitor logs for a branch', async () => {
            const branchId = 'branch-1';
            const logs = [{ id: '1', name: 'Visitor 1' }];

            mockPrismaService.visitorLog.findMany.mockResolvedValue(logs);

            const result = await service.getVisitorLogs(branchId);
            expect(result).toEqual(logs);
            expect(mockPrismaService.visitorLog.findMany).toHaveBeenCalledWith({
                where: { branchId },
                orderBy: { createdAt: 'desc' },
            });
        });
    });
});
