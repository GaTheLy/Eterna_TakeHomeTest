import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy, JwtPayload } from './jwt.strategy';
import { UsersService } from '../../users/users.service';
import { User, UserRole } from '../../users/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<UsersService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockUsersService = {
      findById: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get(UsersService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object when user exists', async () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        role: 'MEMBER',
      };

      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        role: UserRole.MEMBER,
        createdAt: new Date(),
        projects: [],
        assignedTasks: [],
      };

      usersService.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(usersService.findById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const payload: JwtPayload = {
        sub: 'non-existent-user',
        role: 'MEMBER',
      };

      usersService.findById.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow('User not found');
    });

    it('should handle admin role correctly', async () => {
      const payload: JwtPayload = {
        sub: 'admin-123',
        role: 'ADMIN',
      };

      const mockAdmin: User = {
        id: 'admin-123',
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'hashed_password',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        projects: [],
        assignedTasks: [],
      };

      usersService.findById.mockResolvedValue(mockAdmin);

      const result = await strategy.validate(payload);

      expect(result.role).toBe(UserRole.ADMIN);
    });
  });

  describe('configuration', () => {
    it('should use JWT_SECRET from config service', () => {
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('should use default secret if JWT_SECRET not provided', async () => {
      const mockConfigServiceWithoutSecret = {
        get: jest.fn(() => undefined),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JwtStrategy,
          {
            provide: UsersService,
            useValue: { findById: jest.fn() },
          },
          {
            provide: ConfigService,
            useValue: mockConfigServiceWithoutSecret,
          },
        ],
      }).compile();

      const strategyWithDefault = module.get<JwtStrategy>(JwtStrategy);
      expect(strategyWithDefault).toBeDefined();
    });
  });
});
