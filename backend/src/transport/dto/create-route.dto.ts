import { IsString, IsOptional, IsNotEmpty, IsObject } from 'class-validator';

export class CreateRouteDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    startPoint: string;

    @IsString()
    @IsNotEmpty()
    endPoint: string;

    @IsOptional()
    @IsObject()
    stops?: any;

    @IsString()
    @IsNotEmpty()
    branchId: string;
}
