import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Permissions' })
  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  getPermissions() {
    return this.permissionsService.getPermissions();
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve My Permissions' })
  @Get('my')
  getMyPermissions(@Request() req: any) {
    return this.permissionsService.getPermissions(req.user.role);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Role Permissions' })
  @Get(':role')
  @Roles(UserRole.SUPER_ADMIN)
  getRolePermissions(@Param('role') role: UserRole) {
    return this.permissionsService.getPermissions(role);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Update Permission' })
  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  updatePermission(@Body() dto: UpdatePermissionDto) {
    return this.permissionsService.updatePermission(dto);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Bulk Update Permissions' })
  @Post(':role')
  @Roles(UserRole.SUPER_ADMIN)
  bulkUpdatePermissions(
    @Param('role') role: UserRole,
    @Body() permissions: UpdatePermissionDto[],
  ) {
    return this.permissionsService.bulkUpdatePermissions(role, permissions);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Seed Permissions' })
  @Post('seed')
  @Roles(UserRole.SUPER_ADMIN)
  seedPermissions() {
    return this.permissionsService.seedInitialPermissions();
  }
}
