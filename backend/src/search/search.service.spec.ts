import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SearchService', () => {
    let service: SearchService;
    let prisma: PrismaService;

    const mockPrismaService = {
        student: {
            findMany: jest.fn(),
        },
        user: {
            findMany: jest.fn(),
        },
        inventoryProduct: {
            findMany: jest.fn(),
        },
        campusEvent: {
            findMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SearchService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<SearchService>(SearchService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('globalSearch', () => {
        const branchId = 'test-branch-id';

        it('should return empty results for queries less than 2 characters', async () => {
            const result = await service.globalSearch(branchId, 'a');

            expect(result).toEqual({
                students: [],
                staff: [],
                inventory: [],
                events: [],
            });
            expect(mockPrismaService.student.findMany).not.toHaveBeenCalled();
        });

        it('should return empty results for empty query', async () => {
            const result = await service.globalSearch(branchId, '');

            expect(result).toEqual({
                students: [],
                staff: [],
                inventory: [],
                events: [],
            });
        });

        it('should search across all entities with valid query', async () => {
            const query = 'test';

            const mockStudents = [
                { id: '1', firstName: 'Test', lastName: 'Student' }
            ];
            const mockUsers = [
                { id: '2', firstName: 'Test', lastName: 'Teacher', email: 'test@example.com', role: 'TEACHER' }
            ];
            const mockInventory = [
                { id: '3', name: 'Test Product', stock: 50 }
            ];
            const mockEvents = [
                { id: '4', title: 'Test Event', startDate: new Date() }
            ];

            mockPrismaService.student.findMany.mockResolvedValue(mockStudents);
            mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
            mockPrismaService.inventoryProduct.findMany.mockResolvedValue(mockInventory);
            mockPrismaService.campusEvent.findMany.mockResolvedValue(mockEvents);

            const result = await service.globalSearch(branchId, query);

            expect(result.students).toEqual(mockStudents);
            expect(result.staff).toEqual(mockUsers);
            expect(result.inventory).toEqual(mockInventory);
            expect(result.events).toEqual(mockEvents);
        });

        it('should use case-insensitive search', async () => {
            const query = 'JOHN';

            mockPrismaService.student.findMany.mockResolvedValue([]);
            mockPrismaService.user.findMany.mockResolvedValue([]);
            mockPrismaService.inventoryProduct.findMany.mockResolvedValue([]);
            mockPrismaService.campusEvent.findMany.mockResolvedValue([]);

            await service.globalSearch(branchId, query);

            expect(mockPrismaService.student.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            expect.objectContaining({ firstName: { contains: query, mode: 'insensitive' } })
                        ])
                    })
                })
            );
        });

        it('should limit results to 5 per category', async () => {
            const query = 'test';

            mockPrismaService.student.findMany.mockResolvedValue([]);
            mockPrismaService.user.findMany.mockResolvedValue([]);
            mockPrismaService.inventoryProduct.findMany.mockResolvedValue([]);
            mockPrismaService.campusEvent.findMany.mockResolvedValue([]);

            await service.globalSearch(branchId, query);

            expect(mockPrismaService.student.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 5 })
            );
            expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 5 })
            );
            expect(mockPrismaService.inventoryProduct.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 5 })
            );
            expect(mockPrismaService.campusEvent.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 5 })
            );
        });

        it('should only select required fields', async () => {
            const query = 'test';

            mockPrismaService.student.findMany.mockResolvedValue([]);
            mockPrismaService.user.findMany.mockResolvedValue([]);
            mockPrismaService.inventoryProduct.findMany.mockResolvedValue([]);
            mockPrismaService.campusEvent.findMany.mockResolvedValue([]);

            await service.globalSearch(branchId, query);

            // Verify field selection for students
            expect(mockPrismaService.student.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    }
                })
            );

            // Verify field selection for users
            expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    }
                })
            );
        });

        it('should order results correctly', async () => {
            const query = 'test';

            mockPrismaService.student.findMany.mockResolvedValue([]);
            mockPrismaService.user.findMany.mockResolvedValue([]);
            mockPrismaService.inventoryProduct.findMany.mockResolvedValue([]);
            mockPrismaService.campusEvent.findMany.mockResolvedValue([]);

            await service.globalSearch(branchId, query);

            // Students ordered by firstName
            expect(mockPrismaService.student.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { firstName: 'asc' }
                })
            );

            // Events ordered by startDate descending
            expect(mockPrismaService.campusEvent.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { startDate: 'desc' }
                })
            );
        });

        it('should filter out STUDENT and PARENT roles from user search', async () => {
            const query = 'test';

            mockPrismaService.student.findMany.mockResolvedValue([]);
            mockPrismaService.user.findMany.mockResolvedValue([]);
            mockPrismaService.inventoryProduct.findMany.mockResolvedValue([]);
            mockPrismaService.campusEvent.findMany.mockResolvedValue([]);

            await service.globalSearch(branchId, query);

            expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        role: { notIn: ['STUDENT', 'PARENT'] }
                    })
                })
            );
        });

        it('should filter by branchId for all entities', async () => {
            const query = 'test';

            mockPrismaService.student.findMany.mockResolvedValue([]);
            mockPrismaService.user.findMany.mockResolvedValue([]);
            mockPrismaService.inventoryProduct.findMany.mockResolvedValue([]);
            mockPrismaService.campusEvent.findMany.mockResolvedValue([]);

            await service.globalSearch(branchId, query);

            expect(mockPrismaService.student.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ branchId })
                })
            );
            expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ branchId })
                })
            );
            expect(mockPrismaService.inventoryProduct.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ branchId })
                })
            );
            expect(mockPrismaService.campusEvent.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ branchId })
                })
            );
        });

        it('should handle search errors gracefully', async () => {
            const query = 'test';

            mockPrismaService.student.findMany.mockRejectedValue(new Error('Database error'));

            await expect(service.globalSearch(branchId, query)).rejects.toThrow('Database error');
        });
    });
});
