import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IntegrationsService } from '../../integrations/integrations.service';
import { REQUIRE_SCOPES_KEY } from './require-scopes.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    const keyRecord = await this.integrationsService.validateApiKey(apiKey);
    request.apiKey = keyRecord;
    request.branchId = keyRecord.branchId;

    // keyRecord.scopes was stored at creation but never actually checked
    // before — any valid key could call any @RequireScopes-annotated route
    // regardless of the scopes it was issued with.
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiredScopes?.length) {
      const grantedScopes: string[] = keyRecord.scopes || [];
      const hasAll = requiredScopes.every((s) => grantedScopes.includes(s));
      if (!hasAll) {
        throw new ForbiddenException(
          `API key is missing required scope(s): ${requiredScopes.join(', ')}`,
        );
      }
    }

    return true;
  }
}
