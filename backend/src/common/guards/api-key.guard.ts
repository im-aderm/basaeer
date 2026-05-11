import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { IntegrationsService } from '../../integrations/integrations.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private readonly integrationsService: IntegrationsService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) {
            throw new UnauthorizedException('API key is missing');
        }

        const keyRecord = await this.integrationsService.validateApiKey(apiKey);
        request.apiKey = keyRecord;
        request.branchId = keyRecord.branchId;

        return true;
    }
}
