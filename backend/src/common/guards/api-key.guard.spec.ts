import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyGuard } from './api-key.guard';
import { IntegrationsService } from '../../integrations/integrations.service';
import { REQUIRE_SCOPES_KEY } from './require-scopes.decorator';

/**
 * Regression tests for the finding that ApiKey.scopes was stored at
 * creation but never actually checked — any valid key could call any
 * public-api route regardless of its assigned scopes.
 */
describe('ApiKeyGuard scope enforcement', () => {
  let guard: ApiKeyGuard;
  let integrationsService: { validateApiKey: jest.Mock };
  let reflector: Reflector;

  const makeContext = (requiredScopes?: string[]) => {
    if (requiredScopes) {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredScopes);
    } else {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    }
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { 'x-api-key': 'test-key' } }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  beforeEach(async () => {
    integrationsService = { validateApiKey: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyGuard,
        Reflector,
        { provide: IntegrationsService, useValue: integrationsService },
      ],
    }).compile();

    guard = module.get<ApiKeyGuard>(ApiKeyGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('allows a key with the required scope', async () => {
    integrationsService.validateApiKey.mockResolvedValue({
      branchId: 'branch-1',
      scopes: ['students:read', 'attendance:read'],
    });
    await expect(guard.canActivate(makeContext(['students:read']))).resolves.toBe(true);
  });

  it('rejects a key missing the required scope', async () => {
    integrationsService.validateApiKey.mockResolvedValue({
      branchId: 'branch-1',
      scopes: ['attendance:read'],
    });
    await expect(guard.canActivate(makeContext(['students:read']))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows any valid key when the route declares no required scopes', async () => {
    integrationsService.validateApiKey.mockResolvedValue({
      branchId: 'branch-1',
      scopes: [],
    });
    await expect(guard.canActivate(makeContext(undefined))).resolves.toBe(true);
  });

  it('still rejects a request with no API key at all', async () => {
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
