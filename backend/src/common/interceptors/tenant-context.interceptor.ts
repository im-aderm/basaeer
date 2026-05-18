import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantStorage, TenantStore } from '../../prisma/prisma.service';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const ctx = request.tenantContext;

    if (!ctx) {
      return next.handle();
    }

    const store: TenantStore = {
      branchId: ctx.branchId ?? null,
      sessionId: ctx.sessionId ?? null,
      userId: ctx.userId,
      isSuperAdmin: ctx.isSuperAdmin ?? false,
    };

    return new Observable((subscriber) => {
      tenantStorage.run(store, () => {
        next.handle().subscribe({
          next: (val) => subscriber.next(val),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
