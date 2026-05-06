import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find a user by email address
   * @param email - The email address to search for
   * @returns The user if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Find a user by ID
   * @param id - The user ID to search for
   * @returns The user if found, null otherwise
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * Create a new user with hashed password and default MEMBER role
   * @param name - The user's name
   * @param email - The user's email address
   * @param password - The user's plain text password (will be hashed)
   * @returns The created user
   * @throws ConflictException if email already exists
   */
  async create(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    // Check if user with email already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(
        `User with email '${email}' already exists`,
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create user with default MEMBER role
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.MEMBER,
    });

    return this.userRepository.save(user);
  }

  /**
   * Find all users
   * @returns List of all users
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
