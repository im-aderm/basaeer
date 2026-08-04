import { IsArray, IsIn, IsObject, IsOptional, IsString } from 'class-validator';

/**
 * Document types that can be bulk-exported. ZIP types bundle one PDF per item;
 * ADMISSION_LIST_* types produce a single spreadsheet of the matching records.
 */
export const BULK_EXPORT_TYPES = [
  'ADMISSION_SLIP',
  'CERTIFICATE',
  'ADMISSION_LIST_EXCEL',
  'ADMISSION_LIST_CSV',
] as const;
export type BulkExportType = (typeof BULK_EXPORT_TYPES)[number];

export class BulkExportFilters {
  /** Explicit selection of record ids (always AND-ed with the caller's branch). */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];

  /** Admission records: filter by application status. */
  @IsOptional()
  @IsString()
  status?: string;

  /** Scope to an academic session where the record carries one. */
  @IsOptional()
  @IsString()
  sessionId?: string;

  /** Admission lists: free-text search across student and guardian fields. */
  @IsOptional()
  @IsString()
  search?: string;
}

export class StartBulkExportDto {
  @IsIn(BULK_EXPORT_TYPES as unknown as string[])
  type: BulkExportType;

  @IsOptional()
  @IsObject()
  filters?: BulkExportFilters;
}
