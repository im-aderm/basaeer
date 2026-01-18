import { PartialType } from '@nestjs/mapped-types';
import { CreateOnlineAdmissionDto } from './create-online-admission.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOnlineAdmissionDto extends PartialType(CreateOnlineAdmissionDto) {
    @IsOptional()
    @IsString()
    status?: string;
}
