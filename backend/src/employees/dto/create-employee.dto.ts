import { IsString, IsOptional } from 'class-validator';
import { UserRole } from '../../generated/client/client';

export class CreateEmployeeDto {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    @IsOptional()
    @IsString()
    branchId?: string;
    role: UserRole;
    phone?: string;
    departmentId?: string;
    designationId?: string;
}
