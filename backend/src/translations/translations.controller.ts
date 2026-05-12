import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { BulkUpsertTranslationsDto } from './dto/translations.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@Controller('translations')
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Get(':locale')
  findByLocale(
    @Param('locale') locale: string,
    @Query('group') group?: string,
  ) {
    return this.translationsService.findByLocale(locale, group);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  bulkUpsert(@Body() dto: BulkUpsertTranslationsDto) {
    return this.translationsService.bulkUpsert(dto);
  }
}
