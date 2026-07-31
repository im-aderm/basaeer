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
import { Permissions } from '../auth/permissions.decorator';
import { UserRole } from '../generated/client/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('Translations')
@Controller('translations')
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve By Locale' })
  @Get(':locale')
  findByLocale(
    @Param('locale') locale: string,
    @Query('group') group?: string,
  ) {
    return this.translationsService.findByLocale(locale, group);
  }

  @ApiBearerAuth()
  @ApiBody({ type: BulkUpsertTranslationsDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Bulk Upsert' })
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('translations:create')
  @Roles(UserRole.SUPER_ADMIN)
  bulkUpsert(@Body() dto: BulkUpsertTranslationsDto) {
    return this.translationsService.bulkUpsert(dto);
  }
}
