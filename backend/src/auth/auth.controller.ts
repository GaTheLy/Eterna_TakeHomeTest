import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Create a new user account with name, email, and password. Password will be hashed before storage.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
    examples: {
      example1: {
        summary: 'Valid registration',
        value: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'securePassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'MEMBER',
        createdAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data (validation errors)',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password must be at least 8 characters'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email already exists',
        error: 'Conflict',
      },
    },
  })
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.register(registerDto);
  }

  /**
   * Login user and receive JWT token
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticate user with email and password. Returns JWT token for subsequent authenticated requests.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
    examples: {
      example1: {
        summary: 'Valid login',
        value: {
          email: 'john@example.com',
          password: 'securePassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful, JWT token returned',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'MEMBER',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data (validation errors)',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password should not be empty'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }
}
