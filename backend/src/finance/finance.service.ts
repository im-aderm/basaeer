import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeeCategoryDto } from './dto/create-fee-category.dto';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateExpenseCategoryDto, CreateVoucherDto } from './dto/voucher.dto';
import { PaymentStatus, InvoiceStatus, PaymentMethod } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class FinanceService {
    constructor(private prisma: PrismaService) { }

    async createFeeCategory(dto: CreateFeeCategoryDto, context: TenantContext) {
        const branchId = dto.branchId || context.branchId;
        if (!branchId) throw new ForbiddenException('Branch context required');
        return this.prisma.feeCategory.create({ data: { ...dto, branchId } });
    }

    async createFeeStructure(dto: CreateFeeStructureDto, context: TenantContext) {
        const branchId = dto.branchId || context.branchId;
        if (!branchId) throw new ForbiddenException('Branch context required');
        return this.prisma.feeStructure.create({ data: { ...dto, branchId } });
    }

    async getFeeCategories(context: TenantContext) {
        return this.prisma.feeCategory.findMany({ where: TenantHelper.applyIsolation({}, context) });
    }

    async getFeeStructures(context: TenantContext) {
        return this.prisma.feeStructure.findMany({
            where: TenantHelper.applyIsolation({}, context),
            include: { category: true, class: true },
        });
    }

    async createInvoice(dto: CreateInvoiceDto, context: TenantContext) {
        const branchId = dto.branchId || context.branchId;
        if (!branchId) throw new ForbiddenException('Branch context required');
        
        const { studentId, dueDate, items } = dto;
        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

        return this.prisma.$transaction(async (tx) => {
            // Verify student ownership
            const student = await tx.student.findFirst({
                where: TenantHelper.applyIsolation({ id: studentId }, context)
            });
            if (!student) throw new ForbiddenException('Student not found in your branch');

            const count = await tx.invoice.count({ where: { branchId } });
            const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

            return tx.invoice.create({
                data: {
                    invoiceNumber,
                    studentId,
                    dueDate: new Date(dueDate),
                    totalAmount,
                    balance: totalAmount,
                    branchId,
                    status: InvoiceStatus.UNPAID,
                    items: {
                        create: items.map(item => ({
                            amount: item.amount,
                            categoryId: item.categoryId,
                        })),
                    },
                },
                include: { items: true },
            });
        });
    }

    async recordPayment(dto: RecordPaymentDto, context: TenantContext) {
        const { invoiceId, amount, method, transactionId, proofUrl, notes } = dto;

        return this.prisma.$transaction(async (tx) => {
            // Verify invoice ownership
            const invoice = await tx.invoice.findFirst({
                where: TenantHelper.applyIsolation({ id: invoiceId }, context)
            });

            if (!invoice) throw new NotFoundException('Invoice not found or access denied');
            if (invoice.balance <= 0) throw new BadRequestException('Invoice is already fully paid');

            const status = method === PaymentMethod.BANK_TRANSFER
                ? PaymentStatus.PENDING
                : PaymentStatus.COMPLETED;

            const payment = await tx.payment.create({
                data: {
                    invoiceId,
                    amount,
                    method,
                    status,
                    transactionId,
                    proofUrl,
                    notes,
                },
            });

            if (status === PaymentStatus.COMPLETED) {
                await this.updateInvoiceBalance(tx, invoiceId, amount);
            }

            return payment;
        });
    }

    private async updateInvoiceBalance(tx: any, invoiceId: string, amountPaid: number) {
        const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
        if (!invoice) return;

        const newBalance = Math.max(0, invoice.balance - amountPaid);

        let newStatus: InvoiceStatus = InvoiceStatus.PARTIALLY_PAID;
        if (newBalance === 0) {
            newStatus = InvoiceStatus.PAID;
        } else if (newBalance === invoice.totalAmount) {
            newStatus = InvoiceStatus.UNPAID;
        }

        await tx.invoice.update({
            where: { id: invoiceId },
            data: {
                balance: newBalance,
                status: newStatus,
            },
        });
    }

    async verifyPayment(paymentId: string, isApproved: boolean, context: TenantContext) {
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { id: paymentId },
                include: { invoice: true },
            });

            if (!payment) throw new NotFoundException('Payment not found');
            
            // Ownership check through invoice
            if (!context.isSuperAdmin && payment.invoice.branchId !== context.branchId) {
                throw new ForbiddenException('You do not have access to this payment');
            }

            if (payment.status !== PaymentStatus.PENDING) {
                throw new BadRequestException('Payment is not in pending state');
            }

            if (isApproved) {
                await tx.payment.update({
                    where: { id: paymentId },
                    data: { status: PaymentStatus.COMPLETED },
                });

                await this.updateInvoiceBalance(tx, payment.invoiceId, payment.amount);
            } else {
                await tx.payment.update({
                    where: { id: paymentId },
                    data: { status: PaymentStatus.REJECTED },
                });
            }

            return { message: isApproved ? 'Payment approved' : 'Payment rejected' };
        });
    }

    async getStudentInvoices(studentId: string, context: TenantContext) {
        // Ownership check
        const student = await this.prisma.student.findFirst({
            where: TenantHelper.applyIsolation({ id: studentId }, context)
        });
        if (!student) throw new ForbiddenException('Access denied');

        return this.prisma.invoice.findMany({
            where: { studentId },
            include: { items: true, payments: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getBranchFinancials(context: TenantContext) {
        const invoices = await this.prisma.invoice.findMany({
            where: TenantHelper.applyIsolation({}, context),
            select: { totalAmount: true, balance: true },
        });

        const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
        const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balance, 0);
        const totalCollected = totalInvoiced - totalOutstanding;

        return {
            totalInvoiced,
            totalCollected,
            totalOutstanding,
            collectionEfficiency: totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0,
        };
    }

    async createExpenseCategory(dto: CreateExpenseCategoryDto, context: TenantContext) {
        const branchId = dto.branchId || context.branchId;
        if (!branchId) throw new ForbiddenException('Branch context required');
        return this.prisma.expenseCategory.create({ data: { ...dto, branchId } });
    }

    async getExpenseCategories(context: TenantContext) {
        return this.prisma.expenseCategory.findMany({ 
            where: TenantHelper.applyIsolation({}, context) 
        });
    }

    async createVoucher(dto: CreateVoucherDto, context: TenantContext) {
        const branchId = dto.branchId || context.branchId;
        if (!branchId) throw new ForbiddenException('Branch context required');

        const count = await this.prisma.voucher.count({ where: { branchId } });
        const voucherNumber = `VCH-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

        return this.prisma.voucher.create({
            data: {
                ...dto,
                branchId,
                voucherNumber,
                status: 'PENDING'
            }
        });
    }

    async updateVoucherStatus(id: string, status: string, context: TenantContext) {
        const voucher = await this.prisma.voucher.findFirst({
            where: TenantHelper.applyIsolation({ id }, context)
        });
        if (!voucher) throw new NotFoundException('Voucher not found');

        return this.prisma.voucher.update({
            where: { id },
            data: {
                status,
                approvedByUserId: status === 'APPROVED' ? context.userId : null
            }
        });
    }

    async getVouchers(context: TenantContext) {
        return this.prisma.voucher.findMany({
            where: TenantHelper.applyIsolation({}, context),
            include: { category: true, approvedBy: true },
            orderBy: { date: 'desc' }
        });
    }
}
