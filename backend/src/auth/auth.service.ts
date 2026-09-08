import { BCRYPT_ROUNDS } from '../common/constants/security.constants';
import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';
import { BranchBrandingService } from '../branches/branch-branding.service';
import { PrismaService } from '../prisma/prisma.service';
import { TokenBlocklistService } from './token-blocklist.service';
import { TenantContext } from './branch.guard';
import { UserRole } from '../generated/client/client';
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
    private prisma: PrismaService,
    private blocklist: TokenBlocklistService,
  ) {}

  /**
   * Revoke an access token (called on logout). Decodes the token to read its
   * jti and expiry, then records the jti in the blocklist until it would have
   * expired anyway. Tokens without a jti (issued before revocation support)
   * cannot be individually revoked — clearing the cookie is the fallback.
   */
  async revokeToken(token: string | undefined | null): Promise<void> {
    if (!token) return;
    try {
      const decoded: any = this.jwtService.decode(token);
      if (decoded?.jti && decoded?.exp) {
        const ttlSeconds = decoded.exp - Math.floor(Date.now() / 1000);
        await this.blocklist.revoke(decoded.jti, ttlSeconds);
      }
    } catch {
      // A malformed token needs no revocation.
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Opportunistically upgrade legacy weak-cost hashes on successful login.
      try {
        if (bcrypt.getRounds(user.password) < BCRYPT_ROUNDS) {
          const upgraded = await bcrypt.hash(pass, BCRYPT_ROUNDS);
          await this.usersService.updatePassword(user.id, upgraded);
        }
      } catch {
        // Never let a rehash failure block a valid login.
      }
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
      roleId: user.roleId || null,
      branchId: user.branchId,
      selectedBranchId: user.selectedBranchId || null,
      selectedSessionId: user.selectedSessionId || null,
      jti: crypto.randomUUID(),
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
        roleId: user.roleId || null,
        branchId: user.branchId,
        mustChangePassword: user.mustChangePassword || false,
        branding,
      },
    };
  }

  async getFullProfile(userId: string, context: TenantContext) {
    const user = await this.usersService.findById(userId, context);
    if (user) {
      const { password, resetTokenHash, resetTokenExpires, ...result } = user as any;
      // Attach effective permissions for frontend gating
      try {
        const rolePerms = await this.prisma.rolePermission.findMany({
          where: { role: (user as any).role, isAllowed: true },
          select: { module: true, action: true },
        });
        const customPerms = (user as any).roleId
          ? await this.prisma.customRolePermission.findMany({
              where: { roleId: (user as any).roleId, isAllowed: true },
              select: { module: true, action: true },
            })
          : [];
        const perms = [
          ...rolePerms.map((p) => `${p.module}:${p.action}`),
          ...customPerms.map((p) => `${p.module}:${p.action}`),
        ];
        (result as any).permissions = Array.from(new Set(perms));
        (result as any).roleId = (user as any).roleId || null;
      } catch {
        (result as any).permissions = [];
      }
      return result;
    }
    return null;
  }

  async createSuperAdmin() {
    return this.usersService.createSuperAdmin();
  }

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    const { password, ...rest } = data;
    return this.usersService.createUser({
      ...rest,
      password: hashedPassword,
      mustChangePassword: true,
    } as any);
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string }, context: TenantContext) {
    const user = await this.usersService.findById(userId, context);
    if (!user) throw new UnauthorizedException('User not found');
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    const { password, resetTokenHash, resetTokenExpires, ...result } = updated;
    return result;
  }

  async updateSelectedBranch(userId: string, selectedBranchId: string, context: TenantContext) {
    const user = await this.usersService.findById(userId, context);
    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      throw new UnauthorizedException('Only Super Admin can select a branch context');
    }
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      roleId: (user as any).roleId || null,
      branchId: user.branchId,
      selectedBranchId,
      jti: crypto.randomUUID(),
    };
    const access_token = this.jwtService.sign(payload);
    return { access_token, selectedBranchId };
  }

  async updateSelectedSession(userId: string, selectedSessionId: string, context: TenantContext) {
    const user = await this.usersService.findById(userId, context);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // Validate session exists and belongs to user's branch (or selected branch for SA)
    const session = await this.prisma.academicSession.findUnique({
      where: { id: selectedSessionId },
    });
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }
    if (user.role !== UserRole.SUPER_ADMIN && session.branchId !== user.branchId) {
      throw new UnauthorizedException('You do not have access to this session');
    }
    if (user.role === UserRole.SUPER_ADMIN && context.selectedBranchId && session.branchId !== context.selectedBranchId) {
      throw new UnauthorizedException('Session does not belong to selected branch');
    }
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      roleId: (user as any).roleId || null,
      branchId: user.branchId,
      selectedBranchId: context.selectedBranchId || null,
      selectedSessionId,
      jti: crypto.randomUUID(),
    };
    const access_token = this.jwtService.sign(payload);
    return { access_token, selectedSessionId };
  }

  async adminResetPassword(adminId: string, targetUserId: string, newPassword: string, context: TenantContext) {
    const admin = await this.usersService.findById(adminId, context);
    if (!admin) throw new UnauthorizedException();
    const target = await this.usersService.findById(targetUserId, context);
    if (!target) throw new NotFoundException('User not found');
    const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.usersService.updatePassword(targetUserId, hashed);
    await this.usersService.setMustChangePassword(targetUserId);
    return { message: 'Password reset successfully. User must change on next login.' };
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

    const hashedNewPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
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

    const newHashedPassword = await bcrypt.hash(newPasswordPlain, BCRYPT_ROUNDS);
    await this.usersService.updatePassword(user.id, newHashedPassword);
    await this.usersService.clearResetToken(user.id);

    return { message: 'Password has been successfully reset' };
  }
}
