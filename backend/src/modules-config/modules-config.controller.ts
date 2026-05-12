import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ModulesConfigService } from './modules-config.service';
import {
  UpsertModuleConfigDto,
  ToggleModuleDto,
} from './dto/module-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('modules')
export class ModulesConfigController {
  constructor(private readonly modulesConfigService: ModulesConfigService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAll(@Query('branchId') branchId?: string) {
    return this.modulesConfigService.findAll(branchId);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  upsert(@Body() dto: UpsertModuleConfigDto) {
    return this.modulesConfigService.upsert(dto);
  }

  @Patch(':moduleKey/toggle')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  toggle(@Param('moduleKey') moduleKey: string, @Body() dto: ToggleModuleDto) {
    return this.modulesConfigService.toggle(moduleKey, dto);
  }
}
