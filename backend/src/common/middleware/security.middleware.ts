import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
      return next();
    }

    // CSRF Protection: Require a custom header for state-changing requests.
    // This is effective because standard HTML forms and cross-site scripts
    // cannot set custom headers without a preflight CORS check, which 
    // would be rejected by a different origin unless explicitly allowed.
    const hasSecurityHeader = req.headers['x-requested-with'] === 'XMLHttpRequest' || !!req.headers['x-csrf-token'];
    
    if (!hasSecurityHeader) {
      throw new ForbiddenException('Security Block: Missing required X-Requested-With header to prevent CSRF.');
    }
    
    next();
  }
}
