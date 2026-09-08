import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TokenBlocklistService } from './token-blocklist.service';

const cookieExtractor = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['access_token'];
  }
  // Fallback to Bearer token string if cookie is absent (useful for non-browser clients like Postman or mobile apps)
  return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private blocklist: TokenBlocklistService,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // 1. Reject explicitly revoked tokens (logout). Tokens issued before this
    //    feature have no jti and simply skip this check (they still expire and
    //    are subject to the isActive check below).
    if (payload.jti && (await this.blocklist.isRevoked(payload.jti))) {
      throw new UnauthorizedException('Session has been revoked');
    }

    // 2. Re-validate against the database on every request so that
    //    deactivations, deletions, and role/branch changes take effect
    //    immediately instead of lingering for the token's full lifetime.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, roleId: true, branchId: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is inactive or no longer exists');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      roleId: user.roleId || null,
      branchId: user.branchId,
      // Super-admin UI context selections live only in the token, not on the
      // user row, so they are preserved from the payload.
      selectedBranchId: payload.selectedBranchId || null,
      selectedSessionId: payload.selectedSessionId || null,
    };
  }
}
