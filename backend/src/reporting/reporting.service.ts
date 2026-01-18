import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { Readable } from 'stream';

@Injectable()
export class ReportingService {
    constructor(private prisma: PrismaService) { }

    async getFinancialSummary(branchId: string, startDate?: Date, endDate?: Date) {
        const where = {
            branchId,
            ...(startDate || endDate ? {
                createdAt: {
                    ...(startDate ? { gte: startDate } : {}),
                    ...(endDate ? { lte: endDate } : {}),
                }
            } : {})
        };

        const [totalInvoiced, totalPaid, totalExpenses] = await Promise.all([
            this.prisma.invoice.aggregate({
                where,
                _sum: { totalAmount: true }
            }),
            this.prisma.payment.aggregate({
                where: { ...where, status: 'COMPLETED' },
                _sum: { amount: true }
            }),
            this.prisma.voucher.aggregate({
                where: { ...where, status: 'APPROVED' },
                _sum: { amount: true }
            })
        ]);

        return {
            totalInvoiced: totalInvoiced._sum.totalAmount || 0,
            totalPaid: totalPaid._sum.amount || 0,
            totalExpenses: totalExpenses._sum.amount || 0,
            netProfit: (totalPaid._sum.amount || 0) - (totalExpenses._sum.amount || 0)
        };
    }

    async getAcademicPerformance(branchId: string) {
        const totalStudents = await this.prisma.student.count({ where: { branchId } });
        const recentExams = await this.prisma.onlineExam.findMany({
            where: { branchId, status: 'ENDED' },
            include: {
                attempts: true
            },
            take: 5,
            orderBy: { scheduledDate: 'desc' }
        });

        // Simple average grade calculation for recent exams
        const examStats = recentExams.map(exam => {
            const avgScore = exam.attempts.length > 0
                ? exam.attempts.reduce((acc, att) => acc + (att.score || 0), 0) / exam.attempts.length
                : 0;
            return {
                title: exam.title,
                avgScore,
                totalParticipants: exam.attempts.length
            };
        });

        return {
            totalStudents,
            recentExamStats: examStats
        };
    }

    async getInventoryStats(branchId: string) {
        const [totalProducts, lowStockItems, totalValue] = await Promise.all([
            this.prisma.inventoryProduct.count({ where: { branchId } }),
            this.prisma.inventoryProduct.count({
                where: { branchId, stock: { lte: 10 } }
            }),
            this.prisma.inventoryProduct.aggregate({
                where: { branchId },
                _sum: { stock: true }
            })
        ]);

        return {
            totalProducts,
            lowStockItems,
            totalUnits: totalValue._sum.stock || 0
        };
    }

    async getHRStats(branchId: string) {
        const [totalStaff, staffByRole] = await Promise.all([
            this.prisma.staff.count({ where: { user: { branchId } } }),
            this.prisma.user.groupBy({
                by: ['role'],
                where: { branchId, role: { notIn: ['STUDENT', 'PARENT'] } },
                _count: { _all: true }
            })
        ]);

        return {
            totalStaff,
            roleDistribution: staffByRole.map(group => ({
                role: group.role,
                count: group._count._all
            }))
        };
    }

    async getUnifiedDashboard(branchId: string) {
        const [finance, academic, inventory, hr] = await Promise.all([
            this.getFinancialSummary(branchId),
            this.getAcademicPerformance(branchId),
            this.getInventoryStats(branchId),
            this.getHRStats(branchId)
        ]);

        return {
            finance,
            academic,
            inventory,
            hr
        };
    }

    // PDF Export Methods
    async exportStudentPerformancePDF(branchId: string): Promise<Buffer> {
        const data = await this.getAcademicPerformance(branchId);
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));

        return new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(20).text('Student Performance Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Total Students: ${data.totalStudents}`);
            doc.moveDown();

            // Recent Exam Stats
            doc.fontSize(16).text('Recent Exam Statistics');
            doc.moveDown();

            data.recentExamStats.forEach((exam, idx) => {
                doc.fontSize(12)
                    .text(`${idx + 1}. ${exam.title}`)
                    .text(`   Average Score: ${exam.avgScore.toFixed(2)}%`)
                    .text(`   Participants: ${exam.totalParticipants}`)
                    .moveDown();
            });

            doc.end();
        });
    }

    async exportFeesPDF(branchId: string, startDate?: Date, endDate?: Date): Promise<Buffer> {
        const data = await this.getFinancialSummary(branchId, startDate, endDate);
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));

        return new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            doc.fontSize(20).text('Financial Summary Report', { align: 'center' });
            doc.moveDown();

            const dateRange = startDate && endDate
                ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                : 'All Time';
            doc.fontSize(10).text(`Period: ${dateRange}`, { align: 'center' });
            doc.moveDown(2);

            doc.fontSize(14)
                .text(`Total Invoiced: $${data.totalInvoiced.toFixed(2)}`)
                .text(`Total Paid: $${data.totalPaid.toFixed(2)}`)
                .text(`Total Expenses: $${data.totalExpenses.toFixed(2)}`)
                .moveDown()
                .fontSize(16)
                .text(`Net Profit: $${data.netProfit.toFixed(2)}`, {
                    underline: true,
                    color: data.netProfit >= 0 ? 'green' : 'red'
                });

            doc.end();
        });
    }

    async exportHRPDF(branchId: string): Promise<Buffer> {
        const data = await this.getHRStats(branchId);
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));

        return new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            doc.fontSize(20).text('HR Statistics Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(14).text(`Total Staff: ${data.totalStaff}`);
            doc.moveDown();

            doc.fontSize(16).text('Role Distribution');
            doc.moveDown();

            data.roleDistribution.forEach(role => {
                doc.fontSize(12)
                    .text(`${role.role}: ${role.count}`)
                    .moveDown(0.5);
            });

            doc.end();
        });
    }

    async exportInventoryPDF(branchId: string): Promise<Buffer> {
        const data = await this.getInventoryStats(branchId);
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));

        return new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            doc.fontSize(20).text('Inventory Statistics Report', { align: 'center' });
            doc.moveDown();

            doc.fontSize(14)
                .text(`Total Products: ${data.totalProducts}`)
                .text(`Low Stock Items: ${data.lowStockItems}`, {
                    color: data.lowStockItems > 0 ? 'red' : 'black'
                })
                .text(`Total Units: ${data.totalUnits}`);

            doc.end();
        });
    }

    // Excel Export Methods
    async exportStudentPerformanceExcel(branchId: string): Promise<ExcelJS.Buffer> {
        const data = await this.getAcademicPerformance(branchId);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Student Performance');

        // Header
        worksheet.addRow(['Student Performance Report']);
        worksheet.addRow([`Total Students: ${data.totalStudents}`]);
        worksheet.addRow([]);

        // Exam Stats
        worksheet.addRow(['Exam Title', 'Average Score', 'Total Participants']);
        data.recentExamStats.forEach(exam => {
            worksheet.addRow([exam.title, exam.avgScore.toFixed(2), exam.totalParticipants]);
        });

        // Styling
        worksheet.getRow(1).font = { bold: true, size: 16 };
        worksheet.getRow(4).font = { bold: true };
        worksheet.columns = [
            { width: 40 },
            { width: 20 },
            { width: 20 }
        ];

        return await workbook.xlsx.writeBuffer();
    }

    async exportFeesExcel(branchId: string, startDate?: Date, endDate?: Date): Promise<ExcelJS.Buffer> {
        const data = await this.getFinancialSummary(branchId, startDate, endDate);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Financial Summary');

        worksheet.addRow(['Financial Summary Report']);
        const dateRange = startDate && endDate
            ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            : 'All Time';
        worksheet.addRow([`Period: ${dateRange}`]);
        worksheet.addRow([]);

        worksheet.addRow(['Metric', 'Amount']);
        worksheet.addRow(['Total Invoiced', data.totalInvoiced]);
        worksheet.addRow(['Total Paid', data.totalPaid]);
        worksheet.addRow(['Total Expenses', data.totalExpenses]);
        worksheet.addRow(['Net Profit', data.netProfit]);

        worksheet.getRow(1).font = { bold: true, size: 16 };
        worksheet.getRow(4).font = { bold: true };
        worksheet.columns = [{ width: 20 }, { width: 20 }];

        return await workbook.xlsx.writeBuffer();
    }

    async exportHRExcel(branchId: string): Promise<ExcelJS.Buffer> {
        const data = await this.getHRStats(branchId);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('HR Statistics');

        worksheet.addRow(['HR Statistics Report']);
        worksheet.addRow([`Total Staff: ${data.totalStaff}`]);
        worksheet.addRow([]);

        worksheet.addRow(['Role', 'Count']);
        data.roleDistribution.forEach(role => {
            worksheet.addRow([role.role, role.count]);
        });

        worksheet.getRow(1).font = { bold: true, size: 16 };
        worksheet.getRow(4).font = { bold: true };
        worksheet.columns = [{ width: 30 }, { width: 15 }];

        return await workbook.xlsx.writeBuffer();
    }

    async exportInventoryExcel(branchId: string): Promise<ExcelJS.Buffer> {
        const data = await this.getInventoryStats(branchId);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventory Statistics');

        worksheet.addRow(['Inventory Statistics Report']);
        worksheet.addRow([]);

        worksheet.addRow(['Metric', 'Value']);
        worksheet.addRow(['Total Products', data.totalProducts]);
        worksheet.addRow(['Low Stock Items', data.lowStockItems]);
        worksheet.addRow(['Total Units', data.totalUnits]);

        worksheet.getRow(1).font = { bold: true, size: 16 };
        worksheet.getRow(3).font = { bold: true };
        worksheet.columns = [{ width: 25 }, { width: 15 }];

        return await workbook.xlsx.writeBuffer();
    }

    // Template filling method for exam reports
    async fillTemplate(template: string, data: any): Promise<string> {
        let html = template;

        // Replace all placeholders in the template with actual data
        // Supports nested object access like {{student.name}}
        const replacePlaceholders = (str: string, obj: any): string => {
            return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
                const value = path.split('.').reduce((acc: any, part: string) => {
                    return acc && acc[part] !== undefined ? acc[part] : '';
                }, obj);

                // Handle arrays by joining with commas
                if (Array.isArray(value)) {
                    return value.join(', ');
                }

                // Handle objects by stringifying
                if (typeof value === 'object' && value !== null) {
                    return JSON.stringify(value);
                }

                return value !== undefined && value !== null ? String(value) : '';
            });
        };

        html = replacePlaceholders(html, data);

        return html;
    }

    // Generate PDF from HTML string
    async generatePdf(html: string): Promise<Buffer> {
        // For now, we'll use pdfkit to generate a simple PDF
        // In production, you might want to use puppeteer or similar for HTML to PDF
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));

        return new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Simple HTML parsing - in production use a proper HTML to PDF library
            // This is a basic implementation that strips HTML tags
            const text = html.replace(/<[^>]*>/g, '\n').replace(/\n\n+/g, '\n\n');

            doc.fontSize(12).text(text, {
                width: 500,
                align: 'left'
            });

            doc.end();
        });
    }

    // Generate Excel from headers and rows
    async generateExcel(headers: string[], rows: any[][]): Promise<ExcelJS.Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Add headers
        worksheet.addRow(headers);

        // Style headers
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // Add data rows
        rows.forEach(row => {
            worksheet.addRow(row);
        });

        // Auto-fit columns
        worksheet.columns.forEach((column, index) => {
            let maxLength = headers[index]?.length || 10;
            rows.forEach(row => {
                const cellValue = row[index];
                if (cellValue) {
                    const cellLength = String(cellValue).length;
                    if (cellLength > maxLength) {
                        maxLength = cellLength;
                    }
                }
            });
            column.width = Math.min(maxLength + 2, 50);
        });

        return await workbook.xlsx.writeBuffer();
    }
}
