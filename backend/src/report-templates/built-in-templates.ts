import { END_OF_TERM_TEMPLATE } from '../reporting/templates/end-of-term.template';
import { ANNUAL_CUMULATIVE_TEMPLATE } from '../reporting/templates/annual-cumulative.template';

export const REPORT_TEMPLATE_TYPES = {
  STUDENT_REPORT: 'STUDENT_REPORT',
  ANNUAL_CUMULATIVE: 'ANNUAL_CUMULATIVE',
  TAHFEEZ_REPORT: 'TAHFEEZ_REPORT',
  TRANSCRIPT: 'TRANSCRIPT',
} as const;

interface BuiltInTemplate {
  html: string;
  config: Record<string, any>;
}

/**
 * The starting point every branch renders from until an admin designs and
 * marks their own ReportTemplate as the default for a type. Kept as the
 * same well-built HTML/CSS the report cards already shipped with — the
 * fix in this refactor is making them actually render (Phase 1) and
 * actually reachable/overridable (this file + ReportTemplatesService).
 */
export const BUILT_IN_REPORT_TEMPLATES: Record<string, BuiltInTemplate> = {
  [REPORT_TEMPLATE_TYPES.STUDENT_REPORT]: {
    html: END_OF_TERM_TEMPLATE,
    config: {
      paperSize: 'A4',
      landscape: false,
      showWatermark: true,
      showLogo: true,
      showQrCode: true,
    },
  },
  [REPORT_TEMPLATE_TYPES.ANNUAL_CUMULATIVE]: {
    html: ANNUAL_CUMULATIVE_TEMPLATE,
    config: {
      paperSize: 'A4',
      landscape: true,
      showWatermark: true,
      showLogo: true,
      showQrCode: true,
    },
  },
};
