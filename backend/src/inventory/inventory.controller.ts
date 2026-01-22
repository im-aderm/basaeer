import { Controller, Get, Post, Body, Query, UseGuards, Param, Delete, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Post('categories')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    createCategory(@Request() req, @Body() dto: CreateInventoryCategoryDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.inventoryService.createCategory(dto);
    }

    @Get('categories')
    getCategories(@Request() req, @Query('branchId') branchId: string) {
        const effectiveBranchId = req.user.role === UserRole.SUPER_ADMIN ? branchId : req.user.branchId;
        return this.inventoryService.getCategories(effectiveBranchId);
    }

    @Post('categories/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    updateCategory(@Param('id') id: string, @Body() dto: UpdateInventoryCategoryDto) {
        return this.inventoryService.updateCategory(id, dto);
    }

    @Delete('categories/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    deleteCategory(@Param('id') id: string) {
        return this.inventoryService.deleteCategory(id);
    }

    @Post('stores')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    createStore(@Request() req, @Body() dto: CreateInventoryStoreDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.inventoryService.createStore(dto);
    }

    @Get('stores')
    getStores(@Request() req, @Query('branchId') branchId: string) {
        const effectiveBranchId = req.user.role === UserRole.SUPER_ADMIN ? branchId : req.user.branchId;
        return this.inventoryService.getStores(effectiveBranchId);
    }

    @Post('stores/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    updateStore(@Param('id') id: string, @Body() dto: UpdateInventoryStoreDto) {
        return this.inventoryService.updateStore(id, dto);
    }

    @Delete('stores/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    deleteStore(@Param('id') id: string) {
        return this.inventoryService.deleteStore(id);
    }

    @Post('suppliers')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    createSupplier(@Request() req, @Body() dto: CreateInventorySupplierDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.inventoryService.createSupplier(dto);
    }

    @Get('suppliers')
    getSuppliers(@Request() req, @Query('branchId') branchId: string) {
        const effectiveBranchId = req.user.role === UserRole.SUPER_ADMIN ? branchId : req.user.branchId;
        return this.inventoryService.getSuppliers(effectiveBranchId);
    }

    @Post('suppliers/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    updateSupplier(@Param('id') id: string, @Body() dto: UpdateInventorySupplierDto) {
        return this.inventoryService.updateSupplier(id, dto);
    }

    @Delete('suppliers/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    deleteSupplier(@Param('id') id: string) {
        return this.inventoryService.deleteSupplier(id);
    }

    @Post('units')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    createUnit(@Request() req, @Body() dto: CreateInventoryUnitDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.inventoryService.createUnit(dto);
    }

    @Get('units')
    getUnits(@Request() req, @Query('branchId') branchId: string) {
        const effectiveBranchId = req.user.role === UserRole.SUPER_ADMIN ? branchId : req.user.branchId;
        return this.inventoryService.getUnits(effectiveBranchId);
    }

    @Post('units/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    updateUnit(@Param('id') id: string, @Body() dto: UpdateInventoryUnitDto) {
        return this.inventoryService.updateUnit(id, dto);
    }

    @Delete('units/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    deleteUnit(@Param('id') id: string) {
        return this.inventoryService.deleteUnit(id);
    }

    @Post('products')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    createProduct(@Request() req, @Body() dto: CreateInventoryProductDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.inventoryService.createProduct(dto);
    }

    @Get('products')
    getProducts(@Request() req, @Query('branchId') branchId: string) {
        const effectiveBranchId = req.user.role === UserRole.SUPER_ADMIN ? branchId : req.user.branchId;
        return this.inventoryService.getProducts(effectiveBranchId);
    }

    @Post('products/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    updateProduct(@Param('id') id: string, @Body() dto: UpdateInventoryProductDto) {
        return this.inventoryService.updateProduct(id, dto);
    }

    @Delete('products/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    deleteProduct(@Param('id') id: string) {
        return this.inventoryService.deleteProduct(id);
    }

    @Post('purchases')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    createPurchase(@Request() req, @Body() dto: CreateInventoryPurchaseDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.inventoryService.createPurchase(dto);
    }

    @Get('purchases')
    getPurchases(@Request() req, @Query('branchId') branchId: string) {
        const effectiveBranchId = req.user.role === UserRole.SUPER_ADMIN ? branchId : req.user.branchId;
        return this.inventoryService.getPurchases(effectiveBranchId);
    }

    @Post('sales')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
    createSale(@Request() req, @Body() dto: CreateInventorySaleDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.inventoryService.createSale(dto);
    }

    @Get('sales')
    getSales(@Request() req, @Query('branchId') branchId: string) {
        const effectiveBranchId = req.user.role === UserRole.SUPER_ADMIN ? branchId : req.user.branchId;
        return this.inventoryService.getSales(effectiveBranchId);
    }

    @Post('issue')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    issueItem(@Request() req, @Body() dto: IssueItemDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.inventoryService.issueItem(dto);
    }

    @Get('issues')
    getIssues(@Request() req, @Query('branchId') branchId: string) {
        const effectiveBranchId = req.user.role === UserRole.SUPER_ADMIN ? branchId : req.user.branchId;
        return this.inventoryService.getIssues(effectiveBranchId);
    }

    @Post('issue/return/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    returnItem(@Param('id') id: string) {
        return this.inventoryService.returnItem(id);
    }
}
