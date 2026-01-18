import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFeeCategoryDto } from './dto/create-fee-category.dto';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    @Post('fee-categories')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    createCategory(@Request() req, @Body() dto: CreateFeeCategoryDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.financeService.createFeeCategory(dto);
    }

    @Get('fee-categories')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    getCategories(@Request() req) {
        return this.financeService.getFeeCategories(req.user.branchId);
    }

    @Post('fee-structures')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    createStructure(@Request() req, @Body() dto: CreateFeeStructureDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.financeService.createFeeStructure(dto);
    }

    @Get('fee-structures')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    getStructures(@Request() req) {
        return this.financeService.getFeeStructures(req.user.branchId);
    }

    @Post('invoices')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    createInvoice(@Request() req, @Body() dto: CreateInvoiceDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.financeService.createInvoice(dto);
    }

    @Post('payments')
    @Roles(UserRole.STUDENT, UserRole.PARENT, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    recordPayment(@Request() req, @Body() dto: RecordPaymentDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.financeService.recordPayment(dto);
    }

    @Patch('payments/:id/verify')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    verifyPayment(@Param('id') id: string, @Body('isApproved') isApproved: boolean) {
        return this.financeService.verifyPayment(id, isApproved);
    }

    @Get('invoices/student/:studentId')
    @Roles(UserRole.STUDENT, UserRole.PARENT, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    getStudentInvoices(@Param('studentId') studentId: string) {
        return this.financeService.getStudentInvoices(studentId);
    }

    @Get('stats')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    getStats(@Request() req) {
        return this.financeService.getBranchFinancials(req.user.branchId);
    }

    // Voucher Endpoints

    @Post('expense-categories')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    createExpenseCategory(@Request() req, @Body() dto: any) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.financeService.createExpenseCategory(dto);
    }

    @Get('expense-categories')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    getExpenseCategories(@Request() req) {
        return this.financeService.getExpenseCategories(req.user.branchId);
    }

    @Post('vouchers')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    createVoucher(@Body() dto: any, @Request() req) {
        return this.financeService.createVoucher({ ...dto, branchId: req.user.branchId });
    }

    @Patch('vouchers/:id/status')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    updateVoucherStatus(@Param('id') id: string, @Body('status') status: string, @Request() req) {
        return this.financeService.updateVoucherStatus(id, status, req.user.id);
    }

    @Get('vouchers')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN)
    getVouchers(@Request() req) {
        return this.financeService.getVouchers(req.user.branchId);
    }
}
