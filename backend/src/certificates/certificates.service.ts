import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CreateCertificateTemplateDto } from './dto/create-template.dto';
import PDFDocument from 'pdfkit';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCertificateDto: CreateCertificateDto,
    issuedByUserId: string,
    context: TenantContext,
  ) {
    const branchId = createCertificateDto.branchId || context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    return this.prisma.certificate.create({
      data: {
        ...createCertificateDto,
        branchId,
        issuedByUserId,
      },
      include: {
        student: {
          include: {
            user: true,
            class: true,
          },
        },
        issuedBy: true,
      },
    });
  }

  async findAll(context: TenantContext) {
    return this.prisma.certificate.findMany({
      where: TenantHelper.applyIsolation({}, context),
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, context: TenantContext) {
    const cert = await this.prisma.certificate.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
      include: {
        student: {
          include: {
            user: true,
            class: true,
            branch: true,
          },
        },
        issuedBy: true,
      },
    });
    if (!cert)
      throw new NotFoundException('Certificate not found or access denied');
    return cert;
  }

  async findByUser(userId: string, context: TenantContext) {
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ userId }, context),
    });

    if (!student) return [];

    return this.findByStudent(student.id, context);
  }

  async findByStudent(studentId: string, context: TenantContext) {
    return this.prisma.certificate.findMany({
      where: TenantHelper.applyIsolation({ studentId }, context),
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, context: TenantContext) {
    await this.findOne(id, context);
    return this.prisma.certificate.delete({
      where: { id },
    });
  }

  // Template Operations
  async createTemplate(
    dto: CreateCertificateTemplateDto,
    context: TenantContext,
  ) {
    const branchId = dto.branchId || context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    return this.prisma.certificateTemplate.create({
      data: { ...dto, branchId },
    });
  }

  async findAllTemplates(context: TenantContext) {
    return this.prisma.certificateTemplate.findMany({
      where: TenantHelper.applyIsolation({}, context),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTemplate(id: string, context: TenantContext) {
    const template = await this.prisma.certificateTemplate.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!template)
      throw new NotFoundException('Template not found or access denied');
    return template;
  }

  async removeTemplate(id: string, context: TenantContext) {
    await this.findTemplate(id, context);
    return this.prisma.certificateTemplate.delete({
      where: { id },
    });
  }

  // PDF Generation
  async generatePDF(id: string, context: TenantContext): Promise<Buffer> {
    const certificate = await this.findOne(id, context);

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 50,
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Background / Border
      doc
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(2)
        .stroke('#1a365d');
      doc
        .rect(25, 25, doc.page.width - 50, doc.page.height - 50)
        .lineWidth(1)
        .stroke('#1a365d');

      // Header
      doc
        .fontSize(30)
        .font('Helvetica-Bold')
        .fillColor('#1a365d')
        .text('CERTIFICATE OF ' + certificate.type, 0, 80, { align: 'center' });

      doc.moveDown();
      doc
        .fontSize(16)
        .font('Helvetica')
        .fillColor('#4a5568')
        .text('This is to certify that', { align: 'center' });

      doc.moveDown();
      doc
        .fontSize(36)
        .font('Helvetica-Bold')
        .fillColor('#2d3748')
        .text(
          `${certificate.student.firstName} ${certificate.student.lastName}`,
          { align: 'center' },
        );

      doc.moveDown(0.5);
      doc
        .fontSize(14)
        .font('Helvetica')
        .fillColor('#4a5568')
        .text(`Student ID: ${certificate.student.id.split('-')[0]}`, {
          align: 'center',
        });

      doc.moveDown();
      const description = this.getCertificateDescription(certificate);
      doc
        .fontSize(16)
        .font('Helvetica-Oblique')
        .fillColor('#4a5568')
        .text(description, { align: 'center', width: 600, indent: 50 });

      // Footer
      const bottomY = doc.page.height - 150;

      // Left: Date
      doc
        .fontSize(12)
        .font('Helvetica')
        .text('Issue Date:', 100, bottomY)
        .font('Helvetica-Bold')
        .text(
          new Date(certificate.issueDate).toLocaleDateString(),
          100,
          bottomY + 20,
        );

      // Right: Signature
      doc
        .fontSize(12)
        .font('Helvetica')
        .text('Authorized Signature', doc.page.width - 250, bottomY, {
          align: 'center',
          width: 150,
        });
      doc
        .moveTo(doc.page.width - 250, bottomY - 5)
        .lineTo(doc.page.width - 100, bottomY - 5)
        .stroke();

      // Verification QR Placeholder (text for now)
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#a0aec0')
        .text(
          `Verification Code: ${certificate.verificationCode}`,
          0,
          doc.page.height - 60,
          { align: 'center' },
        );

      doc.text(
        `Verify at: basaeer-verify.edu/v/${certificate.verificationCode}`,
        0,
        doc.page.height - 50,
        { align: 'center' },
      );

      doc.end();
    });
  }

  private getCertificateDescription(cert: any): string {
    const student = cert.student;
    const className = student.class?.name || 'N/A';

    switch (cert.type) {
      case 'TRANSFER':
        return `has been a student of ${className} at our institution. We wish them the very best in their future endeavors as they transition to their next academic chapter.`;
      case 'CHARACTER':
        return `has demonstrated exemplary behavior and moral conduct during their tenure at our institution. Their dedication to school values and community spirit is highly commendable.`;
      case 'ACHIEVEMENT':
        return `is hereby recognized for outstanding academic performance and dedication to excellence in their studies.`;
      default:
        return `is recognized for their commitment and participation in the academic programs of our institution.`;
    }
  }

  async verify(code: string) {
    return this.prisma.certificate.findUnique({
      where: { verificationCode: code },
      include: {
        student: {
          include: {
            user: true,
            class: true,
            branch: true,
          },
        },
        issuedBy: true,
      },
    });
  }
}
