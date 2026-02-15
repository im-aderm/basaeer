
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
        update: jest.fn(),
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
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
};

describe('InventoryService', () => {
    let service: InventoryService;
    let prisma: PrismaService;

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
                stock: 10,
                categoryId: 'cat-1',
                unitId: 'unit-1',
                branchId: 'branch-1',
                costPrice: 100,
                sellingPrice: 150,
            };

            mockPrismaService.inventoryProduct.create.mockResolvedValue(dto);

            const result = await service.createProduct(dto as any);

            expect(result).toEqual(dto);
            expect(mockPrismaService.inventoryProduct.create).toHaveBeenCalledWith({
                data: {
                    ...dto,
                    branchId: dto.branchId,
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

            mockPrismaService.inventoryProduct.update.mockResolvedValue({ id, ...dto });

            const result = await service.updateProduct(id, dto);

            expect(result).toEqual({ id, ...dto });
            expect(mockPrismaService.inventoryProduct.update).toHaveBeenCalledWith({
                where: { id },
                data: dto,
            });
        });
    });
});
