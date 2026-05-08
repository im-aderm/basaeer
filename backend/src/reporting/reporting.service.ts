import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { StudentReportQueryDto, FinanceReportQueryDto, ReportQueryDto } from './dto/report-query.dto';
import { AnalyticsData, ChartDataItem } from '@basaeer/shared-types';
import { format, startOfMonth, subMonths, endOfMonth, eachMonthOfInterval } from 'date-fns';

@Injectable()
export class ReportingService {
    private readonly logger = new Logger(ReportingService.name);
    private readonly exportDir = path.join(process.cwd(), 'public', 'uploads', 'exports');

    constructor(private prisma: PrismaService) {
        if (!fs.existsSync(this.exportDir)) {
            fs.mkdirSync(this.exportDir, { recursive: true });
        }
    }

    async saveExportBuffer(buffer: Buffer, filename: string): Promise<{ fileUrl: string; fileSize: number }> {
        const filepath = path.join(this.exportDir, filename);
        fs.writeFileSync(filepath, buffer);

        const fileUrl = `/public/uploads/exports/${filename}`;
        const stats = fs.statSync(filepath);

        return {
            fileUrl,
            fileSize: stats.size
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

    async getUnifiedDashboard(branchId: string): Promise<AnalyticsData> {
        return { summary: [], charts: {} };
    }

    async getStudentAnalytics(query: StudentReportQueryDto): Promise<AnalyticsData> {
        return { summary: [], charts: {} };
    }

    async getFinanceAnalytics(query: FinanceReportQueryDto): Promise<AnalyticsData> {
        return { summary: [], charts: {} };
    }

    async getHRAnalytics(query: any): Promise<AnalyticsData> {
        return { summary: [], charts: {} };
    }

    async getAcademicAnalytics(query: any): Promise<AnalyticsData> {
        return { summary: [], charts: {} };
    }

    async getAttendanceAnalytics(query: any): Promise<AnalyticsData> {
        return { summary: [], charts: {} };
    }

    async exportFeesPDF(branchId: string, start?: Date, end?: Date): Promise<Buffer> {
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

    async generateExcel(headers: string[], rows: any[][], sheetName: string = 'Data'): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);
        worksheet.addRow(headers);
        worksheet.getRow(1).font = { bold: true };
        rows.forEach(row => worksheet.addRow(row));
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer as any);
    }

    async generateCsvBuffer(headers: string[], rows: any[][]): Promise<Buffer> {
        const headerRow = headers.join(',');
        const dataRows = rows.map(row => row.join(',')).join('\n');
        return Buffer.from(`${headerRow}\n${dataRows}`, 'utf8');
    }

    async generateCsv(headers: string[], rows: any[][]): Promise<string> {
        const headerRow = headers.join(',');
        const dataRows = rows.map(row => row.join(',')).join('\n');
        return `${headerRow}\n${dataRows}`;
    }

    async generateReportCardFromTemplate(data: any, template: any): Promise<Buffer> {
        const doc = new PDFDocument({ 
            margin: template.config?.margins || 50,
            size: template.config?.paperSize || 'A4'
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
        doc.fontSize(18).text(data.schoolName || 'Institution Name', { align: 'center' });
        doc.fontSize(10).text(data.schoolAddress || '', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(data.reportType || 'Report Card', { align: 'center', underline: true });
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
            doc.fontSize(12).text(section.title || 'Academic Results', { underline: true });
            doc.moveDown(0.5);
            
            const startY = doc.y;
            doc.fontSize(9).font('Helvetica-Bold');
            doc.text('Subject', 50, startY);
            doc.text('Total', 250, startY);
            doc.text('Grade', 350, startY);
            doc.text('Position', 450, startY);
            doc.moveDown(0.5);
            doc.font('Helvetica');

            subjects.forEach((s: any) => {
                doc.text(s.name, 50, doc.y);
                doc.text(s.total, 250, doc.y - 11);
                doc.text(s.grade, 350, doc.y - 11);
                doc.text(s.position, 450, doc.y - 11);
                doc.moveDown(0.3);
            });
        }
    }

    private renderText(doc: any, section: any, data: any) {
        const content = this.resolvePlaceholders(section.content || '', data);
        doc.fontSize(10).text(content);
    }

    private renderGrid(doc: any, section: any, data: any) {
        doc.fontSize(12).text(section.title || 'Other Assessments', { underline: true });
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
            return path.split('.').reduce((acc: any, part: string) => acc && acc[part], data) || '';
        });
    }
}
