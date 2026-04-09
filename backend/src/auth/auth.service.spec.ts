import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'test-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
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
        branchId: 'branch-1'
      };
      
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(usersService.findOne).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        role: 'ADMIN',
        branchId: 'branch-1'
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

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token and user payload', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'ADMIN',
        branchId: 'branch-1'
      };

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: '1',
        role: 'ADMIN',
        branchId: 'branch-1'
      });

      expect(result).toEqual({
        access_token: 'test-jwt-token',
        user: { ...user, sub: undefined },
      });
    });
  });
});
