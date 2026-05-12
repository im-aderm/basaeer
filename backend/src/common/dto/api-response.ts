import { TenantContext } from '../../auth/branch.guard';

/**
 * Standardized API success response wrapper.
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
  path?: string;
}

/**
 * Standardized API error response wrapper.
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: unknown;
}

/**
 * Standardized paginated response wrapper.
 */
export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
}

/**
 * Helper to create a success response.
 */
export function apiOk<T>(data: T, path?: string): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    path,
  };
}

/**
 * Helper to create a paginated response.
 */
export function apiPaginated<T>(
  data: T[],
  meta: { total: number; page: number; limit: number; totalPages: number },
  path?: string,
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
}
