import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SearchService', () => {
  let service: SearchService;

  const mockPrismaService = {
    student: { findMany: jest.fn() },
    user: { findMany: jest.fn() },
    inventoryProduct: { findMany: jest.fn() },
    book: { findMany: jest.fn() },
    invoice: { findMany: jest.fn() },
    hostel: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get<SearchService>(SearchService);
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
        books: [],
        invoices: [],
        hostel: [],
      });
    });

    it('should return empty results for empty query', async () => {
      const result = await service.globalSearch(branchId, '');
      expect(result).toEqual({
        students: [],
        staff: [],
        inventory: [],
        books: [],
        invoices: [],
        hostel: [],
      });
    });

    it('should search across all entities with valid query', async () => {
      const query = 'test';
      mockPrismaService.student.findMany.mockResolvedValue([
        { id: '1', firstName: 'Test', lastName: 'Student' },
      ]);
      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: '2',
          firstName: 'Test',
          lastName: 'Teacher',
          email: 't@t.com',
          role: 'TEACHER',
        },
      ]);
      mockPrismaService.inventoryProduct.findMany.mockResolvedValue([
        { id: '3', name: 'Test', stock: 50 },
      ]);
      mockPrismaService.book.findMany.mockResolvedValue([
        { id: '4', title: 'Test', author: 'A', isbn: 'I', available: 5 },
      ]);
      mockPrismaService.invoice.findMany.mockResolvedValue([]);
      mockPrismaService.hostel.findMany.mockResolvedValue([]);

      const result = await service.globalSearch(branchId, query);
      expect(result.students).toHaveLength(1);
      expect(result.staff).toHaveLength(1);
      expect(result.inventory).toHaveLength(1);
      expect(result.books).toHaveLength(1);
    });

    it('should use case-insensitive search for students', async () => {
      const query = 'JOHN';
      mockPrismaService.student.findMany.mockResolvedValue([]);
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.inventoryProduct.findMany.mockResolvedValue([]);
      mockPrismaService.book.findMany.mockResolvedValue([]);
      mockPrismaService.invoice.findMany.mockResolvedValue([]);
      mockPrismaService.hostel.findMany.mockResolvedValue([]);

      await service.globalSearch(branchId, query);

      expect(mockPrismaService.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                firstName: { contains: query, mode: 'insensitive' },
              }),
            ]),
          }),
        }),
      );
    });

    it('should filter by branchId for all entities', async () => {
      const query = 'test';
      mockPrismaService.student.findMany.mockResolvedValue([]);
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.inventoryProduct.findMany.mockResolvedValue([]);
      mockPrismaService.book.findMany.mockResolvedValue([]);
      mockPrismaService.invoice.findMany.mockResolvedValue([]);
      mockPrismaService.hostel.findMany.mockResolvedValue([]);

      await service.globalSearch(branchId, query);

      expect(mockPrismaService.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ branchId }),
        }),
      );
    });

    it('should handle database errors gracefully', async () => {
      mockPrismaService.student.findMany.mockRejectedValue(
        new Error('Database error'),
      );
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.inventoryProduct.findMany.mockResolvedValue([]);
      mockPrismaService.book.findMany.mockResolvedValue([]);
      mockPrismaService.invoice.findMany.mockResolvedValue([]);
      mockPrismaService.hostel.findMany.mockResolvedValue([]);

      await expect(service.globalSearch(branchId, 'test')).rejects.toThrow(
        'Database error',
      );
    });
  });
});
