import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PDFDocument as PdfLibDocument } from 'pdf-lib';
import sharp from 'sharp';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { BranchBrandingService } from '../branches/branch-branding.service';
import { TenantContext } from '../auth/branch.guard';

/** A fetched file plus its detected mime type. */
interface FetchedAsset {
  buffer: Buffer;
  mime?: string;
}

/** Documents submitted on the admission form, in the order they appear on the slip. */
const DOCUMENT_FIELDS: { field: string; label: string }[] = [
  { field: 'birthCertificateUrl', label: 'Birth Certificate' },
  { field: 'testimonialUrl', label: 'Testimonial' },
  { field: 'transferCertificateUrl', label: 'Transfer Certificate' },
  { field: 'immunizationCardUrl', label: 'Immunization Card' },
  { field: 'ninUrl', label: 'National Identification (NIN)' },
  { field: 'educationalCertUrl', label: 'Educational Certificate' },
  { field: 'transferLetterUrl', label: 'Transfer Letter' },
  { field: 'medicalReportUrl', label: 'Medical Report' },
  { field: 'recommendationLetterUrl', label: 'Recommendation Letter' },
  { field: 'schoolReportUrl', label: 'School Report' },
  { field: 'paymentReceiptUrl', label: 'Payment Receipt' },
  { field: 'passportPhoto2', label: 'Additional Photograph (2)' },
  { field: 'passportPhoto3', label: 'Additional Photograph (3)' },
  { field: 'passportPhoto4', label: 'Additional Photograph (4)' },
];

const PAGE_MARGIN = 40;
const MAX_FETCH_BYTES = 15 * 1024 * 1024; // 15 MB per asset

/**
 * Generates the admission slip PDF for an online admission.
 *
 * Page 1 is a formatted slip with the applicant's passport photograph on the
 * right. Every other document submitted on the admission form is then attached,
 * each starting on its own page: image documents are rendered inline (via
 * pdfkit), and PDF documents are merged in with their original pages (via
 * pdf-lib) after the image documents.
 */
@Injectable()
export class AdmissionSlipService {
  private readonly logger = new Logger(AdmissionSlipService.name);
  // Compiled location is dist/online-admission -> backend/public
  private readonly publicDir = path.join(__dirname, '..', '..', 'public');

  constructor(
    private prisma: PrismaService,
    private branding: BranchBrandingService,
  ) {}

  async generateSlip(
    admissionId: string,
    context: TenantContext,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const admission: any = await this.prisma.onlineAdmission.findFirst({
      where: {
        id: admissionId,
        ...(context.branchId ? { branchId: context.branchId } : {}),
      },
      include: {
        desiredClass: true,
        offeredClass: true,
        academicSession: true,
        branch: true,
      },
    });
    if (!admission) {
      throw new NotFoundException('Admission not found');
    }

    const branding = await this.branding
      .getBranding(admission.branchId)
      .catch(() => null);

    // Fetch cover assets.
    const passport = admission.passportPhoto
      ? await this.fetchImageForPdf(admission.passportPhoto)
      : null;
    const logo = branding?.logoUrl
      ? await this.fetchImageForPdf(branding.logoUrl)
      : null;

    // Fetch and classify each submitted document.
    const imageDocs: { label: string; jpeg: Buffer }[] = [];
    const unavailableDocs: string[] = [];
    const pdfDocs: { label: string; buffer: Buffer }[] = [];

    for (const { field, label } of DOCUMENT_FIELDS) {
      const url = admission[field];
      if (!url) continue;
      const asset = await this.fetchAsset(url);
      if (!asset) {
        unavailableDocs.push(label);
        continue;
      }
      if (asset.mime === 'application/pdf' || this.isPdf(asset.buffer)) {
        pdfDocs.push({ label, buffer: asset.buffer });
      } else {
        const jpeg = await this.toJpeg(asset.buffer);
        if (jpeg) imageDocs.push({ label, jpeg });
        else unavailableDocs.push(label);
      }
    }

    const basePdf = await this.buildBasePdf({
      admission,
      branding,
      passport,
      logo,
      imageDocs,
      unavailableDocs,
    });

    const merged = pdfDocs.length
      ? await this.appendPdfDocuments(basePdf, pdfDocs)
      : basePdf;

    const ref = admission.admissionNumber || admission.id.slice(0, 8);
    return { buffer: merged, filename: `admission-slip-${ref}.pdf` };
  }

  // ── PDF assembly ───────────────────────────────────────────────────────────

  private buildBasePdf(data: {
    admission: any;
    branding: any;
    passport: Buffer | null;
    logo: Buffer | null;
    imageDocs: { label: string; jpeg: Buffer }[];
    unavailableDocs: string[];
  }): Promise<Buffer> {
    const { admission, branding, passport, logo, imageDocs, unavailableDocs } =
      data;
    const primary = branding?.primaryColor || '#2563EB';
    const schoolName = branding?.name || admission.branch?.name || 'Basaer School';

    const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) =>
      doc.on('end', () => resolve(Buffer.concat(chunks))),
    );

    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - PAGE_MARGIN * 2;
    const passportBox = { w: 115, h: 145 };
    const passportX = pageWidth - PAGE_MARGIN - passportBox.w;

    // ── Header ────────────────────────────────────────────────────────────
    let y = PAGE_MARGIN;
    if (logo) {
      try {
        doc.image(logo, PAGE_MARGIN, y, { fit: [55, 55] });
      } catch {
        /* ignore unrenderable logo */
      }
    }
    doc
      .fillColor(primary)
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(schoolName, logo ? PAGE_MARGIN + 65 : PAGE_MARGIN, y + 4, {
        width: contentWidth - 130,
      });
    doc
      .fillColor('#111111')
      .fontSize(13)
      .text('ADMISSION SLIP', logo ? PAGE_MARGIN + 65 : PAGE_MARGIN, y + 28);

    // ── Passport photo (right side of page 1) ────────────────────────────
    const passportY = PAGE_MARGIN;
    doc
      .lineWidth(1)
      .strokeColor(primary)
      .rect(passportX, passportY, passportBox.w, passportBox.h)
      .stroke();
    if (passport) {
      try {
        doc.image(passport, passportX + 3, passportY + 3, {
          fit: [passportBox.w - 6, passportBox.h - 6],
          align: 'center',
          valign: 'center',
        });
      } catch {
        this.placeholderBox(doc, passportX, passportY, passportBox, 'Photo');
      }
    } else {
      this.placeholderBox(doc, passportX, passportY, passportBox, 'No Photo');
    }

    // Divider under header.
    y = PAGE_MARGIN + 70;
    doc
      .moveTo(PAGE_MARGIN, y)
      .lineTo(pageWidth - PAGE_MARGIN, y)
      .lineWidth(1)
      .strokeColor(primary)
      .stroke();

    // ── Bio (left column, constrained so it never runs under the photo) ───
    const leftWidth = passportX - PAGE_MARGIN - 15;
    y += 14;
    doc.fillColor('#111111').font('Helvetica');

    const fullName = [admission.firstName, admission.otherNames, admission.lastName]
      .filter(Boolean)
      .join(' ');
    const cls = admission.offeredClass?.name || admission.desiredClass?.name || '—';

    const rows: [string, string][] = [
      ['Admission No.', admission.admissionNumber || '—'],
      ['Applicant Name', fullName],
      ['Gender', admission.gender || '—'],
      ['Date of Birth', this.fmtDate(admission.dateOfBirth)],
      ['Nationality', admission.nationality || '—'],
      ['Class Applied / Offered', cls],
      ['Academic Session', admission.academicSession?.name || '—'],
      ['Application Status', this.humanize(admission.status)],
      ['Guardian', admission.guardianName || '—'],
      ['Guardian Phone', admission.guardianPhone || '—'],
      ['Application Date', this.fmtDate(admission.createdAt)],
    ];
    y = this.renderRows(doc, rows, PAGE_MARGIN, y, leftWidth);

    // Continue below the photo for wider notes.
    y = Math.max(y, passportY + passportBox.h + 20);
    if (unavailableDocs.length) {
      doc
        .fillColor('#a15c00')
        .fontSize(9)
        .text(
          `Note: the following submitted documents could not be attached: ${unavailableDocs.join(
            ', ',
          )}.`,
          PAGE_MARGIN,
          y,
          { width: contentWidth },
        );
    }

    // Footer.
    doc
      .fillColor('#888888')
      .fontSize(8)
      .text(
        `Generated ${new Date().toLocaleString()} · Reference ${
          admission.admissionNumber || admission.id
        }`,
        PAGE_MARGIN,
        doc.page.height - PAGE_MARGIN - 10,
        { width: contentWidth, align: 'center' },
      );

    // ── One page per image document ───────────────────────────────────────
    for (const d of imageDocs) {
      doc.addPage({ size: 'A4', margin: PAGE_MARGIN });
      this.documentPageHeader(doc, d.label, primary);
      try {
        doc.image(d.jpeg, PAGE_MARGIN, PAGE_MARGIN + 40, {
          fit: [contentWidth, doc.page.height - PAGE_MARGIN * 2 - 50],
          align: 'center',
          valign: 'center',
        });
      } catch {
        doc
          .fillColor('#a15c00')
          .fontSize(11)
          .text('This document could not be rendered.', PAGE_MARGIN, PAGE_MARGIN + 60);
      }
    }

    doc.end();
    return done;
  }

  private async appendPdfDocuments(
    baseBuffer: Buffer,
    pdfDocs: { label: string; buffer: Buffer }[],
  ): Promise<Buffer> {
    try {
      const out = await PdfLibDocument.load(baseBuffer);
      for (const d of pdfDocs) {
        try {
          const src = await PdfLibDocument.load(d.buffer, {
            ignoreEncryption: true,
          });
          const pages = await out.copyPages(src, src.getPageIndices());
          pages.forEach((p) => out.addPage(p));
        } catch (err) {
          this.logger.warn(
            `Skipping unmergeable PDF document "${d.label}": ${(err as Error).message}`,
          );
        }
      }
      const bytes = await out.save();
      return Buffer.from(bytes);
    } catch (err) {
      // If merging fails entirely, return the base slip rather than nothing.
      this.logger.error(`PDF merge failed: ${(err as Error).message}`);
      return baseBuffer;
    }
  }

  // ── Rendering helpers ────────────────────────────────────────────────────

  private renderRows(
    doc: PDFKit.PDFDocument,
    rows: [string, string][],
    x: number,
    startY: number,
    width: number,
  ): number {
    let y = startY;
    const labelWidth = 120;
    for (const [label, value] of rows) {
      doc
        .fillColor('#555555')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(label, x, y, { width: labelWidth });
      const h = doc.heightOfString(value || '—', {
        width: width - labelWidth - 8,
      });
      doc
        .fillColor('#111111')
        .font('Helvetica')
        .fontSize(10)
        .text(value || '—', x + labelWidth + 8, y, {
          width: width - labelWidth - 8,
        });
      y += Math.max(16, h + 4);
    }
    return y;
  }

  private documentPageHeader(
    doc: PDFKit.PDFDocument,
    label: string,
    primary: string,
  ) {
    doc
      .fillColor(primary)
      .font('Helvetica-Bold')
      .fontSize(13)
      .text(label, PAGE_MARGIN, PAGE_MARGIN);
    doc
      .moveTo(PAGE_MARGIN, PAGE_MARGIN + 22)
      .lineTo(doc.page.width - PAGE_MARGIN, PAGE_MARGIN + 22)
      .lineWidth(0.8)
      .strokeColor(primary)
      .stroke();
  }

  private placeholderBox(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    box: { w: number; h: number },
    label: string,
  ) {
    doc
      .fillColor('#f3f4f6')
      .rect(x + 1, y + 1, box.w - 2, box.h - 2)
      .fill();
    doc
      .fillColor('#9ca3af')
      .fontSize(9)
      .text(label, x, y + box.h / 2 - 5, { width: box.w, align: 'center' });
    doc.fillColor('#111111');
  }

  // ── Asset fetching (SSRF-safe) ─────────────────────────────────────────────

  /** Fetch a stored asset (R2 URL, local upload path, or data URI) to a Buffer. */
  private async fetchAsset(url: string): Promise<FetchedAsset | null> {
    try {
      if (!url) return null;

      if (url.startsWith('data:')) {
        const m = /^data:([^;]+);base64,(.*)$/s.exec(url);
        if (!m) return null;
        return { buffer: Buffer.from(m[2], 'base64'), mime: m[1] };
      }

      if (url.startsWith('http://') || url.startsWith('https://')) {
        const parsed = new URL(url);
        if (!this.isAllowedHost(parsed.hostname)) {
          this.logger.warn(`Blocked fetch of asset from disallowed host: ${parsed.hostname}`);
          return null;
        }
        const res = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 8000,
          maxContentLength: MAX_FETCH_BYTES,
          maxRedirects: 2,
        });
        return { buffer: Buffer.from(res.data) };
      }

      // Local upload path, e.g. "/uploads/fallback/<key>".
      const rel = url.replace(/^\/+/, '');
      const diskPath = path.resolve(this.publicDir, rel);
      // Prevent path traversal outside the public directory.
      if (!diskPath.startsWith(path.resolve(this.publicDir))) return null;
      if (!fs.existsSync(diskPath)) return null;
      return { buffer: await fs.promises.readFile(diskPath) };
    } catch (err) {
      this.logger.warn(`Failed to fetch asset "${url}": ${(err as Error).message}`);
      return null;
    }
  }

  private async fetchImageForPdf(url: string): Promise<Buffer | null> {
    const asset = await this.fetchAsset(url);
    if (!asset) return null;
    return this.toJpeg(asset.buffer);
  }

  /** Normalize any supported image to a pdfkit-embeddable JPEG (auto-oriented). */
  private async toJpeg(buffer: Buffer): Promise<Buffer | null> {
    try {
      return await sharp(buffer, { failOn: 'none' })
        .rotate()
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 82 })
        .toBuffer();
    } catch {
      return null;
    }
  }

  /** Magic-byte check: PDFs start with "%PDF". Everything else is treated as an image. */
  private isPdf(buffer: Buffer): boolean {
    return buffer.length >= 4 && buffer.subarray(0, 4).toString('latin1') === '%PDF';
  }

  private isAllowedHost(host: string): boolean {
    const allow: string[] = [];
    for (const key of ['R2_PUBLIC_URL', 'R2_PUBLIC_DOMAIN', 'API_URL', 'FRONTEND_URL']) {
      const v = process.env[key];
      if (!v) continue;
      try {
        allow.push(new URL(v.startsWith('http') ? v : `https://${v}`).hostname);
      } catch {
        /* ignore malformed env */
      }
    }
    if (allow.includes(host)) return true;
    return /\.r2\.cloudflarestorage\.com$/.test(host) || /\.r2\.dev$/.test(host);
  }

  // ── Formatting ─────────────────────────────────────────────────────────────

  private fmtDate(d: Date | string | null | undefined): string {
    if (!d) return '—';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private humanize(value: string | null | undefined): string {
    if (!value) return '—';
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
