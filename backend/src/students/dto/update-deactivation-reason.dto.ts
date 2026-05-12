import { PartialType } from '@nestjs/mapped-types';
import { CreateDeactivationReasonDto } from './create-deactivation-reason.dto';

export class UpdateDeactivationReasonDto extends PartialType(
  CreateDeactivationReasonDto,
) {}
