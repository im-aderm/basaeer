import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';
import { BranchBrandingService } from '../branches/branch-branding.service';
import { TenantContext } from './branch.guard';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private auditService: AuditService,
    private brandingService: BranchBrandingService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      branchId: user.branchId,
    };

    this.auditService.logAction(
      user.id,
      'LOGIN',
      'auth',
      user.branchId,
      'Successful login',
    ).catch(() => {});

    let branding = null;
    if (user.branchId) {
      branding = await this.brandingService.getBranding(user.branchId).catch(() => null);
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        branchId: user.branchId,
        mustChangePassword: user.mustChangePassword || false,
        branding,
      },
    };
  }

  async getFullProfile(userId: string, context: TenantContext) {
    const user = await this.usersService.findById(userId, context);
    if (user) {
      const { password, resetTokenHash, resetTokenExpires, ...result } = user;
      return result;
    }
    return null;
  }

  async createSuperAdmin() {
    return this.usersService.createSuperAdmin();
  }

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const { password, ...rest } = data;
    return this.usersService.createUser({
      ...rest,
      password: hashedPassword,
      mustChangePassword: true,
    } as any);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string, context: TenantContext) {
    const user = await this.usersService.findById(userId, context);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(userId, hashedNewPassword);
    await this.usersService.clearMustChangePassword(userId);

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      // Do not reveal if user exists or not
      return {
        message:
          'If that email address is in our database, we will send you an email to reset your password.',
      };
    }

    // Generate a random 32-character token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Hash the token using sha256 before storage
    const hash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await this.usersService.setPasswordResetToken(user.id, hash, expires);

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&id=${user.id}`;

    await this.mailService.sendPasswordReset(user.email, resetLink);

    return {
      message:
        'If that email address is in our database, we will send you an email to reset your password.',
    };
  }

  async resetPassword(userId: string, token: string, newPasswordPlain: string) {
    // Hash the input token to match the stored hash
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.usersService.findByResetToken(hash);
    if (!user || user.id !== userId) {
      throw new UnauthorizedException(
        'Invalid or expired password reset token',
      );
    }

    const newHashedPassword = await bcrypt.hash(newPasswordPlain, 10);
    await this.usersService.updatePassword(user.id, newHashedPassword);
    await this.usersService.clearResetToken(user.id);

    return { message: 'Password has been successfully reset' };
  }
}
