import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
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
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  private resolveBranch(
    ctx: TenantContext,
    queryBranchId?: string,
  ): string | null {
    return ctx.isSuperAdmin ? queryBranchId || null : ctx.branchId || null;
  }

  @Post('categories')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createCategory(
    @Body() dto: CreateInventoryCategoryDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    if (!dto.branchId && ctx.branchId) dto.branchId = ctx.branchId;
    return this.inventoryService.createCategory(dto);
  }

  @Get('categories')
  getCategories(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getCategories(
      this.resolveBranch(ctx, branchId),
    );
  }

  @Post('categories/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryCategoryDto,
  ) {
    return this.inventoryService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteCategory(@Param('id') id: string) {
    return this.inventoryService.deleteCategory(id);
  }

  @Post('stores')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createStore(
    @Body() dto: CreateInventoryStoreDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    if (!dto.branchId && ctx.branchId) dto.branchId = ctx.branchId;
    return this.inventoryService.createStore(dto);
  }

  @Get('stores')
  getStores(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getStores(this.resolveBranch(ctx, branchId));
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
  createSupplier(
    @Body() dto: CreateInventorySupplierDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    if (!dto.branchId && ctx.branchId) dto.branchId = ctx.branchId;
    return this.inventoryService.createSupplier(dto);
  }

  @Get('suppliers')
  getSuppliers(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getSuppliers(
      this.resolveBranch(ctx, branchId),
    );
  }

  @Post('suppliers/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateSupplier(
    @Param('id') id: string,
    @Body() dto: UpdateInventorySupplierDto,
  ) {
    return this.inventoryService.updateSupplier(id, dto);
  }

  @Delete('suppliers/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteSupplier(@Param('id') id: string) {
    return this.inventoryService.deleteSupplier(id);
  }

  @Post('units')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createUnit(
    @Body() dto: CreateInventoryUnitDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    if (!dto.branchId && ctx.branchId) dto.branchId = ctx.branchId;
    return this.inventoryService.createUnit(dto);
  }

  @Get('units')
  getUnits(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getUnits(this.resolveBranch(ctx, branchId));
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
  createProduct(
    @Body() dto: CreateInventoryProductDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    if (!dto.branchId && ctx.branchId) dto.branchId = ctx.branchId;
    return this.inventoryService.createProduct(dto);
  }

  @Get('products')
  getProducts(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getProducts(this.resolveBranch(ctx, branchId));
  }

  @Post('products/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryProductDto,
  ) {
    return this.inventoryService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteProduct(@Param('id') id: string) {
    return this.inventoryService.deleteProduct(id);
  }

  @Post('purchases')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createPurchase(@Body() dto: CreateInventoryPurchaseDto) {
    return this.inventoryService.createPurchase(dto);
  }

  @Get('purchases')
  getPurchases(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getPurchases(
      this.resolveBranch(ctx, branchId),
    );
  }

  @Post('issues')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  issueItem(@Body() dto: IssueItemDto) {
    return this.inventoryService.issueItem(dto);
  }

  @Post('sales')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createSale(@Body() dto: CreateInventorySaleDto) {
    return this.inventoryService.createSale(dto);
  }

  @Get('sales')
  getSales(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getSales(this.resolveBranch(ctx, branchId));
  }
}
