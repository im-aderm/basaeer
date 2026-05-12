import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOne: jest.fn(),
    findById: jest.fn(),
    setPasswordResetToken: jest.fn(),
    findByResetToken: jest.fn(),
    updatePassword: jest.fn(),
    clearResetToken: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'test-jwt-token'),
  };

  const mockMailService = {
    sendPasswordReset: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object without password if validation is successful', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'ADMIN',
        branchId: 'branch-1',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(usersService.findOne).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        role: 'ADMIN',
        branchId: 'branch-1',
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user is not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token and user payload', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'ADMIN',
        branchId: 'branch-1',
      };

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: '1',
        role: 'ADMIN',
        branchId: 'branch-1',
      });

      expect(result).toEqual({
        access_token: 'test-jwt-token',
        user: { ...user, sub: undefined },
      });
    });
  });

  describe('getFullProfile security and leakage checks', () => {
    it('should explicitly omit sensitive fields like password and resetToken properties', async () => {
      const mockFullUser = {
        id: '1',
        email: 'profile@example.com',
        password: 'highlysensitivehash',
        resetTokenHash: 'sha256tokenhash',
        resetTokenExpires: new Date(),
        firstName: 'Secure',
        lastName: 'User',
      };

      mockUsersService.findById.mockResolvedValue(mockFullUser);

      const result = await service.getFullProfile('1');

      expect(result).toBeDefined();
      expect(result).toEqual({
        id: '1',
        email: 'profile@example.com',
        firstName: 'Secure',
        lastName: 'User',
      });
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('resetTokenHash');
      expect(result).not.toHaveProperty('resetTokenExpires');
    });
  });

  describe('forgotPassword and resetPassword cryptographically secure flows', () => {
    it('should securely hash the reset token before storing it in forgotPassword', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.forgotPassword('test@example.com');

      expect(result).toBeDefined();
      expect(mockUsersService.setPasswordResetToken).toHaveBeenCalled();
      const [userId, hash, expires] =
        mockUsersService.setPasswordResetToken.mock.calls[0];
      expect(userId).toBe('user-123');
      expect(hash).toHaveLength(64); // SHA-256 hash length in hex
      expect(expires).toBeInstanceOf(Date);
    });

    it('should hash the incoming token to validate and perform secure password resets', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      mockUsersService.findByResetToken.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashedpassword');

      const result = await service.resetPassword(
        'user-123',
        'securetoken123',
        'newsecurepass123',
      );

      expect(result).toEqual({
        message: 'Password has been successfully reset',
      });
      expect(mockUsersService.findByResetToken).toHaveBeenCalled();
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        'user-123',
        'newhashedpassword',
      );
      expect(mockUsersService.clearResetToken).toHaveBeenCalledWith('user-123');
    });
  });
});
