import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import type { Browser } from 'puppeteer';
import Handlebars from 'handlebars';
import {
  StudentReportQueryDto,
  FinanceReportQueryDto,
  ReportQueryDto,
} from './dto/report-query.dto';
import { AnalyticsData, ChartDataItem } from '@basaer/shared-types';
import { StaffStatus, PaymentStatus, InvoiceStatus, PayrollStatus, VoucherStatus } from '../generated/client/client';
import {
  DashboardData,
  StudentAnalyticsData,
  FinanceAnalyticsData,
  HRAnalyticsData,
  AcademicAnalyticsData,
  AttendanceAnalyticsData,
} from './dto/dashboard-data.dto';
import {
  format,
  startOfMonth,
  subMonths,
  endOfMonth,
  eachMonthOfInterval,
  startOfDay,
  endOfDay,
  subDays,
} from 'date-fns';

@Injectable()
export class ReportingService implements OnModuleDestroy {
  private readonly logger = new Logger(ReportingService.name);
  private readonly exportDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'exports',
  );

  // One headless Chromium instance is launched lazily and reused across every
  // PDF render — launching a fresh browser per request (~300-500ms + a new
  // process) doesn't scale under real concurrency (batch/bulk exports can
  // render dozens of PDFs back to back).
  private browserPromise: Promise<Browser> | null = null;

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browserPromise) {
      // Lazily required (not statically imported) so importing this service
      // never pulls in puppeteer's ESM entry unless a PDF is actually
      // rendered — jest's default CJS transform can't parse it from
      // node_modules on a static import.
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- deliberate lazy require, see comment above
      const puppeteer: typeof import('puppeteer') = require('puppeteer');
      this.browserPromise = puppeteer
        .launch({
          headless: true,
          // Containers typically run as root with no setuid sandbox helper
          // available — the standard flags for running Chromium in Docker.
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })
        .then((browser: Browser) => {
          browser.on('disconnected', () => {
            this.logger.warn('Puppeteer browser disconnected, will relaunch on next render');
            this.browserPromise = null;
          });
          return browser;
        })
        .catch((error: unknown) => {
          this.browserPromise = null;
          throw error;
        });
    }
    return this.browserPromise as Promise<Browser>;
  }

  async onModuleDestroy() {
    if (this.browserPromise) {
      const browser = await this.browserPromise.catch(() => null);
      await browser?.close();
    }
  }

  async saveExportBuffer(
    buffer: Buffer,
    filename: string,
  ): Promise<{ fileUrl: string; fileSize: number }> {
    const filepath = path.join(this.exportDir, filename);
    fs.writeFileSync(filepath, buffer);

    const fileUrl = `/public/uploads/exports/${filename}`;
    const stats = fs.statSync(filepath);

    return {
      fileUrl,
      fileSize: stats.size,
    };
  }

  async fillTemplate(template: string, data: any): Promise<string> {
    const compiled = Handlebars.compile(template, { noEscape: true });
    return compiled(data);
  }

  /**
   * Renders an HTML string to a PDF buffer via headless Chromium. This used
   * to call pdfkit's doc.text(content), which dumped the raw HTML string
   * (tags and all) as plain text — none of the CSS/table layout in the
   * report templates was ever actually rendered. Real HTML/CSS is what lets
   * admins customize a report template (layout, colors, watermark, logo) and
   * see it reflected exactly in the generated PDF.
   */
  async generatePdf(
    html: string,
    options?: { format?: 'A4' | 'Letter' | 'Legal'; landscape?: boolean },
  ): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({
        format: options?.format || 'A4',
        landscape: options?.landscape || false,
        printBackground: true,
        preferCSSPageSize: true,
      });
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }

  async getUnifiedDashboard(branchId: string | null): Promise<DashboardData> {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);

    // Branch-scoped where clause (null = all branches for super admin)
    const bWhere = branchId ? { branchId } : {};
    const staffWhere = branchId ? { user: { branchId } } : {};
    const paymentWhere = branchId ? { invoice: { branchId } } : {};
    const invoiceWhere = branchId ? { branchId } : {};

    const [
      totalStudents,
      newThisMonth,
      activeClasses,
      totalStaff,
      activeStaff,
      staffByDepartment,
      studentsByClassRaw,
      revenueAgg,
      outstandingAgg,
      monthlyTrend,
      todayAttendance,
    ] = await Promise.all([
      // Active students
      this.prisma.student.count({ where: { ...bWhere, deletedAt: null } }),

      // New students this month
      this.prisma.student.count({
        where: { ...bWhere, deletedAt: null, createdAt: { gte: monthStart } },
      }),

      // Active classes
      this.prisma.class.count({ where: bWhere }),

      // Total staff (any status)
      this.prisma.staff.count({ where: staffWhere }),

      // Active staff
      this.prisma.staff.count({
        where: { ...staffWhere, status: StaffStatus.ACTIVE },
      }),

      // Staff by department
      this.prisma.staff.groupBy({
        by: ['designationId'],
        where: { ...staffWhere, status: StaffStatus.ACTIVE },
        _count: { id: true },
      }),

      // Students by class
      this.prisma.class.findMany({
        where: bWhere,
        select: {
          name: true,
          _count: { select: { students: { where: { deletedAt: null } } } },
        },
        orderBy: { name: 'asc' },
      }),

      // Revenue (completed payments sum)
      this.prisma.payment.aggregate({
        where: { ...paymentWhere, status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),

      // Outstanding (unpaid/partially-paid invoices sum)
      this.prisma.invoice.aggregate({
        where: {
          ...invoiceWhere,
          status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] },
        },
        _sum: { balance: true },
      }),

      // Monthly revenue trend (last 6 months)
      this.computeMonthlyTrend(branchId),

      // Today's attendance
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: { ...bWhere, date: { gte: todayStart, lte: todayEnd } },
        _count: { id: true },
      }),
    ]);

    // Transform staff by department (resolve department names)
    const departments = await this.prisma.department.findMany({
      where: branchId ? { branchId } : {},
      select: { id: true, name: true },
    });
    const deptMap = new Map(departments.map((d) => [d.id, d.name]));

    const studentsByClass = studentsByClassRaw
      .filter((c) => c._count.students > 0)
      .map((c) => ({ className: c.name, count: c._count.students }));

    const byDepartment = staffByDepartment
      .filter((s) => s.designationId)
      .map((s) => ({
        department: deptMap.get(s.designationId!) || 'Unknown',
        count: s._count.id,
      }));

    const totalRevenue = revenueAgg._sum.amount?.toNumber() ?? 0;
    const totalOutstanding = outstandingAgg._sum.balance?.toNumber() ?? 0;
    const collectionRate = (totalRevenue + totalOutstanding) > 0
      ? Math.round((totalRevenue / (totalRevenue + totalOutstanding)) * 100)
      : 0;

    // Attendance rate
    const presentCount = todayAttendance
      .filter((a) => a.status === 'PRESENT')
      .reduce((sum, a) => sum + a._count.id, 0);
    const totalAttendance = todayAttendance.reduce((sum, a) => sum + a._count.id, 0);
    const todayRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    return {
      summary: [
        { label: 'Total Students', value: totalStudents, icon: 'Users', color: 'blue' },
        { label: 'Active Staff', value: activeStaff, icon: 'Briefcase', color: 'green' },
        { label: 'Revenue', value: totalRevenue, icon: 'DollarSign', color: 'orange' },
        { label: 'Attendance Today', value: `${todayRate}%`, icon: 'Calendar', color: 'purple' },
      ],
      academic: {
        totalStudents,
        newThisMonth,
        activeClasses,
        studentsByClass,
      },
      hr: {
        totalStaff,
        activeStaff,
        byDepartment,
      },
      finance: {
        totalRevenue,
        totalOutstanding,
        collectionRate,
        monthlyTrend,
      },
      attendance: {
        todayRate,
        present: presentCount,
        absent: totalAttendance - presentCount,
        total: totalAttendance,
        weeklyTrend: [],
      },
    };
  }

  private async computeMonthlyTrend(branchId: string | null): Promise<{ month: string; collected: number; invoiced: number }[]> {
    const now = new Date();
    const last6Months = eachMonthOfInterval({
      start: subMonths(startOfMonth(now), 5),
      end: now,
    });

    const paymentWhere = branchId ? { invoice: { branchId } } : {};
    const invoiceWhere = branchId ? { branchId } : {};

    return Promise.all(
      last6Months.map(async (month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const [collectedAgg, invoicedAgg] = await Promise.all([
          this.prisma.payment.aggregate({
            where: {
              ...paymentWhere,
              status: PaymentStatus.COMPLETED,
              createdAt: { gte: monthStart, lte: monthEnd },
            },
            _sum: { amount: true },
          }),
          this.prisma.invoice.aggregate({
            where: {
              ...invoiceWhere,
              createdAt: { gte: monthStart, lte: monthEnd },
            },
            _sum: { totalAmount: true },
          }),
        ]);

        return {
          month: format(month, 'MMM yyyy'),
          collected: collectedAgg._sum.amount?.toNumber() ?? 0,
          invoiced: invoicedAgg._sum.totalAmount?.toNumber() ?? 0,
        };
      }),
    );
  }

  async getStudentAnalytics(query: StudentReportQueryDto): Promise<StudentAnalyticsData> {
    const branchId = query.branchId || null;
    const bWhere = branchId ? { branchId } : {};
    const where = { ...bWhere, deletedAt: null, ...(query.classId ? { classId: query.classId } : {}) };

    const [total, byGender, byClassRaw, newThisYear, newThisTerm] = await Promise.all([
      this.prisma.student.count({ where }),
      this.prisma.student.groupBy({
        by: ['gender'] as any,
        where,
        _count: { id: true },
      }),
      this.prisma.class.findMany({
        where: bWhere,
        select: {
          name: true,
          _count: { select: { students: { where: { deletedAt: null } } } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.student.count({
        where: { ...where, createdAt: { gte: startOfMonth(new Date(new Date().getFullYear(), 0, 1)) } },
      }),
      this.prisma.student.count({ where }),
    ]);

    const byGenderData = byGender
      .filter((g: any) => g.gender)
      .map((g: any) => ({ gender: g.gender, count: g._count.id }));

    const byClass = byClassRaw
      .filter((c) => c._count.students > 0)
      .map((c) => ({ className: c.name, count: c._count.students }));

    return { total, active: total, byGender: byGenderData, byClass, newThisYear, newThisTerm };
  }

  async getFinanceAnalytics(query: FinanceReportQueryDto): Promise<FinanceAnalyticsData> {
    const branchId = query.branchId || null;
    const paymentWhere = branchId ? { invoice: { branchId } } : {};
    const invoiceWhere = branchId ? { branchId } : {};
    const dateFilter = query.startDate && query.endDate
      ? { createdAt: { gte: new Date(query.startDate), lte: new Date(query.endDate) } }
      : {};

    const [revenueAgg, outstandingAgg, categoryAgg, expensesAgg] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { ...paymentWhere, status: PaymentStatus.COMPLETED, ...dateFilter },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...invoiceWhere, status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] } },
        _sum: { balance: true },
      }),
      this.prisma.payment.findMany({
        where: { ...paymentWhere, status: PaymentStatus.COMPLETED, ...dateFilter },
        select: {
          amount: true,
          invoice: {
            select: {
              items: {
                select: { amount: true, category: { select: { name: true } } },
              },
            },
          },
        },
      }),
      this.prisma.voucher.aggregate({
        where: { ...invoiceWhere, status: VoucherStatus.APPROVED, ...dateFilter },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = revenueAgg._sum.amount?.toNumber() ?? 0;
    const totalOutstanding = outstandingAgg._sum.balance?.toNumber() ?? 0;
    const totalExpenses = expensesAgg._sum.amount?.toNumber() ?? 0;

    // Revenue by fee category: a payment is recorded against a whole
    // invoice, not a specific line item, and an invoice can span multiple
    // categories — so each payment's amount is allocated across the
    // invoice's categories in proportion to their share of the invoice's
    // total item amount. categoryAgg was previously fetched and then
    // discarded (byCategory always returned []).
    const categoryTotals = new Map<string, number>();
    for (const payment of categoryAgg) {
      const items = payment.invoice?.items ?? [];
      const invoiceTotal = items.reduce((sum, item) => sum + item.amount.toNumber(), 0);
      if (invoiceTotal <= 0) continue;
      const paymentAmount = payment.amount.toNumber();
      for (const item of items) {
        const share = item.amount.toNumber() / invoiceTotal;
        const categoryName = item.category?.name ?? 'Uncategorized';
        categoryTotals.set(
          categoryName,
          (categoryTotals.get(categoryName) ?? 0) + paymentAmount * share,
        );
      }
    }
    const byCategory = Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount);
    const collectionRate = (totalRevenue + totalOutstanding) > 0
      ? Math.round((totalRevenue / (totalRevenue + totalOutstanding)) * 100)
      : 0;

    // Compute cashflow from last 6 months
    const now = new Date();
    const last6Months = eachMonthOfInterval({
      start: subMonths(startOfMonth(now), 5),
      end: now,
    });

    const monthlyCashflow = await Promise.all(
      last6Months.map(async (month) => {
        const mStart = startOfMonth(month);
        const mEnd = endOfMonth(month);
        const [income, expenses] = await Promise.all([
          this.prisma.payment.aggregate({
            where: { ...paymentWhere, status: PaymentStatus.COMPLETED, createdAt: { gte: mStart, lte: mEnd } },
            _sum: { amount: true },
          }),
          this.prisma.voucher.aggregate({
            where: { ...invoiceWhere, status: VoucherStatus.APPROVED, createdAt: { gte: mStart, lte: mEnd } },
            _sum: { amount: true },
          }),
        ]);
        return {
          month: format(month, 'MMM yyyy'),
          income: income._sum.amount?.toNumber() ?? 0,
          expenses: expenses._sum.amount?.toNumber() ?? 0,
        };
      }),
    );

    return {
      totalRevenue,
      totalOutstanding,
      collectionRate,
      byCategory,
      monthlyCashflow,
    };
  }

  async getHRAnalytics(query: any): Promise<HRAnalyticsData> {
    const branchId = query?.branchId || null;
    const staffWhere = branchId ? { user: { branchId } } : {};

    const [totalStaff, byStatusArr, byDept, payrollTotal, payrollPending] = await Promise.all([
      this.prisma.staff.count({ where: staffWhere }),
      this.prisma.staff.groupBy({
        by: ['status'],
        where: staffWhere,
        _count: { id: true },
      }),
      this.prisma.staff.groupBy({
        by: ['designationId'],
        where: { ...staffWhere, status: StaffStatus.ACTIVE },
        _count: { id: true },
      }),
      this.prisma.payroll.aggregate({
        where: { ...(branchId ? { branchId } : {}), status: PayrollStatus.PAID },
        _sum: { amountPaid: true },
      }),
      this.prisma.payroll.aggregate({
        where: { ...(branchId ? { branchId } : {}), status: PayrollStatus.UNPAID },
        _sum: { amountPaid: true },
      }),
    ]);

    const departments = await this.prisma.department.findMany({
      where: branchId ? { branchId } : {},
      select: { id: true, name: true },
    });
    const deptMap = new Map(departments.map((d) => [d.id, d.name]));

    const byStatus = byStatusArr.map((s: any) => ({ status: s.status, count: s._count.id }));
    const byDepartment = byDept
      .filter((s: any) => s.designationId)
      .map((s: any) => ({
        department: deptMap.get(s.designationId!) || 'Unknown',
        count: s._count.id,
      }));

    return {
      totalStaff,
      byStatus,
      byDepartment,
      payrollTotal: payrollTotal._sum.amountPaid?.toNumber() ?? 0,
      payrollPending: payrollPending._sum.amountPaid?.toNumber() ?? 0,
    };
  }

  async getAcademicAnalytics(query: any): Promise<AcademicAnalyticsData> {
    const branchId = query?.branchId || null;
    const bWhere = branchId ? { branchId } : {};

    const [totalClasses, totalSections, totalStudents, subjectCount] = await Promise.all([
      this.prisma.class.count({ where: bWhere }),
      this.prisma.section.count({ where: { class: bWhere } }),
      this.prisma.student.count({ where: { ...bWhere, deletedAt: null } }),
      this.prisma.subject.count({ where: bWhere }),
    ]);

    return {
      totalClasses,
      totalSections,
      studentsPerClass: totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0,
      averageClassSize: totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0,
      subjectCount,
    };
  }

  async getAttendanceAnalytics(query: any): Promise<AttendanceAnalyticsData> {
    const branchId = query?.branchId || null;
    const bWhere = branchId ? { branchId } : {};
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Today's attendance
    const todayGroup = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: { ...bWhere, date: { gte: todayStart, lte: todayEnd } },
      _count: { id: true },
    });
    const presentCount = todayGroup.filter((a) => a.status === 'PRESENT').reduce((s, a) => s + a._count.id, 0);
    const totalCount = todayGroup.reduce((s, a) => s + a._count.id, 0);
    const todayRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    // Weekly trend (last 7 days)
    const weeklyDays = Array.from({ length: 7 }, (_, i) => subDays(now, 6 - i));
    const weeklyTrend = await Promise.all(
      weeklyDays.map(async (day) => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        const dayGroup = await this.prisma.attendance.groupBy({
          by: ['status'],
          where: { ...bWhere, date: { gte: dayStart, lte: dayEnd } },
          _count: { id: true },
        });
        const dayPresent = dayGroup.filter((a) => a.status === 'PRESENT').reduce((s, a) => s + a._count.id, 0);
        const dayTotal = dayGroup.reduce((s, a) => s + a._count.id, 0);
        return {
          date: format(day, 'EEE'),
          present: dayPresent,
          absent: dayTotal - dayPresent,
          rate: dayTotal > 0 ? Math.round((dayPresent / dayTotal) * 100) : 0,
        };
      }),
    );

    // Monthly summary (last 6 months)
    const last6Months = eachMonthOfInterval({
      start: subMonths(startOfMonth(now), 5),
      end: now,
    });
    const monthlySummary = await Promise.all(
      last6Months.map(async (month) => {
        const mStart = startOfMonth(month);
        const mEnd = endOfMonth(month);
        const monthGroup = await this.prisma.attendance.groupBy({
          by: ['status'],
          where: { ...bWhere, date: { gte: mStart, lte: mEnd } },
          _count: { id: true },
        });
        const monthPresent = monthGroup.filter((a) => a.status === 'PRESENT').reduce((s, a) => s + a._count.id, 0);
        const monthTotal = monthGroup.reduce((s, a) => s + a._count.id, 0);
        return {
          month: format(month, 'MMM yyyy'),
          rate: monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100) : 0,
          totalDays: monthGroup.length,
        };
      }),
    );

    return { todayRate, weeklyTrend, monthlySummary };
  }

  /**
   * dashboard/reports/inventory/page.tsx read response.data.inventory from
   * GET /reporting/dashboard, a field that endpoint never returned — the
   * page could never show real data. This is a real, dedicated inventory
   * analytics endpoint instead.
   */
  async getInventoryAnalytics(query: { branchId?: string | null }) {
    const branchId = query?.branchId || null;
    const bWhere = branchId ? { branchId } : {};

    const [totalProducts, stockAgg, stockLevels, byCategory] = await Promise.all([
      this.prisma.inventoryProduct.count({ where: bWhere }),
      this.prisma.inventoryProduct.aggregate({
        where: bWhere,
        _sum: { stock: true },
      }),
      // Prisma's query builder can't compare one column to another (stock
      // vs lowStockThreshold) in a `where` filter, so the low-stock count
      // is computed in application code over the (small) stock/threshold
      // projection rather than a raw SQL query.
      this.prisma.inventoryProduct.findMany({
        where: bWhere,
        select: { stock: true, lowStockThreshold: true },
      }),
      this.prisma.inventoryProduct.groupBy({
        by: ['categoryId'],
        where: bWhere,
        _sum: { stock: true },
      }),
    ]);
    const lowStockItems = stockLevels.filter((p) => p.stock <= p.lowStockThreshold).length;

    const categories = await this.prisma.inventoryCategory.findMany({
      where: { id: { in: byCategory.map((c) => c.categoryId) } },
      select: { id: true, name: true },
    });
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

    return {
      totalProducts,
      totalUnits: stockAgg._sum.stock ?? 0,
      lowStockItems,
      stockByCategory: byCategory.map((c) => ({
        name: categoryNameById.get(c.categoryId) ?? 'Uncategorized',
        value: c._sum.stock ?? 0,
      })),
    };
  }

  /**
   * Previously rendered only a "Financial Report" title with no actual
   * numbers — real, downloadable-looking, but empty. Now renders the same
   * figures getFinanceAnalytics computes for the dashboard.
   */
  async exportFeesPDF(
    branchId: string,
    start?: Date,
    end?: Date,
  ): Promise<Buffer> {
    const data = await this.getFinanceAnalytics({
      branchId,
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
    } as FinanceReportQueryDto);

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text('Financial Report', { align: 'center' });
      if (start && end) {
        doc.fontSize(10).fillColor('#666').text(
          `${start.toLocaleDateString()} — ${end.toLocaleDateString()}`,
          { align: 'center' },
        );
      }
      doc.moveDown(1.5).fillColor('#000');

      doc.fontSize(13).text(`Total Revenue: ${data.totalRevenue.toLocaleString()}`);
      doc.text(`Total Outstanding: ${data.totalOutstanding.toLocaleString()}`);
      doc.text(`Collection Rate: ${data.collectionRate}%`);
      doc.moveDown();

      doc.fontSize(15).text('Revenue by Category');
      doc.moveDown(0.5);
      if (data.byCategory.length === 0) {
        doc.fontSize(11).fillColor('#666').text('No categorized revenue in this period.');
      } else {
        data.byCategory.forEach((row) => {
          doc.fontSize(11).fillColor('#000').text(`${row.category}: ${row.amount.toLocaleString()}`);
        });
      }
      doc.moveDown().fillColor('#000');

      doc.fontSize(15).text('Monthly Cashflow (last 6 months)');
      doc.moveDown(0.5);
      data.monthlyCashflow.forEach((row) => {
        doc.fontSize(11).text(
          `${row.month} — Income: ${row.income.toLocaleString()}, Expenses: ${row.expenses.toLocaleString()}`,
        );
      });

      doc.end();
    });
  }

  async exportFeesExcel(
    branchId: string,
    start?: Date,
    end?: Date,
  ): Promise<Buffer> {
    const data = await this.getFinanceAnalytics({
      branchId,
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
    } as FinanceReportQueryDto);
    const rows = [
      ['Total Revenue', data.totalRevenue],
      ['Total Outstanding', data.totalOutstanding],
      ['Collection Rate (%)', data.collectionRate],
      ...data.byCategory.map((r) => [`Category: ${r.category}`, r.amount]),
      ...data.monthlyCashflow.flatMap((r) => [
        [`${r.month} Income`, r.income],
        [`${r.month} Expenses`, r.expenses],
      ]),
    ];
    return this.generateExcel(['Metric', 'Value'], rows, 'Finance Report');
  }

  /**
   * Previously rendered only a "Performance Report" title with no data.
   * Renders real enrollment/demographic analytics (the same data the
   * dashboard's student analytics widget shows) — full academic
   * performance (grades/GPA) reporting lives in the exams module's
   * report-card/broadsheet generation, which is a larger, separate report.
   */
  async exportStudentPerformancePDF(branchId: string): Promise<Buffer> {
    const data = await this.getStudentAnalytics({ branchId } as StudentReportQueryDto);

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text('Student Performance Report', { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(13).text(`Total Students: ${data.total}`);
      doc.text(`New This Year: ${data.newThisYear}`);
      doc.text(`New This Term: ${data.newThisTerm}`);
      doc.moveDown();

      doc.fontSize(15).text('By Gender');
      doc.moveDown(0.5);
      data.byGender.forEach((row: any) => {
        doc.fontSize(11).text(`${row.gender ?? 'Unknown'}: ${row.count}`);
      });
      doc.moveDown();

      doc.fontSize(15).text('By Class');
      doc.moveDown(0.5);
      if (data.byClass.length === 0) {
        doc.fontSize(11).fillColor('#666').text('No class data available.');
      } else {
        data.byClass.forEach((row: any) => {
          doc.fontSize(11).fillColor('#000').text(`${row.className}: ${row.count}`);
        });
      }

      doc.end();
    });
  }

  async exportStudentPerformanceExcel(branchId: string): Promise<Buffer> {
    const data = await this.getStudentAnalytics({ branchId } as StudentReportQueryDto);
    const rows = [
      ['Total Students', data.total],
      ['New This Year', data.newThisYear],
      ['New This Term', data.newThisTerm],
      ...data.byGender.map((r: any) => [`Gender: ${r.gender ?? 'Unknown'}`, r.count]),
      ...data.byClass.map((r: any) => [`Class: ${r.className}`, r.count]),
    ];
    return this.generateExcel(['Metric', 'Value'], rows, 'Performance Report');
  }

  /**
   * The frontend's HR export buttons called GET /reporting/export/hr,
   * which never existed on the backend — silently failing (caught and
   * only console-logged). getHRAnalytics already computes real figures for
   * the HR dashboard; these reuse it instead of building a separate query.
   */
  async exportHRPDF(branchId: string): Promise<Buffer> {
    const data = await this.getHRAnalytics({ branchId });

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text('HR Report', { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(13).text(`Total Staff: ${data.totalStaff}`);
      doc.text(`Payroll Total (current period): ${data.payrollTotal.toLocaleString()}`);
      doc.text(`Payroll Pending: ${data.payrollPending.toLocaleString()}`);
      doc.moveDown();

      doc.fontSize(15).text('By Status');
      doc.moveDown(0.5);
      data.byStatus.forEach((row) => {
        doc.fontSize(11).text(`${row.status}: ${row.count}`);
      });
      doc.moveDown();

      doc.fontSize(15).text('By Department');
      doc.moveDown(0.5);
      if (data.byDepartment.length === 0) {
        doc.fontSize(11).fillColor('#666').text('No department data available.');
      } else {
        data.byDepartment.forEach((row) => {
          doc.fontSize(11).fillColor('#000').text(`${row.department}: ${row.count}`);
        });
      }

      doc.end();
    });
  }

  async exportHRExcel(branchId: string): Promise<Buffer> {
    const data = await this.getHRAnalytics({ branchId });
    const rows = [
      ...data.byStatus.map((r) => ['Status', r.status, r.count]),
      ...data.byDepartment.map((r) => ['Department', r.department, r.count]),
    ];
    return this.generateExcel(['Breakdown', 'Label', 'Count'], rows, 'HR Report');
  }

  /** Same "called a route that didn't exist" gap as exportHRPDF/Excel above. */
  async exportInventoryPDF(branchId: string): Promise<Buffer> {
    const data = await this.getInventoryAnalytics({ branchId });

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text('Inventory Report', { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(13).text(`Total Products: ${data.totalProducts}`);
      doc.text(`Total Units in Stock: ${data.totalUnits}`);
      doc.text(`Low Stock Items: ${data.lowStockItems}`);
      doc.moveDown();

      doc.fontSize(15).text('Stock by Category');
      doc.moveDown(0.5);
      if (data.stockByCategory.length === 0) {
        doc.fontSize(11).fillColor('#666').text('No category data available.');
      } else {
        data.stockByCategory.forEach((row) => {
          doc.fontSize(11).fillColor('#000').text(`${row.name}: ${row.value}`);
        });
      }

      doc.end();
    });
  }

  async exportInventoryExcel(branchId: string): Promise<Buffer> {
    const data = await this.getInventoryAnalytics({ branchId });
    const rows = data.stockByCategory.map((r) => [r.name, r.value]);
    return this.generateExcel(['Category', 'Stock'], rows, 'Inventory Report');
  }

  async generateExcel(
    headers: string[],
    rows: any[][],
    sheetName: string = 'Data',
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.addRow(headers);
    worksheet.getRow(1).font = { bold: true };
    rows.forEach((row) => worksheet.addRow(row));
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer as any);
  }

  async generateCsvBuffer(headers: string[], rows: any[][]): Promise<Buffer> {
    const headerRow = headers.join(',');
    const dataRows = rows.map((row) => row.join(',')).join('\n');
    return Buffer.from(`${headerRow}\n${dataRows}`, 'utf8');
  }

  async generateCsv(headers: string[], rows: any[][]): Promise<string> {
    const headerRow = headers.join(',');
    const dataRows = rows.map((row) => row.join(',')).join('\n');
    return `${headerRow}\n${dataRows}`;
  }

}
