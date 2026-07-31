import { SetMetadata } from '@nestjs/common';

export const REQUIRE_SCOPES_KEY = 'requireScopes';

/**
 * Declares which ApiKey.scopes entries a public-api route needs. Paired
 * with ApiKeyGuard, which previously never checked this at all — any valid
 * key could call any public-api route regardless of the scopes it was
 * created with.
 */
export const RequireScopes = (...scopes: string[]) =>
  SetMetadata(REQUIRE_SCOPES_KEY, scopes);
