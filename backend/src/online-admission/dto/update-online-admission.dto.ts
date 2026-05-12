import { PartialType } from '@nestjs/mapped-types';
import { CreateOnlineAdmissionDto } from './create-online-admission.dto';

export class UpdateOnlineAdmissionDto extends PartialType(
  CreateOnlineAdmissionDto,
) {}
