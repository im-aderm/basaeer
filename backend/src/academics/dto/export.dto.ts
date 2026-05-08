import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';

export enum ExportType {
    REPORT_CARD = 'REPORT_CARD',
    TRANSCRIPT = 'TRANSCRIPT',
    BROADSHEET = 'BROADSHEET',
    ANALYTICS = 'ANALYTICS',
    CSV = 'CSV',
    EXCEL = 'EXCEL',
}

export class StartExportDto {
    @IsEnum(ExportType)
    @IsNotEmpty()
    type: ExportType;

    @IsObject()
    @IsOptional()
    parameters?: any;
}
