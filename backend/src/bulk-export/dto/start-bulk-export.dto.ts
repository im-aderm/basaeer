import { IsArray, IsIn, IsObject, IsOptional, IsString } from 'class-validator';

/** Document types that can be bulk-exported as a ZIP of per-item PDFs. */
export const BULK_EXPORT_TYPES = ['ADMISSION_SLIP', 'CERTIFICATE'] as const;
export type BulkExportType = (typeof BULK_EXPORT_TYPES)[number];

export class BulkExportFilters {
  /** Explicit selection of record ids (always AND-ed with the caller's branch). */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];

  /** Admission slips: filter by application status. */
  @IsOptional()
  @IsString()
  status?: string;

  /** Scope to an academic session where the record carries one. */
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class StartBulkExportDto {
  @IsIn(BULK_EXPORT_TYPES as unknown as string[])
  type: BulkExportType;

  @IsOptional()
  @IsObject()
  filters?: BulkExportFilters;
}
