import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('user-preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  findOne(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.preferencesService.findOne(userId);
  }

  @Patch()
  update(
    @Req() req: Request,
    @Body() updateUserPreferenceDto: UpdateUserPreferenceDto,
  ) {
    const userId = (req.user as any).id;
    return this.preferencesService.update(userId, updateUserPreferenceDto);
  }
}
