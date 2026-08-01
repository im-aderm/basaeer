import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
} from './dto/template.dto';
import { BUILT_IN_REPORT_TEMPLATES } from './built-in-templates';
import { SAMPLE_REPORT_DATA } from './sample-data';
import { ReportingService } from '../reporting/reporting.service';

export interface EffectiveReportTemplate {
  html: string;
  config: Record<string, any>;
  source: 'custom' | 'built-in';
  templateId?: string;
}

@Injectable()
export class ReportTemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reportingService: ReportingService,
  ) {}

  async create(dto: CreateReportTemplateDto, branchId: string, sessionId?: string) {
    if (dto.isDefault) {
      // Unset previous default
      await this.prisma.reportTemplate.updateMany({
        where: { branchId, type: dto.type, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.reportTemplate.create({
      data: {
        ...dto,
        branchId,
        sessionId: sessionId,
      },
    });
  }

  async findAll(branchId: string) {
    return this.prisma.reportTemplate.findMany({
      where: { branchId, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, branchId: string) {
    const template = await this.prisma.reportTemplate.findFirst({
      where: { id, branchId },
    });

    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }

    return template;
  }

  async update(id: string, dto: UpdateReportTemplateDto, branchId: string) {
    await this.findOne(id, branchId);

    if (dto.isDefault) {
      const template = await this.prisma.reportTemplate.findUnique({
        where: { id },
      });
      await this.prisma.reportTemplate.updateMany({
        where: { branchId, type: template?.type, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.reportTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, branchId: string) {
    await this.findOne(id, branchId);
    return this.prisma.reportTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getDefaultTemplate(type: string, branchId: string) {
    return this.prisma.reportTemplate.findFirst({
      where: { branchId, type, isDefault: true, isActive: true },
    });
  }

  /**
   * Resolves the template a report of `type` should actually render with:
   * the branch's admin-designed default if one exists, otherwise the
   * built-in starting point. This is the one place report generation should
   * ask "which template" — previously exams.controller.ts hardcoded the
   * static END_OF_TERM_TEMPLATE/ANNUAL_CUMULATIVE_TEMPLATE constants
   * directly, so a branch admin designing a custom template here had zero
   * effect on the PDF a student/parent actually received.
   */
  async getEffectiveTemplate(
    type: string,
    branchId: string,
  ): Promise<EffectiveReportTemplate> {
    const custom = await this.getDefaultTemplate(type, branchId);
    if (custom && custom.layout && (custom.layout as any).html) {
      return {
        html: (custom.layout as any).html,
        config: (custom.config as any) || {},
        source: 'custom',
        templateId: custom.id,
      };
    }
    const builtIn = BUILT_IN_REPORT_TEMPLATES[type];
    if (!builtIn) {
      throw new NotFoundException(
        `No template available for report type ${type}`,
      );
    }
    return { html: builtIn.html, config: builtIn.config, source: 'built-in' };
  }

  /**
   * Renders a draft (not-yet-saved) template against representative sample
   * data, so the designer UI can show a true WYSIWYG preview through the
   * exact same Handlebars+Puppeteer pipeline real report generation uses,
   * rather than an approximate mock rendered in React.
   */
  async preview(type: string, layout: any): Promise<string> {
    const html = layout?.html;
    if (!html || typeof html !== 'string') {
      throw new BadRequestException('layout.html is required to preview a template');
    }
    const sampleData = SAMPLE_REPORT_DATA[type];
    if (!sampleData) {
      throw new BadRequestException(`No sample data available for report type ${type}`);
    }
    return this.reportingService.fillTemplate(html, sampleData);
  }
}
