import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFeeCategoryDto } from './dto/create-fee-category.dto';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { CreateVoucherDto, CreateExpenseCategoryDto } from './dto/voucher.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { UserRole, VoucherStatus } from '../generated/client/client';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
@ApiTags('Finance')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateFeeCategoryDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Category' })
  @Post('fee-categories')
  @Permissions('finance:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
  createCategory(
    @Body() dto: CreateFeeCategoryDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.financeService.createFeeCategory(dto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Categories' })
  @Get('fee-categories')
  @Permissions('finance:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
  getCategories(@GetTenantContext() context: TenantContext) {
    return this.financeService.getFeeCategories(context);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateFeeStructureDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Structure' })
  @Post('fee-structures')
  @Permissions('finance:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
  createStructure(
    @Body() dto: CreateFeeStructureDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.financeService.createFeeStructure(dto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Structures' })
  @Get('fee-structures')
  @Permissions('finance:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
  getStructures(@GetTenantContext() context: TenantContext) {
    return this.financeService.getFeeStructures(context);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Invoice' })
  @Post('invoices')
  @Permissions('finance:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
  createInvoice(
    @Body() dto: CreateInvoiceDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.financeService.createInvoice(dto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Discount applied' })
  @ApiOperation({ summary: 'Apply a discount to an invoice (percentage or fixed)' })
  @Post('invoices/:id/discount')
  @Permissions('finance:apply-discount')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  applyInvoiceDiscount(
    @Param('id') id: string,
    @Body() dto: ApplyDiscountDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.financeService.applyInvoiceDiscount(id, dto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Invoice voided successfully' })
  @ApiOperation({ summary: 'Void Invoice' })
  @Delete('invoices/:id')
  @Permissions('finance:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
  voidInvoice(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
    @Body('reason') reason?: string,
  ) {
    return this.financeService.voidInvoice(id, context, reason);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Payment' })
  @Post('payments')
  @Permissions('finance:create')
  @Roles(
    UserRole.STUDENT,
    UserRole.PARENT,
    UserRole.ACCOUNTANT,
    UserRole.BRANCH_ADMIN,
  )
  recordPayment(
    @Body() dto: RecordPaymentDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.financeService.recordPayment(dto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Verify Payment' })
  @Patch('payments/:id/verify')
  @Permissions('finance:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
  verifyPayment(
    @Param('id') id: string,
    @Body('isApproved') isApproved: boolean,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.financeService.verifyPayment(id, isApproved, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Student Invoices' })
  @Get('invoices/student/:studentId')
  @Permissions('finance:read')
  @Roles(
    UserRole.STUDENT,
    UserRole.PARENT,
    UserRole.ACCOUNTANT,
    UserRole.BRANCH_ADMIN,
  )
  getStudentInvoices(
    @Param('studentId') studentId: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.financeService.getStudentInvoices(studentId, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Stats' })
  @Get('stats')
  @Permissions('finance:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
  getStats(@GetTenantContext() context: TenantContext) {
    return this.financeService.getBranchFinancials(context);
  }

  // Voucher Endpoints

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Expense Category' })
  @Post('expense-categories')
  @Permissions('finance:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
  createExpenseCategory(
    @Body() dto: CreateExpenseCategoryDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.financeService.createExpenseCategory(dto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Expense Categories' })
  @Get('expense-categories')
  @Permissions('finance:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
  getExpenseCategories(@GetTenantContext() context: TenantContext) {
    return this.financeService.getExpenseCategories(context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Voucher' })
  @Post('vouchers')
  @Permissions('finance:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
  createVoucher(@Body() dto: CreateVoucherDto, @GetTenantContext() context: TenantContext) {
    return this.financeService.createVoucher(dto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Voucher Status' })
  @Patch('vouchers/:id/status')
  @Permissions('finance:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateVoucherStatus(
    @Param('id') id: string,
    @Body('status') status: VoucherStatus,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.financeService.updateVoucherStatus(id, status, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Vouchers' })
  @Get('vouchers')
  @Permissions('finance:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
  getVouchers(
    @GetTenantContext() context: TenantContext,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.financeService.getVouchers(context, skipNum, takeNum);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Cashflow' })
  @Get('cashflow')
  @Permissions('finance:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
  getCashflow(
    @GetTenantContext() context: TenantContext,
    @Query('months') months?: string,
  ) {
    return this.financeService.getCashflow(
      context,
      months ? parseInt(months, 10) : 6,
    );
  }
}
