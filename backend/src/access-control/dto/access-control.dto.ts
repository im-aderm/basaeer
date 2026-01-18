import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateAccessLogDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsEnum(['ENTRY', 'EXIT'])
    direction: 'ENTRY' | 'EXIT';

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    deviceInfo?: string;
}
