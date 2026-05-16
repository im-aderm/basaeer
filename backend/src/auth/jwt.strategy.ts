import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

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
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Super Admin uses selectedBranchId (if set), others use their own branchId
    const effectiveBranchId = payload.role === 'SUPER_ADMIN'
      ? (payload.selectedBranchId || null)
      : payload.branchId;

    this.prisma.setTenantContext(effectiveBranchId, payload.sub);

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      branchId: payload.branchId,
      selectedBranchId: payload.selectedBranchId || null,
    };
  }
}
