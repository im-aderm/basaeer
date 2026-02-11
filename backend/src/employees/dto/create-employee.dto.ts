import { IsString, IsOptional, IsEmail, IsNotEmpty, IsEnum, IsPhoneNumber } from 'class-validator';
import { UserRole } from '../../generated/client/client';

export class CreateEmployeeDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsOptional()
    @IsString()
    branchId?: string;

    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    departmentId?: string;

    @IsOptional()
    @IsString()
    designationId?: string;
}
