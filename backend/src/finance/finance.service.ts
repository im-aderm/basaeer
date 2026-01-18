import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeeCategoryDto } from './dto/create-fee-category.dto';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateExpenseCategoryDto, CreateVoucherDto } from './dto/voucher.dto';
import { PaymentStatus, InvoiceStatus, PaymentMethod } from '../generated/client/client';

@Injectable()
export class FinanceService {
    constructor(private prisma: PrismaService) { }

    async createFeeCategory(dto: CreateFeeCategoryDto) {
        return this.prisma.feeCategory.create({ data: dto });
    }

    async createFeeStructure(dto: CreateFeeStructureDto) {
        return this.prisma.feeStructure.create({ data: dto });
    }

    async getFeeCategories(branchId: string) {
        return this.prisma.feeCategory.findMany({ where: { branchId } });
    }

    async getFeeStructures(branchId: string) {
        return this.prisma.feeStructure.findMany({
            where: { branchId },
            include: { category: true, class: true },
        });
    }

    async createInvoice(dto: CreateInvoiceDto) {
        const { studentId, dueDate, branchId, items } = dto;
        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

        return this.prisma.$transaction(async (tx) => {
            // Generate a unique invoice number (simple implementation)
            const count = await tx.invoice.count({ where: { branchId } });
            const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

            const invoice = await tx.invoice.create({
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

            return invoice;
        });
    }

    async recordPayment(dto: RecordPaymentDto) {
        const { invoiceId, amount, method, transactionId, proofUrl, notes } = dto;

        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findUnique({
                where: { id: invoiceId },
            });

            if (!invoice) throw new NotFoundException('Invoice not found');
            if (invoice.balance <= 0) throw new BadRequestException('Invoice is already fully paid');

            // Set payment status based on method
            // Direct Bank Transfer starts as PENDING until verified
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

            // If completed (CASH or FLUTTERWAVE), update invoice balance
            if (status === PaymentStatus.COMPLETED) {
                await this.updateInvoiceBalanceRecursive(tx, invoiceId, amount);
            }

            return payment;
        });
    }

    private async updateInvoiceBalanceRecursive(tx: any, invoiceId: string, amountPaid: number) {
        const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
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

    async verifyPayment(paymentId: string, isApproved: boolean) {
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { id: paymentId },
                include: { invoice: true },
            });

            if (!payment) throw new NotFoundException('Payment not found');
            if (payment.status !== PaymentStatus.PENDING) {
                throw new BadRequestException('Payment is not in pending state');
            }

            if (isApproved) {
                await tx.payment.update({
                    where: { id: paymentId },
                    data: { status: PaymentStatus.COMPLETED },
                });

                await this.updateInvoiceBalanceRecursive(tx, payment.invoiceId, payment.amount);
            } else {
                await tx.payment.update({
                    where: { id: paymentId },
                    data: { status: PaymentStatus.REJECTED },
                });
            }

            return { message: isApproved ? 'Payment approved' : 'Payment rejected' };
        });
    }

    async getStudentInvoices(studentId: string) {
        return this.prisma.invoice.findMany({
            where: { studentId },
            include: { items: true, payments: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getBranchFinancials(branchId: string) {
        const invoices = await this.prisma.invoice.findMany({
            where: { branchId },
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

    // Voucher & Expense Logic

    async createExpenseCategory(dto: CreateExpenseCategoryDto) {
        try {
            return await this.prisma.expenseCategory.create({ data: dto });
        } catch (e) {
            const fs = require('fs');
            fs.appendFileSync('error.log', JSON.stringify(e, null, 2) + '\n' + e.stack + '\n');
            throw e;
        }
    }

    async getExpenseCategories(branchId: string) {
        return this.prisma.expenseCategory.findMany({ where: { branchId } });
    }

    async createVoucher(dto: CreateVoucherDto) {
        // Auto-generate voucher number: VCH-{YYYY}-{Count}
        const count = await this.prisma.voucher.count({ where: { branchId: dto.branchId } });
        const voucherNumber = `VCH-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

        return this.prisma.voucher.create({
            data: {
                ...dto,
                voucherNumber,
                status: 'PENDING'
            }
        });
    }

    async updateVoucherStatus(id: string, status: string, userId: string) {
        return this.prisma.voucher.update({
            where: { id },
            data: {
                status,
                approvedByUserId: status === 'APPROVED' ? userId : null
            }
        });
    }

    async getVouchers(branchId: string) {
        return this.prisma.voucher.findMany({
            where: { branchId },
            include: { category: true, approvedBy: true },
            orderBy: { date: 'desc' }
        });
    }
}
