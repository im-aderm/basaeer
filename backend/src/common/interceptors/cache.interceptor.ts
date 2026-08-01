import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import Redis from 'ioredis';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private redis: Redis;

  constructor() {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    const redisPassword = process.env.REDIS_PASSWORD;
    this.redis = new Redis({ host: redisHost, port: redisPort, password: redisPassword });
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    if (request.method !== 'GET') {
      return next.handle();
    }

    const key = `cache:${request.originalUrl || request.url}`;
    const ttlSeconds = 60;

    try {
      const cached = await this.redis.get(key);
      if (cached) {
        return of(JSON.parse(cached));
      }
    } catch {
      // Redis unavailable — proceed without cache
    }

    return next.handle().pipe(
      tap((data) => {
        // Fire-and-forget: the response pipeline shouldn't wait on the
        // cache write, so this is a floating promise on purpose.
        void (async () => {
          try {
            await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
          } catch {
            // Silently fail if Redis is down
          }
        })();
      }),
    );
  }
}
