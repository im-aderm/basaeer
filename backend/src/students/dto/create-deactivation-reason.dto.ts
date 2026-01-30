import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDeactivationReasonDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    branchId?: string;
}
