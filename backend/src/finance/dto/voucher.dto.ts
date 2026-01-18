
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class CreateExpenseCategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsString()
    branchId: string;
}

export class CreateVoucherDto {
    @IsNotEmpty()
    @IsDateString()
    date: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    expenseCategoryId: string;

    @IsNotEmpty()
    @IsString()
    paidTo: string;

    @IsNotEmpty()
    @IsString()
    branchId: string;
}
