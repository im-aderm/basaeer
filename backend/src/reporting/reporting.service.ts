import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { StudentReportQueryDto, FinanceReportQueryDto, ReportQueryDto } from './dto/report-query.dto';
import { AnalyticsData, ChartDataItem } from '@basaeer/shared-types';
import { format, startOfMonth, subMonths, endOfMonth, eachMonthOfInterval } from 'date-fns';

@Injectable()
export class ReportingService {
    private readonly logger = new Logger(ReportingService.name);

    constructor(private prisma: PrismaService) { }

    // ── Student Analytics ────────────────────────────────────────────────────

    async getStudentAnalytics(query: StudentReportQueryDto): Promise<AnalyticsData> {
        const branchId = query.branchId;
        const where: any = {
            ...(branchId && { branchId }),
            ...(query.classId && { classId: query.classId }),
            ...(query.sectionId && { sectionId: query.sectionId }),
            ...(query.status && { status: query.status }),
        };

        const [
            totalStudents,
            activeStudents,
            genderDist,
            classDist,
            admissionsTrend
        ] = await Promise.all([
            this.prisma.student.count({ where }),
            this.prisma.student.count({ where: { ...where, status: 'ACTIVE' } }),
            this.prisma.student.groupBy({
                by: ['gender'] as any,
                where,
                _count: { _all: true }
            }) as any,
            this.prisma.student.groupBy({
                by: ['classId'] as any,
                where,
                _count: { _all: true }
            }) as any,
            this.getAdmissionsTrend(branchId)
        ]);

        // Get class names for distribution
        const classIds = classDist.map(c => c.classId).filter(Boolean) as string[];
        const classes = await this.prisma.class.findMany({
            where: { id: { in: classIds } },
            select: { id: true, name: true }
        });
        const classNameMap = new Map(classes.map(c => [c.id, c.name]));

        return {
            summary: [
                { label: 'Total Students', value: totalStudents, icon: 'Users', color: 'blue' },
                { label: 'Active Students', value: activeStudents, icon: 'UserCheck', color: 'green' },
                { label: 'Classes', value: classes.length, icon: 'School', color: 'purple' },
            ],
            charts: {
                gender: genderDist.map(g => ({ name: g.gender || 'Unknown', value: g._count?._all || 0 })),
                classes: classDist.map(c => ({
                    name: classNameMap.get(c.classId!) || 'Unknown',
                    value: c._count?._all || 0
                })),
                admissions: admissionsTrend
            }
        };
    }

    private async getAdmissionsTrend(branchId?: string): Promise<ChartDataItem[]> {
        const last6Months = eachMonthOfInterval({
            start: subMonths(new Date(), 5),
            end: new Date()
        });

        const trend = await Promise.all(last6Months.map(async (date) => {
            const count = await this.prisma.student.count({
                where: {
                    ...(branchId && { branchId }),
                    createdAt: {
                        gte: startOfMonth(date),
                        lte: endOfMonth(date)
                    }
                }
            });
            return {
                name: format(date, 'MMM yy'),
                count
            };
        }));

        return trend;
    }

    // ── Finance Analytics ────────────────────────────────────────────────────

    async getFinanceAnalytics(query: FinanceReportQueryDto): Promise<AnalyticsData> {
        const branchId = query.branchId;
        const startDate = query.startDate ? new Date(query.startDate) : startOfMonth(subMonths(new Date(), 5));
        const endDate = query.endDate ? new Date(query.endDate) : new Date();

        const where: any = {
            ...(branchId && { branchId }),
            createdAt: { gte: startDate, lte: endDate }
        };

        const [
            totalPaid,
            totalExpenses,
            revenueTrend
        ] = await Promise.all([
            this.prisma.payment.aggregate({
                where: { ...where, status: 'COMPLETED' },
                _sum: { amount: true }
            }),
            this.prisma.voucher.aggregate({
                where: { ...where, status: 'APPROVED' },
                _sum: { amount: true }
            }),
            this.getRevenueTrend(branchId)
        ]);

        const paid = totalPaid._sum.amount || 0;
        const expenses = totalExpenses._sum.amount || 0;

        return {
            summary: [
                { label: 'Total Revenue', value: `₦${paid.toLocaleString()}`, icon: 'DollarSign', color: 'green' },
                { label: 'Total Expenses', value: `₦${expenses.toLocaleString()}`, icon: 'TrendingDown', color: 'red' },
                { label: 'Net Profit', value: `₦${(paid - expenses).toLocaleString()}`, icon: 'Activity', color: 'blue' },
            ],
            charts: {
                revenue: revenueTrend
            }
        };
    }

    private async getRevenueTrend(branchId?: string): Promise<ChartDataItem[]> {
        const last6Months = eachMonthOfInterval({
            start: subMonths(new Date(), 5),
            end: new Date()
        });

        const trend = await Promise.all(last6Months.map(async (date) => {
            const revenue = await this.prisma.payment.aggregate({
                where: {
                    ...(branchId && { branchId }),
                    status: 'COMPLETED',
                    createdAt: {
                        gte: startOfMonth(date),
                        lte: endOfMonth(date)
                    }
                },
                _sum: { amount: true }
            });
            return {
                name: format(date, 'MMM yy'),
                revenue: revenue._sum.amount || 0
            };
        }));

        return trend;
    }

    async getAttendanceAnalytics(query: ReportQueryDto): Promise<AnalyticsData> {
        const branchId = query.branchId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const where: any = {
            ...(branchId && { branchId }),
            date: today
        };

        const [
            totalPresent,
            totalAbsent,
            totalLate,
            attendanceTrend
        ] = await Promise.all([
            this.prisma.attendance.count({ where: { ...where, status: 'PRESENT' } }),
            this.prisma.attendance.count({ where: { ...where, status: 'ABSENT' } }),
            this.prisma.attendance.count({ where: { ...where, status: 'LATE' } }),
            this.getAttendanceTrend(branchId)
        ]);

        const total = totalPresent + totalAbsent + totalLate || 1;
        const avgRate = ((totalPresent + totalLate) / total) * 100;

        return {
            summary: [
                { label: 'Average Attendance', value: `${avgRate.toFixed(1)}%`, icon: 'CheckCircle', color: 'green' },
                { label: 'Absentees Today', value: totalAbsent, icon: 'UserX', color: 'red' },
                { label: 'Late Arrivals', value: totalLate, icon: 'Clock', color: 'orange' },
            ],
            charts: {
                attendance: attendanceTrend
            }
        };
    }

    private async getAttendanceTrend(branchId?: string): Promise<ChartDataItem[]> {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            return d;
        }).reverse();

        const trend = await Promise.all(last7Days.map(async (date) => {
            const counts = await this.prisma.attendance.groupBy({
                by: ['status'],
                where: {
                    ...(branchId && { branchId }),
                    date
                },
                _count: { _all: true }
            });

            const present = counts.find(c => c.status === 'PRESENT')?._count?._all || 0;
            const late = counts.find(c => c.status === 'LATE')?._count?._all || 0;
            const absent = counts.find(c => c.status === 'ABSENT')?._count?._all || 0;
            const total = present + late + absent || 1;

            return {
                name: format(date, 'EEE'),
                rate: Math.round(((present + late) / total) * 100)
            };
        }));

        return trend;
    }

    async getHRAnalytics(query: ReportQueryDto): Promise<AnalyticsData> {
        const branchId = query.branchId;
        const where: any = {
            ...(branchId && { user: { branchId } })
        };

        const [
            totalStaff,
            activeStaff,
            roleDist,
            genderDist
        ] = await Promise.all([
            this.prisma.staff.count({ where }),
            this.prisma.staff.count({ where: { ...where, status: 'ACTIVE' } }),
            this.prisma.user.groupBy({
                by: ['role'] as any,
                where: {
                    ...(branchId && { branchId }),
                    role: { notIn: ['STUDENT', 'PARENT'] }
                },
                _count: { _all: true }
            }) as any,
            this.prisma.staff.groupBy({
                by: ['gender'] as any,
                where,
                _count: { _all: true }
            }) as any
        ]);

        return {
            summary: [
                { label: 'Total Staff', value: totalStaff, icon: 'Briefcase', color: 'blue' },
                { label: 'Active Personnel', value: activeStaff, icon: 'UserCheck', color: 'green' },
                { label: 'Total Roles', value: roleDist.length, icon: 'Shield', color: 'orange' },
            ],
            charts: {
                roles: roleDist.map(r => ({ name: r.role.replace('_', ' '), value: r._count?._all || 0 })),
                gender: genderDist.map(g => ({ name: g.gender || 'Unknown', value: g._count?._all || 0 }))
            }
        };
    }

    async getAcademicAnalytics(query: ReportQueryDto): Promise<AnalyticsData> {
        const branchId = query.branchId || null;
        const [
            totalClasses,
            totalSubjects,
            totalExams,
            examPerformance
        ] = await Promise.all([
            this.prisma.class.count({ where: { ...(branchId && { branchId }) } }),
            this.prisma.subject.count({ where: { ...(branchId && { branchId }) } }),
            this.prisma.onlineExam.count({ where: { ...(branchId && { branchId }) } }),
            this.getAcademicPerformance(branchId)
        ]);

        return {
            summary: [
                { label: 'Academic Classes', value: totalClasses, icon: 'BookOpen', color: 'blue' },
                { label: 'Active Subjects', value: totalSubjects, icon: 'Book', color: 'green' },
                { label: 'Conducted Exams', value: totalExams, icon: 'FileText', color: 'purple' },
            ],
            charts: {
                exams: examPerformance.recentExamStats.map(e => ({
                    name: e.title,
                    score: e.avgScore
                }))
            }
        };
    }

    // ── Unified Dashboard ────────────────────────────────────────────────────

    async getUnifiedDashboard(branchId: string | null) {
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

    async getFinancialSummary(branchId: string | null, startDate?: Date, endDate?: Date) {
        const where = {
            ...(branchId && { branchId }),
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

    async getAcademicPerformance(branchId: string | null) {
        const totalStudents = await this.prisma.student.count({ where: { ...(branchId && { branchId }) } });
        const recentExams = await this.prisma.onlineExam.findMany({
            where: { ...(branchId && { branchId }), status: 'ENDED' },
            include: {
                attempts: true
            },
            take: 5,
            orderBy: { scheduledDate: 'desc' }
        });

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

    async getInventoryStats(branchId: string | null) {
        const [totalProducts, lowStockItems, totalValue] = await Promise.all([
            this.prisma.inventoryProduct.count({ where: { ...(branchId && { branchId }) } }),
            this.prisma.inventoryProduct.count({
                where: { ...(branchId && { branchId }), stock: { lte: 10 } }
            }),
            this.prisma.inventoryProduct.aggregate({
                where: { ...(branchId && { branchId }) },
                _sum: { stock: true }
            })
        ]);

        return {
            totalProducts,
            lowStockItems,
            totalUnits: totalValue._sum.stock || 0
        };
    }

    async getHRStats(branchId: string | null) {
        const [totalStaff, staffByRole] = await Promise.all([
            this.prisma.staff.count({
                where: {
                    ...(branchId && { user: { branchId } })
                }
            }),
            this.prisma.user.groupBy({
                by: ['role'],
                where: {
                    ...(branchId && { branchId }),
                    role: { notIn: ['STUDENT', 'PARENT'] }
                },
                _count: { _all: true }
            }) as any
        ]);

        return {
            totalStaff,
            roleDistribution: staffByRole.map(group => ({
                role: group.role,
                count: group._count?._all || 0
            }))
        };
    }

    // ── Export & Template Methods (Restored) ─────────────────────────────────

    async fillTemplate(template: string, data: any): Promise<string> {
        let html = template;
        const replacePlaceholders = (str: string, obj: any): string => {
            return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
                const value = path.split('.').reduce((acc: any, part: string) => {
                    return acc && acc[part] !== undefined ? acc[part] : '';
                }, obj);
                if (Array.isArray(value)) return value.join(', ');
                if (typeof value === 'object' && value !== null) return JSON.stringify(value);
                return value !== undefined && value !== null ? String(value) : '';
            });
        };
        html = replacePlaceholders(html, data);
        return html;
    }

    async generatePdf(html: string): Promise<Buffer> {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        return new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const text = html.replace(/<[^>]*>/g, '\n').replace(/\n\n+/g, '\n\n');
            doc.fontSize(12).text(text, { width: 500, align: 'left' });
            doc.end();
        });
    }

    async exportFeesPDF(branchId: string | null, startDate?: Date, endDate?: Date): Promise<Buffer> {
        const data = await this.getFinancialSummary(branchId, startDate, endDate);
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        return new Promise((resolve) => {
            doc.fontSize(20).text('Fees Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(14).text(`Total Paid: ₦${data.totalPaid.toLocaleString()}`);
            doc.fontSize(14).text(`Total Expenses: ₦${data.totalExpenses.toLocaleString()}`);
            doc.end();
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }

    async exportStudentPerformancePDF(branchId: string | null): Promise<Buffer> {
        const data = await this.getAcademicPerformance(branchId);
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        return new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(20).text('Student Performance Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Total Students: ${data.totalStudents}`);
            doc.moveDown();
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

    async generateExcel(headers: string[], rows: any[][]): Promise<ExcelJS.Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');
        worksheet.addRow(headers);
        worksheet.getRow(1).font = { bold: true };
        rows.forEach(row => worksheet.addRow(row));
        return await workbook.xlsx.writeBuffer();
    }

    async generateCsv(headers: string[], rows: any[][]): Promise<string> {
        const headerRow = headers.join(',');
        const dataRows = rows.map(row => row.join(',')).join('\n');
        return `${headerRow}\n${dataRows}`;
    }
}
