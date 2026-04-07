import { Controller, Request, Post, UseGuards, Body, UnauthorizedException, Get, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../generated/client/client';
import { LoginDto } from './dto/login.dto';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.authService.login(user);
  }

  /**
   * Bootstrap: creates the initial SuperAdmin.
   * SECURED: Requires a secret token from the environment.
   * Only usable once — if a SuperAdmin already exists, it rejects.
   */
  @Post('bootstrap')
  async bootstrap(@Body() body: { bootstrapToken?: string }) {
    const expectedToken = process.env.BOOTSTRAP_SECRET;
    if (!expectedToken) {
      throw new ForbiddenException('Bootstrap is disabled on this server.');
    }
    if (!body.bootstrapToken || body.bootstrapToken !== expectedToken) {
      throw new ForbiddenException('Invalid bootstrap token.');
    }
    return this.authService.createSuperAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('register')
  async register(@Body() data: any) {
    return this.authService.register(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    // Return the full user record from the database, not just the JWT payload
    return this.authService.getFullProfile(req.user.sub);
  }
}
