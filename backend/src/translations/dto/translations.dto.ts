import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertTranslationDto {
  @IsString()
  locale: string;

  @IsString()
  group: string;

  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class BulkUpsertTranslationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertTranslationDto)
  translations: UpsertTranslationDto[];
}
