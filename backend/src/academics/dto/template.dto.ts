import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateReportTemplateDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsObject()
    @IsNotEmpty()
    layout: any;

    @IsObject()
    @IsNotEmpty()
    config: any;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}

export class UpdateReportTemplateDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsObject()
    layout?: any;

    @IsOptional()
    @IsObject()
    config?: any;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
