import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateInventoryCategoryDto,
    CreateInventoryStoreDto,
    CreateInventorySupplierDto,
    CreateInventoryUnitDto,
    CreateInventoryProductDto,
    CreateInventoryPurchaseDto,
    IssueItemDto,
    CreateInventorySaleDto,
    UpdateInventoryProductDto,
    UpdateInventoryCategoryDto,
    UpdateInventoryStoreDto,
    UpdateInventorySupplierDto,
    UpdateInventoryUnitDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    // Basic CRUD for Setup
    createCategory(dto: CreateInventoryCategoryDto) {
        return this.prisma.inventoryCategory.create({
            data: { ...dto, branchId: dto.branchId! },
        });
    }

    getCategories(branchId: string | null) {
        return this.prisma.inventoryCategory.findMany({ where: { ...(branchId && { branchId }) } });
    }

    createStore(dto: CreateInventoryStoreDto) {
        return this.prisma.inventoryStore.create({
            data: { ...dto, branchId: dto.branchId! },
        });
    }

    getStores(branchId: string | null) {
        return this.prisma.inventoryStore.findMany({ where: { ...(branchId && { branchId }) } });
    }

    createSupplier(dto: CreateInventorySupplierDto) {
        return this.prisma.inventorySupplier.create({
            data: { ...dto, branchId: dto.branchId! },
        });
    }

    getSuppliers(branchId: string | null) {
        return this.prisma.inventorySupplier.findMany({ where: { ...(branchId && { branchId }) } });
    }

    createUnit(dto: CreateInventoryUnitDto) {
        return this.prisma.inventoryUnit.create({
            data: { ...dto, branchId: dto.branchId! },
        });
    }

    getUnits(branchId: string | null) {
        return this.prisma.inventoryUnit.findMany({ where: { ...(branchId && { branchId }) } });
    }

    // Products
    createProduct(dto: CreateInventoryProductDto) {
        return this.prisma.inventoryProduct.create({
            data: { ...dto, branchId: dto.branchId! },
        });
    }

    getProducts(branchId: string | null) {
        return this.prisma.inventoryProduct.findMany({
            where: { ...(branchId && { branchId }) },
            include: { category: true, unit: true, store: true },
        });
    }

    // Transactions (Purchase - Increases Stock)
    async createPurchase(dto: CreateInventoryPurchaseDto) {
        return this.prisma.$transaction(async (tx) => {
            const purchase = await tx.inventoryPurchase.create({
                data: {
                    ...dto,
                    branchId: dto.branchId!,
                    totalPrice: dto.quantity * dto.unitPrice,
                },
            });

            // Update product stock
            await tx.inventoryProduct.update({
                where: { id: dto.productId },
                data: { stock: { increment: dto.quantity } },
            });

            return purchase;
        });
    }

    // Transactions (Issue - Decreases Stock)
    async issueItem(dto: IssueItemDto) {
        return this.prisma.$transaction(async (tx) => {
            const product = await tx.inventoryProduct.findUnique({
                where: { id: dto.productId },
            });

            if (!product || product.stock < dto.quantity) {
                throw new BadRequestException('Insufficient stock or product not found');
            }

            const issue = await tx.inventoryIssue.create({
                data: {
                    ...dto,
                    branchId: dto.branchId!,
                    status: 'ISSUED',
                },
            });

            // Update product stock
            await tx.inventoryProduct.update({
                where: { id: dto.productId },
                data: { stock: { decrement: dto.quantity } },
            });

            return issue;
        });
    }

    getIssues(branchId: string | null) {
        return this.prisma.inventoryIssue.findMany({
            where: { ...(branchId && { branchId }) },
            include: { product: true, staff: { include: { user: true } }, student: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    getPurchases(branchId: string | null) {
        return this.prisma.inventoryPurchase.findMany({
            where: { ...(branchId && { branchId }) },
            include: { product: true, supplier: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    // UPDATES & DELETES
    updateCategory(id: string, dto: UpdateInventoryCategoryDto) {
        return this.prisma.inventoryCategory.update({ where: { id }, data: dto });
    }

    deleteCategory(id: string) {
        return this.prisma.inventoryCategory.delete({ where: { id } });
    }

    updateStore(id: string, dto: UpdateInventoryStoreDto) {
        return this.prisma.inventoryStore.update({ where: { id }, data: dto });
    }

    deleteStore(id: string) {
        return this.prisma.inventoryStore.delete({ where: { id } });
    }

    updateSupplier(id: string, dto: UpdateInventorySupplierDto) {
        return this.prisma.inventorySupplier.update({ where: { id }, data: dto });
    }

    deleteSupplier(id: string) {
        return this.prisma.inventorySupplier.delete({ where: { id } });
    }

    updateUnit(id: string, dto: UpdateInventoryUnitDto) {
        return this.prisma.inventoryUnit.update({ where: { id }, data: dto });
    }

    deleteUnit(id: string) {
        return this.prisma.inventoryUnit.delete({ where: { id } });
    }

    updateProduct(id: string, dto: UpdateInventoryProductDto) {
        return this.prisma.inventoryProduct.update({ where: { id }, data: dto });
    }

    deleteProduct(id: string) {
        return this.prisma.inventoryProduct.delete({ where: { id } });
    }

    // Sales
    async createSale(dto: CreateInventorySaleDto) {
        return this.prisma.$transaction(async (tx) => {
            const product = await tx.inventoryProduct.findUnique({ where: { id: dto.productId } });
            if (!product || product.stock < dto.quantity) {
                throw new BadRequestException('Insufficient stock');
            }

            const sale = await tx.inventorySale.create({
                data: {
                    ...dto,
                    branchId: dto.branchId!,
                    totalPrice: dto.quantity * dto.unitPrice
                }
            });

            await tx.inventoryProduct.update({
                where: { id: dto.productId },
                data: { stock: { decrement: dto.quantity } }
            });

            return sale;
        });
    }

    getSales(branchId: string | null) {
        return this.prisma.inventorySale.findMany({
            where: { ...(branchId && { branchId }) },
            include: { product: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Returns
    async returnItem(issueId: string) {
        return this.prisma.$transaction(async (tx) => {
            const issue = await tx.inventoryIssue.findUnique({
                where: { id: issueId }
            });

            if (!issue || issue.status === 'RETURNED') {
                throw new BadRequestException('Issue not found or already returned');
            }

            const updatedIssue = await tx.inventoryIssue.update({
                where: { id: issueId },
                data: {
                    status: 'RETURNED',
                    returnDate: new Date()
                }
            });

            await tx.inventoryProduct.update({
                where: { id: issue.productId },
                data: { stock: { increment: issue.quantity } }
            });

            return updatedIssue;
        });
    }
}
