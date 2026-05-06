import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   * @param registerDto - Registration data (name, email, password)
   * @returns The created user
   * @throws ConflictException if email already exists
   */
  async register(registerDto: RegisterDto): Promise<User> {
    const { name, email, password } = registerDto;
    return this.usersService.create(name, email, password);
  }

  /**
   * Login user and generate JWT token
   * @param loginDto - Login credentials (email, password)
   * @returns JWT token and user information
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Validate user credentials
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token with user id and role as claims
    const payload = { sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Validate user credentials
   * @param email - User email
   * @param password - Plain text password
   * @returns User if credentials are valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
