import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
export interface AuthResponse {
    access_token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<User>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    validateUser(email: string, password: string): Promise<User | null>;
}
