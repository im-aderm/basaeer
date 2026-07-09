import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
      return next();
    }

    // CSRF only threatens COOKIE-based (ambient) authentication: the browser
    // auto-attaches the auth cookie to a forged cross-site request. Requests
    // that do NOT carry the auth cookie — Bearer-token API clients, API-key
    // integrations, and signed provider webhooks (e.g. Paystack's
    // x-paystack-signature) — cannot be forged this way, so requiring a custom
    // header on them serves no security purpose and previously 403'd legitimate
    // webhooks. Skip the check when there is no auth cookie.
    const hasAuthCookie = !!(req as any).cookies?.access_token;
    if (!hasAuthCookie) {
      return next();
    }

    // CSRF Protection for browser sessions: require a custom header on
    // state-changing requests. Standard HTML forms and cross-site scripts
    // cannot set custom headers without a CORS preflight, which a foreign
    // origin cannot pass.
    const hasSecurityHeader =
      req.headers['x-requested-with'] === 'XMLHttpRequest' ||
      !!req.headers['x-csrf-token'];

    if (!hasSecurityHeader) {
      throw new ForbiddenException(
        'Security Block: Missing required X-Requested-With header to prevent CSRF.',
      );
    }

    next();
  }
}
