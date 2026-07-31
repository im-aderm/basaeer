import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { BranchGuard } from './branch.guard';
import { PermissionsGuard } from './permissions.guard';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    validateUser: jest.fn(),
    register: jest.fn(),
    changePassword: jest.fn(),
    bootstrap: jest.fn(),
    revokeToken: jest.fn().mockResolvedValue(undefined),
  };

  const allowGuard = { canActivate: () => true };

  const mockAuditService = {
    logAction: jest.fn().mockResolvedValue(undefined),
  };

  const mockResponse = () => {
    const res: any = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue(allowGuard)
      .overrideGuard(RolesGuard).useValue(allowGuard)
      .overrideGuard(BranchGuard).useValue(allowGuard)
      .overrideGuard(PermissionsGuard).useValue(allowGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return 401 for invalid credentials', async () => {
      const dto = { email: 'bad@test.com', password: 'wrong' };
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(dto as any, mockResponse())).rejects.toThrow('Invalid email or password');
      expect(mockAuditService.logAction).toHaveBeenCalled();
    });

    it('should return auth data for valid credentials', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      const user = { id: '1', email: 'test@test.com', role: 'TEACHER' };
      const authData = { access_token: 'token', user };

      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(authData);

      const result = await controller.login(dto as any, mockResponse());
      expect(result).toEqual(authData);
    });
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto = {
        email: 'test@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'TEACHER' as any,
      };
      mockAuthService.register.mockResolvedValue({ id: 'user-id' });
      const result = await controller.register(dto);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'user-id' });
    });
  });
});
