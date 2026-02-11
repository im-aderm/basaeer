import { IsString, IsInt, IsOptional, IsNotEmpty, Min } from 'class-validator';

export class CreateVehicleDto {
    @IsString()
    @IsNotEmpty()
    registrationNumber: string;

    @IsString()
    @IsNotEmpty()
    model: string;

    @IsInt()
    @Min(1)
    capacity: number;

    @IsString()
    @IsNotEmpty()
    driverName: string;

    @IsString()
    @IsOptional()
    driverPhone?: string;

    @IsString()
    @IsNotEmpty()
    branchId: string;
}
