import { IsString, IsNumber, IsOptional, IsJSON, IsDateString, IsInt, Min, Max } from 'class-validator';

export class CreateSalaryTemplateDto {
    @IsNumber()
    basicSalary: number;

    @IsOptional()
    @IsJSON()
    allowances?: any;

    @IsOptional()
    @IsJSON()
    deductions?: any;

    @IsNumber()
    netSalary: number;

    @IsString()
    staffId: string;

    @IsOptional()
    @IsString()
    branchId?: string;
}

export class GeneratePayrollDto {
    @IsInt()
    @Min(1)
    @Max(12)
    month: number;

    @IsInt()
    year: number;

    @IsString()
    branchId: string;
}

export class CreateLeaveRequestDto {
    @IsString()
    type: string; // SICK, CASUAL, ANNUAL

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsString()
    reason: string;
}

export class UpdateLeaveStatusDto {
    @IsString()
    status: string; // APPROVED, REJECTED
}
