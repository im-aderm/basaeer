import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Server-side JWT revocation list.
 *
 * Access tokens are stateless, so "logout" cannot invalidate them on its own.
 * We give every newly-issued token a `jti` (unique id) and, on logout, record
 * that jti in Redis until the token's natural expiry. The JWT strategy checks
 * this list on every request and rejects revoked tokens.
 *
 * Availability note: `isRevoked` fails OPEN (treats Redis errors as "not
 * revoked") so a transient Redis blip cannot lock out the entire user base.
 * This is safe because the strategy also performs a per-request database check
 * of the user's `isActive` flag, which is the stronger guarantee — the
 * blocklist is a best-effort improvement for the stolen-token / explicit-logout
 * case, not the sole line of defence.
 */
@Injectable()
export class TokenBlocklistService implements OnModuleDestroy {
  private readonly logger = new Logger(TokenBlocklistService.name);
  private readonly redis: Redis;
  private static readonly PREFIX = 'jwt:blocklist:';

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      // Do not spin forever on a dead Redis during a single request.
      maxRetriesPerRequest: 1,
      lazyConnect: false,
    });
    this.redis.on('error', (err) => {
      // Logged at debug level to avoid flooding logs if Redis is briefly down;
      // isRevoked/revoke handle the failure gracefully.
      this.logger.debug(`Redis blocklist connection error: ${err.message}`);
    });
  }

  /** Revoke a token by its jti until `ttlSeconds` from now (its natural expiry). */
  async revoke(jti: string, ttlSeconds: number): Promise<void> {
    if (!jti || ttlSeconds <= 0) return;
    try {
      await this.redis.set(
        `${TokenBlocklistService.PREFIX}${jti}`,
        '1',
        'EX',
        Math.ceil(ttlSeconds),
      );
    } catch (err) {
      // Failing to record a revocation is logged but not fatal; the token will
      // still expire naturally and the per-request isActive check still applies.
      this.logger.warn(
        `Failed to revoke token ${jti}: ${(err as Error).message}`,
      );
    }
  }

  /** True if the token was explicitly revoked. Fails open on Redis errors. */
  async isRevoked(jti: string): Promise<boolean> {
    if (!jti) return false;
    try {
      const hit = await this.redis.get(
        `${TokenBlocklistService.PREFIX}${jti}`,
      );
      return hit !== null;
    } catch {
      return false; // fail open — availability over best-effort revocation
    }
  }

  onModuleDestroy(): void {
    this.redis.disconnect();
  }
}
