import { IsString, IsNotEmpty, IsOptional, IsObject, IsUUID } from 'class-validator';

export class CreateCertificateTemplateDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsOptional()
    @IsString()
    backgroundImage?: string;

    @IsObject()
    @IsNotEmpty()
    config: any;

    @IsUUID()
    @IsNotEmpty()
    branchId: string;
}
