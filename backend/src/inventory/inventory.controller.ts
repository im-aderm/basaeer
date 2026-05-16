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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  private resolveBranch(
    ctx: TenantContext,
    queryBranchId?: string,
  ): string | null {
    return ctx.isSuperAdmin ? queryBranchId || null : ctx.branchId || null;
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateInventoryCategoryDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Category' })
  @Post('categories')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createCategory(
    @Body() dto: CreateInventoryCategoryDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    if (!dto.branchId && ctx.branchId) dto.branchId = ctx.branchId;
    return this.inventoryService.createCategory(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Categories' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @Get('categories')
  getCategories(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getCategories(
      this.resolveBranch(ctx, branchId),
    );
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateInventoryCategoryDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Update Category' })
  @Post('categories/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryCategoryDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.inventoryService.updateCategory(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Category' })
  @Delete('categories/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteCategory(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.inventoryService.deleteCategory(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateInventoryStoreDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Store' })
  @Post('stores')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createStore(
    @Body() dto: CreateInventoryStoreDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    if (!dto.branchId && ctx.branchId) dto.branchId = ctx.branchId;
    return this.inventoryService.createStore(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Stores' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @Get('stores')
  getStores(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getStores(this.resolveBranch(ctx, branchId));
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateInventoryStoreDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Update Store' })
  @Post('stores/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateStore(@Param('id') id: string, @Body() dto: UpdateInventoryStoreDto, @GetTenantContext() ctx: TenantContext) {
    return this.inventoryService.updateStore(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Store' })
  @Delete('stores/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteStore(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.inventoryService.deleteStore(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateInventorySupplierDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Supplier' })
  @Post('suppliers')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createSupplier(
    @Body() dto: CreateInventorySupplierDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    if (!dto.branchId && ctx.branchId) dto.branchId = ctx.branchId;
    return this.inventoryService.createSupplier(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Suppliers' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @Get('suppliers')
  getSuppliers(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getSuppliers(
      this.resolveBranch(ctx, branchId),
    );
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateInventorySupplierDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Update Supplier' })
  @Post('suppliers/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateSupplier(
    @Param('id') id: string,
    @Body() dto: UpdateInventorySupplierDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.inventoryService.updateSupplier(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Supplier' })
  @Delete('suppliers/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteSupplier(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.inventoryService.deleteSupplier(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateInventoryUnitDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Unit' })
  @Post('units')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createUnit(
    @Body() dto: CreateInventoryUnitDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    if (!dto.branchId && ctx.branchId) dto.branchId = ctx.branchId;
    return this.inventoryService.createUnit(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Units' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @Get('units')
  getUnits(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getUnits(this.resolveBranch(ctx, branchId));
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateInventoryUnitDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Update Unit' })
  @Post('units/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateUnit(@Param('id') id: string, @Body() dto: UpdateInventoryUnitDto, @GetTenantContext() ctx: TenantContext) {
    return this.inventoryService.updateUnit(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Unit' })
  @Delete('units/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteUnit(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.inventoryService.deleteUnit(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateInventoryProductDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Product' })
  @Post('products')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createProduct(
    @Body() dto: CreateInventoryProductDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    if (!dto.branchId && ctx.branchId) dto.branchId = ctx.branchId;
    return this.inventoryService.createProduct(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Products' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @Get('products')
  getProducts(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getProducts(this.resolveBranch(ctx, branchId));
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateInventoryProductDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Update Product' })
  @Post('products/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryProductDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.inventoryService.updateProduct(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Product' })
  @Delete('products/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteProduct(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.inventoryService.deleteProduct(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateInventoryPurchaseDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Purchase' })
  @Post('purchases')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createPurchase(@Body() dto: CreateInventoryPurchaseDto) {
    return this.inventoryService.createPurchase(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Purchases' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @Get('purchases')
  getPurchases(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getPurchases(
      this.resolveBranch(ctx, branchId),
    );
  }

  @ApiBearerAuth()
  @ApiBody({ type: IssueItemDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Issue Item' })
  @Post('issues')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  issueItem(@Body() dto: IssueItemDto) {
    return this.inventoryService.issueItem(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Issues' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @Get('issues')
  getIssues(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getIssues(this.resolveBranch(ctx, branchId));
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Issue returned successfully' })
  @ApiOperation({ summary: 'Return Issued Item' })
  @Post('issues/:id/return')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  returnItem(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.inventoryService.returnItem(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateInventorySaleDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Sale' })
  @Post('sales')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createSale(@Body() dto: CreateInventorySaleDto) {
    return this.inventoryService.createSale(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Sales' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @Get('sales')
  getSales(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
  ) {
    return this.inventoryService.getSales(this.resolveBranch(ctx, branchId));
  }
}
