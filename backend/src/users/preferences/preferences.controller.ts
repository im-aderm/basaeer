import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Request } from 'express';
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
  findOne(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.preferencesService.findOne(userId);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserPreferenceDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Patch()
  update(
    @Req() req: Request,
    @Body() updateUserPreferenceDto: UpdateUserPreferenceDto,
  ) {
    const userId = (req.user as any).id;
    return this.preferencesService.update(userId, updateUserPreferenceDto);
  }
}
