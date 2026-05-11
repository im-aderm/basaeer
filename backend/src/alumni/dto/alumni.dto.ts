import { IsString, IsInt, IsOptional, IsBoolean, IsDateString, IsUUID } from 'class-validator';

export class CreateAlumniProfileDto {
    @IsUUID()
    @IsOptional()
    studentId?: string;

    @IsUUID()
    userId: string;

    @IsInt()
    graduationYear: number;

    @IsString()
    @IsOptional()
    currentCompany?: string;

    @IsString()
    @IsOptional()
    currentRole?: string;

    @IsString()
    @IsOptional()
    university?: string;

    @IsString()
    @IsOptional()
    courseOfStudy?: string;

    @IsString()
    @IsOptional()
    achievements?: string;

    @IsBoolean()
    @IsOptional()
    isMentoring?: boolean;
}

export class UpdateAlumniProfileDto {
    @IsInt()
    @IsOptional()
    graduationYear?: number;

    @IsString()
    @IsOptional()
    currentCompany?: string;

    @IsString()
    @IsOptional()
    currentRole?: string;

    @IsString()
    @IsOptional()
    university?: string;

    @IsString()
    @IsOptional()
    courseOfStudy?: string;

    @IsString()
    @IsOptional()
    achievements?: string;

    @IsBoolean()
    @IsOptional()
    isMentoring?: boolean;
}

export class CreateAlumniEventDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsDateString()
    date: string;

    @IsString()
    location: string;
}
