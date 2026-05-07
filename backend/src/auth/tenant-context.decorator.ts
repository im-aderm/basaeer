import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext } from './branch.guard';

export const GetTenantContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantContext;
  },
);
