import { IsString, IsNotEmpty, IsOptional, IsObject, IsUUID } from 'class-validator';

export class CreateCertificateDto {
    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    certificateNumber: string;

    @IsUUID()
    @IsNotEmpty()
    studentId: string;

    @IsUUID()
    @IsNotEmpty()
    branchId: string;

    @IsOptional()
    @IsObject()
    content?: any;

    @IsOptional()
    @IsUUID()
    templateId?: string;
}
