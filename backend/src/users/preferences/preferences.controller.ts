import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GetTenantContext } from '../../auth/tenant-context.decorator';
import { TenantContext } from '../../auth/branch.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('User Preferences')
@Controller('user-preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get()
  findOne(@GetTenantContext() ctx: TenantContext) {
    return this.preferencesService.findOne(ctx.userId);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserPreferenceDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Patch()
  update(
    @GetTenantContext() ctx: TenantContext,
    @Body() updateUserPreferenceDto: UpdateUserPreferenceDto,
  ) {
    return this.preferencesService.update(ctx.userId, updateUserPreferenceDto);
  }
}
