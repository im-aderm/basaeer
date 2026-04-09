
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

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
    constructor() {
        super({
            jwtFromRequest: cookieExtractor,
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'secretKey', // In production use env var
        });
    }

    async validate(payload: any) {
        return { id: payload.sub, email: payload.email, role: payload.role, branchId: payload.branchId };
    }
}
