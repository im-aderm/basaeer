import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class GenerateIdCardsDto {
    @IsString()
    @IsNotEmpty()
    templateId: string;

    @IsString()
    @IsNotEmpty()
    sessionId: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    studentIds?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    staffIds?: string[];
}
