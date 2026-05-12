import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFeeCategoryDto } from './dto/create-fee-category.dto';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, VoucherStatus } from '../generated/client/client';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('finance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    @Post('fee-categories')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    createCategory(@Body() dto: CreateFeeCategoryDto, @GetTenantContext() context: TenantContext) {
        return this.financeService.createFeeCategory(dto, context);
    }

    @Get('fee-categories')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    getCategories(@GetTenantContext() context: TenantContext) {
        return this.financeService.getFeeCategories(context);
    }

    @Post('fee-structures')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    createStructure(@Body() dto: CreateFeeStructureDto, @GetTenantContext() context: TenantContext) {
        return this.financeService.createFeeStructure(dto, context);
    }

    @Get('fee-structures')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    getStructures(@GetTenantContext() context: TenantContext) {
        return this.financeService.getFeeStructures(context);
    }

    @Post('invoices')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    createInvoice(@Body() dto: CreateInvoiceDto, @GetTenantContext() context: TenantContext) {
        return this.financeService.createInvoice(dto, context);
    }

    @Post('payments')
    @Roles(UserRole.STUDENT, UserRole.PARENT, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    recordPayment(@Body() dto: RecordPaymentDto, @GetTenantContext() context: TenantContext) {
        return this.financeService.recordPayment(dto, context);
    }

    @Patch('payments/:id/verify')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    verifyPayment(@Param('id') id: string, @Body('isApproved') isApproved: boolean, @GetTenantContext() context: TenantContext) {
        return this.financeService.verifyPayment(id, isApproved, context);
    }

    @Get('invoices/student/:studentId')
    @Roles(UserRole.STUDENT, UserRole.PARENT, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    getStudentInvoices(@Param('studentId') studentId: string, @GetTenantContext() context: TenantContext) {
        return this.financeService.getStudentInvoices(studentId, context);
    }

    @Get('stats')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    getStats(@GetTenantContext() context: TenantContext) {
        return this.financeService.getBranchFinancials(context);
    }

    // Voucher Endpoints

    @Post('expense-categories')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    createExpenseCategory(@Body() dto: any, @GetTenantContext() context: TenantContext) {
        return this.financeService.createExpenseCategory(dto, context);
    }

    @Get('expense-categories')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    getExpenseCategories(@GetTenantContext() context: TenantContext) {
        return this.financeService.getExpenseCategories(context);
    }

    @Post('vouchers')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    createVoucher(@Body() dto: any, @GetTenantContext() context: TenantContext) {
        return this.financeService.createVoucher(dto, context);
    }

    @Patch('vouchers/:id/status')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    updateVoucherStatus(@Param('id') id: string, @Body('status') status: VoucherStatus, @GetTenantContext() context: TenantContext) {
        return this.financeService.updateVoucherStatus(id, status, context);
    }

    @Get('vouchers')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    getVouchers(
        @GetTenantContext() context: TenantContext,
        @Query('skip') skip?: string,
        @Query('take') take?: string
    ) {
        const skipNum = skip ? parseInt(skip, 10) : undefined;
        const takeNum = take ? parseInt(take, 10) : undefined;
        return this.financeService.getVouchers(context, skipNum, takeNum);
    }

    @Get('cashflow')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    getCashflow(
        @GetTenantContext() context: TenantContext,
        @Query('months') months?: string,
    ) {
        return this.financeService.getCashflow(context, months ? parseInt(months, 10) : 6);
    }
}
