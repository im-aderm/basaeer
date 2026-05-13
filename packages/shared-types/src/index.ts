export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BRANCH_ADMIN = 'BRANCH_ADMIN',
  TEACHER = 'TEACHER',
  HOD = 'HOD',
  PRINCIPAL = 'PRINCIPAL',
  EXAM_OFFICER = 'EXAM_OFFICER',
  ACADEMIC_OFFICER = 'ACADEMIC_OFFICER',
  ACCOUNTANT = 'ACCOUNTANT',
  HR = 'HR',
  LIBRARIAN = 'LIBRARIAN',
  HOSTEL_ADMIN = 'HOSTEL_ADMIN',
  TRANSPORT_OFFICER = 'TRANSPORT_OFFICER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  RECEPTIONIST = 'RECEPTIONIST',
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Reporting & Analytics ──────────────────────────────────────────────────

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface BaseReportFilter extends DateRangeFilter {
  branchId?: string;
  search?: string;
}

export interface AnalyticsSummaryItem {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: string;
  color?: string;
}

export interface ChartDataItem {
  name: string;
  [key: string]: string | number;
}

export interface AnalyticsData {
  summary: AnalyticsSummaryItem[];
  charts: {
    [key: string]: ChartDataItem[];
  };
  breakdowns?: {
    [key: string]: any;
  };
}

export enum ExportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  EXCEL = 'xlsx',
}

// ── Settings & Configuration ───────────────────────────────────────────────

export interface SystemSettings {
  schoolName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  timezone: string;
  language: string;
  currency: string;
  academicSessionId?: string;
}

export interface ModuleState {
  key: string;
  isEnabled: boolean;
  name: string;
  description?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  sidebarCollapsed: boolean;
}

export interface Permission {
  module: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'MANAGE';
  isAllowed: boolean;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details?: string;
  createdAt: string;
  ipAddress?: string;
}
