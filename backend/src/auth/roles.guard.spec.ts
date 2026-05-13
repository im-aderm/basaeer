import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UserRole } from '../generated/client/client';
import { ROLES_KEY } from './roles.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        Reflector,
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should deny access when no roles are required', () => {
    const mockContext = {
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: UserRole.TEACHER } }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
      if (key === IS_PUBLIC_KEY) return undefined;
      if (key === ROLES_KEY) return undefined;
      return undefined;
    });

    expect(guard.canActivate(mockContext)).toBe(false);
  });

  it('should allow access when user has required role', () => {
    const mockContext = {
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: UserRole.SUPER_ADMIN } }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
      if (key === IS_PUBLIC_KEY) return undefined;
      if (key === ROLES_KEY) return [UserRole.SUPER_ADMIN];
      return undefined;
    });

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    const mockContext = {
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: UserRole.TEACHER } }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
      if (key === IS_PUBLIC_KEY) return undefined;
      if (key === ROLES_KEY) return [UserRole.SUPER_ADMIN];
      return undefined;
    });

    expect(guard.canActivate(mockContext)).toBe(false);
  });
});
