import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  inventoryCategory: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  inventoryStore: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  inventorySupplier: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  inventoryUnit: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  inventoryProduct: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
  inventoryPurchase: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  inventoryIssue: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  inventorySale: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn((callback: any) => callback(mockPrismaService)),
} as unknown as PrismaService;

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: PrismaService;

  const mockContext = {
    userId: 'user-1',
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: 'BRANCH_ADMIN' as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product with costPrice and sellingPrice', async () => {
      const dto = {
        name: 'Test Product',
        initialStock: 10,
        categoryId: 'cat-1',
        unitId: 'unit-1',
        branchId: 'branch-1',
        costPrice: 100,
        sellingPrice: 150,
      };

      (mockPrismaService.inventoryProduct.create as jest.Mock).mockResolvedValue(dto);

      const result = await service.createProduct(dto);

      expect(result).toEqual(dto);
      // createProduct destructures initialStock out of the dto and sets the
      // actual `stock` column from it explicitly.
      const { initialStock, ...rest } = dto;
      expect(mockPrismaService.inventoryProduct.create).toHaveBeenCalledWith({
        data: {
          ...rest,
          branchId: dto.branchId,
          stock: initialStock,
        },
      });
    });
  });

  describe('updateProduct', () => {
    it('should update product pricing', async () => {
      const id = 'prod-1';
      const dto = {
        costPrice: 200,
        sellingPrice: 250,
      };

      (mockPrismaService.inventoryProduct.findFirst as jest.Mock).mockResolvedValue({ id });
      (mockPrismaService.inventoryProduct.update as jest.Mock).mockResolvedValue({
        id,
        ...dto,
      });

      const result = await service.updateProduct(id, dto, mockContext);

      expect(result).toEqual({ id, ...dto });
      expect(mockPrismaService.inventoryProduct.update).toHaveBeenCalledWith({
        where: { id, branchId: mockContext.branchId },
        data: dto,
      });
    });
  });

  /**
   * Regression tests for the finding that stock-sufficiency checks read
   * product.stock via a plain findUnique then decremented separately —
   * under concurrent requests this could let stock go negative. Both now
   * use an atomic updateMany({ where: { stock: { gte } } }) so Postgres
   * serializes concurrent decrements against the same row.
   */
  describe('issueItem / createSale stock race protection', () => {
    it('issueItem throws and never creates a record when the atomic decrement matches zero rows', async () => {
      (mockPrismaService.inventoryProduct.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      await expect(
        service.issueItem({
          productId: 'prod-1',
          branchId: 'branch-1',
          quantity: 5,
        } as any),
      ).rejects.toThrow('Insufficient stock or product not found');

      expect(mockPrismaService.inventoryProduct.updateMany).toHaveBeenCalledWith({
        where: { id: 'prod-1', branchId: 'branch-1', stock: { gte: 5 } },
        data: { stock: { decrement: 5 } },
      });
      expect(mockPrismaService.inventoryIssue.create).not.toHaveBeenCalled();
    });

    it('issueItem creates the issue once stock is atomically confirmed and decremented', async () => {
      (mockPrismaService.inventoryProduct.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (mockPrismaService.inventoryIssue.create as jest.Mock).mockResolvedValue({ id: 'issue-1' });

      const result = await service.issueItem({
        productId: 'prod-1',
        branchId: 'branch-1',
        quantity: 5,
      } as any);

      expect(result).toEqual({ id: 'issue-1' });
      expect(mockPrismaService.inventoryIssue.create).toHaveBeenCalled();
    });

    it('createSale throws when the atomic decrement matches zero rows', async () => {
      (mockPrismaService.inventoryProduct.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      await expect(
        service.createSale({
          productId: 'prod-1',
          branchId: 'branch-1',
          quantity: 3,
          unitPrice: 10,
        } as any),
      ).rejects.toThrow('Insufficient stock');
      expect(mockPrismaService.inventorySale.create).not.toHaveBeenCalled();
    });

    it('createSale computes totalPrice via Decimal, not floating-point Number multiplication', async () => {
      (mockPrismaService.inventoryProduct.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (mockPrismaService.inventorySale.create as jest.Mock).mockImplementation((args: any) =>
        Promise.resolve({ id: 'sale-1', ...args.data }),
      );

      await service.createSale({
        productId: 'prod-1',
        branchId: 'branch-1',
        quantity: 3,
        unitPrice: 10.1,
      } as any);

      const createArgs = (mockPrismaService.inventorySale.create as jest.Mock).mock.calls[0][0];
      expect(createArgs.data.totalPrice.toString()).toBe('30.3');
    });
  });
});