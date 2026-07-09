import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  UnauthorizedException,
  Get,
  Patch,
  Param,
  ForbiddenException,
  Req,
  Res,
} from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
import * as crypto from 'crypto';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { BranchGuard } from './branch.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../generated/client/client';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetTenantContext } from './tenant-context.decorator';
import { TenantContext } from './branch.guard';
import { AuditService } from '../audit/audit.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private auditService: AuditService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Login' })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      this.auditService.logAction(
        'unknown',
        'LOGIN_FAILED',
        'auth',
        undefined,
        `Failed login attempt for email: ${loginDto.email}`,
      ).catch(() => {});
      throw new UnauthorizedException('Invalid email or password');
    }
    const authData = await this.authService.login(user);

    // Set httpOnly cookie
    response.cookie('access_token', authData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matching the typical jwt lifespan)
    });

    // Return the user and the access_token for client-side use (e.g. Socket.io)
    return {
      user: authData.user,
      access_token: authData.access_token,
    };
  }

  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Logout' })
  @Post('logout')
  async logout(
    @Req() request: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Revoke the token server-side so it cannot be replayed after logout,
    // then clear the cookie. Accepts the token from the cookie or a Bearer header.
    const token =
      (request as any).cookies?.access_token ||
      request.headers.authorization?.replace(/^Bearer\s+/i, '');
    await this.authService.revokeToken(token);

    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { success: true, message: 'Successfully logged out' };
  }

  /**
   * Bootstrap: creates the initial SuperAdmin.
   * SECURED: Requires a secret token from the environment.
   * Only usable once — if a SuperAdmin already exists, it rejects.
   */
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Bootstrap' })
  @Post('bootstrap')
  async bootstrap(@Body() body: { bootstrapToken?: string }) {
    const expectedToken = process.env.BOOTSTRAP_SECRET;
    if (!expectedToken) {
      throw new ForbiddenException('Bootstrap is disabled on this server.');
    }
    const expected = Buffer.from(expectedToken, 'utf8');
    const provided = Buffer.from(body.bootstrapToken || '', 'utf8');
    if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
      throw new ForbiddenException('Invalid bootstrap token.');
    }
    return this.authService.createSuperAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @UseGuards(JwtAuthGuard, BranchGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Profile' })
  @Get('profile')
  async getProfile(@GetTenantContext() tenantContext: TenantContext) {
    return this.authService.getFullProfile(tenantContext.userId, tenantContext);
  }

  @UseGuards(JwtAuthGuard, BranchGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiOperation({ summary: 'Update Profile' })
  @Patch('profile')
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @GetTenantContext() tenantContext: TenantContext,
  ) {
    return this.authService.updateProfile(tenantContext.userId, dto, tenantContext);
  }

  @UseGuards(JwtAuthGuard, BranchGuard)
  @ApiBearerAuth()
  @ApiBody({ schema: { type: 'object', properties: { branchId: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Branch context selected' })
  @ApiOperation({ summary: 'Select Branch Context' })
  @Post('select-branch')
  async selectBranch(
    @Body('branchId') branchId: string,
    @GetTenantContext() tenantContext: TenantContext,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.updateSelectedBranch(tenantContext.userId, branchId, tenantContext);
    // Update the httpOnly cookie with the new JWT
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return result;
  }

  @UseGuards(JwtAuthGuard, BranchGuard)
  @ApiBearerAuth()
  @ApiBody({ schema: { type: 'object', properties: { sessionId: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Session context selected' })
  @ApiOperation({ summary: 'Select Session Context' })
  @Post('select-session')
  async selectSession(
    @Body('sessionId') sessionId: string,
    @GetTenantContext() tenantContext: TenantContext,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.updateSelectedSession(tenantContext.userId, sessionId, tenantContext);
    // Update the httpOnly cookie with the new JWT
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiBody({ type: AdminResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiOperation({ summary: 'Admin Reset User Password' })
  @Post('admin/reset-password/:userId')
  async adminResetPassword(
    @Param('userId') userId: string,
    @Body() dto: AdminResetPasswordDto,
    @GetTenantContext() tenantContext: TenantContext,
  ) {
    return this.authService.adminResetPassword(tenantContext.userId, userId, dto.newPassword, tenantContext);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiBearerAuth()
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Forgot Password' })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Reset Password' })
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.id,
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard, BranchGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiOperation({ summary: 'Change Password' })
  @Post('change-password')
  async changePassword(
    @GetTenantContext() tenantContext: TenantContext,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      tenantContext.userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
      tenantContext,
    );
  }
}
