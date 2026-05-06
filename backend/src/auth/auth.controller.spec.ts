import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    role: 'MEMBER',
    createdAt: new Date('2024-01-15T10:30:00.000Z'),
  };

  const mockAuthResponse: AuthResponse = {
    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    user: {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
    },
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123',
      };

      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockUser);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should call authService.register with correct parameters', async () => {
      const registerDto: RegisterDto = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'anotherPassword456',
      };

      mockAuthService.register.mockResolvedValue(mockUser);

      await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login user and return JWT token', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'securePassword123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(result.access_token).toBeDefined();
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should call authService.login with correct parameters', async () => {
      const loginDto: LoginDto = {
        email: 'jane@example.com',
        password: 'anotherPassword456',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
