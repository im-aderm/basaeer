import { PartialType } from '@nestjs/mapped-types';
import { CreateIdCardTemplateDto } from './create-template.dto';

export class UpdateIdCardTemplateDto extends PartialType(CreateIdCardTemplateDto) { }
