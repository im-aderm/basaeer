import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  UnauthorizedException,
  Get,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
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
import { GetTenantContext } from './tenant-context.decorator';
import { TenantContext } from './branch.guard';
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
  constructor(private authService: AuthService) {}

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
  async logout(@Res({ passthrough: true }) response: Response) {
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
    return this.authService.getFullProfile(tenantContext.userId);
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
}
