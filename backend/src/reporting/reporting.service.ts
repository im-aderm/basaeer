import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
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
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);
  private readonly exportDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'exports',
  );

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
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
    return this.resolvePlaceholders(template, data);
  }

  async generatePdf(content: string): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.text(content);
      doc.end();
    });
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
              items: { select: { categoryId: true } },
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
      byCategory: [],
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

  async exportFeesPDF(
    branchId: string,
    start?: Date,
    end?: Date,
  ): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.fontSize(20).text('Financial Report', { align: 'center' });
      doc.end();
    });
  }

  async exportStudentPerformancePDF(branchId: string): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.fontSize(20).text('Performance Report', { align: 'center' });
      doc.end();
    });
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

  async generateReportCardFromTemplate(
    data: any,
    template: any,
  ): Promise<Buffer> {
    const doc = new PDFDocument({
      margin: template.config?.margins || 50,
      size: template.config?.paperSize || 'A4',
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      if (template.config?.watermark) {
        this.renderWatermark(doc, template.config.watermark);
      }

      const sections = template.layout?.sections || [];
      sections.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

      sections.forEach((section: any) => {
        this.renderSection(doc, section, data);
        doc.moveDown();
      });

      doc.end();
    });
  }

  private renderWatermark(doc: any, text: string) {
    doc.save();
    doc.opacity(0.1);
    doc.fontSize(60).text(text, 100, 300, { rotation: 45 });
    doc.restore();
  }

  private renderSection(doc: any, section: any, data: any) {
    switch (section.type) {
      case 'HEADER':
        this.renderHeader(doc, section, data);
        break;
      case 'GRID':
        this.renderGrid(doc, section, data);
        break;
      case 'TABLE':
        this.renderTable(doc, section, data);
        break;
      case 'TEXT':
        this.renderText(doc, section, data);
        break;
      case 'SIGNATURES':
        this.renderSignatures(doc, section, data);
        break;
    }
  }

  private renderHeader(doc: any, section: any, data: any) {
    doc
      .fontSize(18)
      .text(data.schoolName || 'Institution Name', { align: 'center' });
    doc.fontSize(10).text(data.schoolAddress || '', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(data.reportType || 'Report Card', {
      align: 'center',
      underline: true,
    });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Name: ${data.studentName}`, 50, doc.y);
    doc.text(`Class: ${data.className}`, 300, doc.y - 12);
    doc.text(`ID: ${data.admissionNo}`, 50, doc.y);
    doc.text(`Term: ${data.termName}`, 300, doc.y - 12);
  }

  private renderTable(doc: any, section: any, data: any) {
    if (section.dataType === 'ACADEMIC_RESULTS') {
      const subjects = data.subjects || [];
      const headers = data.assessmentHeaders || [];
      doc
        .fontSize(12)
        .text(section.title || 'Academic Results', { underline: true });
      doc.moveDown(0.5);

      const startY = doc.y;
      doc.fontSize(8).font('Helvetica-Bold');
      doc.text('Subject', 50, startY);

      let currentX = 150;
      headers.forEach((h: string) => {
        doc.text(h, currentX, startY, { width: 40, align: 'center' });
        currentX += 45;
      });

      doc.text('Total', currentX, startY, { width: 40, align: 'center' });
      doc.text('Grade', currentX + 45, startY, { width: 40, align: 'center' });
      doc.text('Pos', currentX + 90, startY, { width: 40, align: 'center' });
      doc.moveDown(0.5);
      doc.font('Helvetica');

      subjects.forEach((s: any) => {
        const rowY = doc.y;
        doc.text(s.name, 50, rowY, { width: 95 });

        let scoreX = 150;
        headers.forEach((h: string) => {
          const score = s.dynamicScores?.[h] ?? '-';
          doc.text(score.toString(), scoreX, rowY, { width: 40, align: 'center' });
          scoreX += 45;
        });

        doc.text(s.total, scoreX, rowY, { width: 40, align: 'center' });
        doc.text(s.grade, scoreX + 45, rowY, { width: 40, align: 'center' });
        doc.text(s.position, scoreX + 90, rowY, { width: 40, align: 'center' });
        doc.moveDown(0.3);
      });
    }
  }

  private renderText(doc: any, section: any, data: any) {
    const content = this.resolvePlaceholders(section.content || '', data);
    doc.fontSize(10).text(content);
  }

  private renderGrid(doc: any, section: any, data: any) {
    doc
      .fontSize(12)
      .text(section.title || 'Other Assessments', { underline: true });
  }

  private renderSignatures(doc: any, section: any, data: any) {
    doc.moveDown(2);
    doc.text('____________________', 50, doc.y);
    doc.text('____________________', 350, doc.y - 12);
    doc.text('Form Teacher', 50, doc.y);
    doc.text('Principal', 350, doc.y - 12);
  }

  private resolvePlaceholders(text: string, data: any): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      return (
        path
          .split('.')
          .reduce((acc: any, part: string) => acc && acc[part], data) || ''
      );
    });
  }
}
