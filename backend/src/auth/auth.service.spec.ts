import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const registerDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const createdUser: User = {
        id: '123',
        name: registerDto.name,
        email: registerDto.email,
        password: 'hashed_password',
        role: UserRole.MEMBER,
        createdAt: new Date(),
        projects: [],
        assignedTasks: [],
      };

      usersService.create.mockResolvedValue(createdUser);

      const result = await service.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith(
        registerDto.name,
        registerDto.email,
        registerDto.password,
      );
      expect(result).toEqual(createdUser);
      expect(result.role).toBe(UserRole.MEMBER);
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      usersService.create.mockRejectedValue(
        new Error('User with email already exists'),
      );

      await expect(service.register(registerDto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should return JWT token and user info for valid credentials', async () => {
      const loginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const user: User = {
        id: '123',
        name: 'John Doe',
        email: loginDto.email,
        password: hashedPassword,
        role: UserRole.MEMBER,
        createdAt: new Date(),
        projects: [],
        assignedTasks: [],
      };

      const mockToken = 'mock.jwt.token';

      usersService.findByEmail.mockResolvedValue(user);
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        role: user.role,
      });
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'invalid@example.com',
        password: 'password123',
      };

      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await bcrypt.hash('password123', 10);
      const user: User = {
        id: '123',
        name: 'John Doe',
        email: loginDto.email,
        password: hashedPassword,
        role: UserRole.MEMBER,
        createdAt: new Date(),
        projects: [],
        assignedTasks: [],
      };

      usersService.findByEmail.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const email = 'john@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const user: User = {
        id: '123',
        name: 'John Doe',
        email,
        password: hashedPassword,
        role: UserRole.MEMBER,
        createdAt: new Date(),
        projects: [],
        assignedTasks: [],
      };

      usersService.findByEmail.mockResolvedValue(user);

      const result = await service.validateUser(email, password);

      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result?.email).toBe(user.email);
    });

    it('should return null if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'notfound@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const email = 'john@example.com';
      const hashedPassword = await bcrypt.hash('password123', 10);

      const user: User = {
        id: '123',
        name: 'John Doe',
        email,
        password: hashedPassword,
        role: UserRole.MEMBER,
        createdAt: new Date(),
        projects: [],
        assignedTasks: [],
      };

      usersService.findByEmail.mockResolvedValue(user);

      const result = await service.validateUser(email, 'wrongpassword');

      expect(result).toBeNull();
    });
  });
});
