import { IsString, IsNotEmpty } from 'class-validator';

export class AssignTransportDto {
    @IsString()
    @IsNotEmpty()
    studentId: string;

    @IsString()
    @IsNotEmpty()
    vehicleId: string;

    @IsString()
    @IsNotEmpty()
    routeId: string;
}
