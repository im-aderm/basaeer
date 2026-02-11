import { IsString, IsNumber, IsOptional, IsJSON, IsDateString, IsInt, Min, Max, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateSalaryTemplateDto {
    @IsNumber()
    @IsNotEmpty()
    basicSalary: number;

    @IsOptional()
    @IsJSON()
    allowances?: any;

    @IsOptional()
    @IsJSON()
    deductions?: any;

    @IsNumber()
    @IsNotEmpty()
    netSalary: number;

    @IsString()
    @IsNotEmpty()
    staffId: string;

    @IsOptional()
    @IsString()
    branchId?: string;
}

export class GeneratePayrollDto {
    @IsInt()
    @Min(1)
    @Max(12)
    @IsNotEmpty()
    month: number;

    @IsInt()
    @IsNotEmpty()
    year: number;

    @IsString()
    @IsNotEmpty()
    branchId: string;
}

export class CreateLeaveRequestDto {
    @IsString()
    @IsNotEmpty()
    type: string; // SICK, CASUAL, ANNUAL

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @IsString()
    @IsNotEmpty()
    reason: string;
}

export class UpdateLeaveStatusDto {
    @IsString()
    @IsNotEmpty()
    status: string; // APPROVED, REJECTED
}
