import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      const mockUser: User = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        role: UserRole.MEMBER,
        createdAt: new Date(),
        projects: [],
        assignedTasks: [],
      };

      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const mockUser: User = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        role: UserRole.MEMBER,
        createdAt: new Date(),
        projects: [],
        assignedTasks: [],
      };

      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('123');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should return null when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
    });
  });

  describe('create', () => {
    it('should create a new user with hashed password and MEMBER role', async () => {
      const name = 'John Doe';
      const email = 'john@example.com';
      const password = 'password123';

      repository.findOne.mockResolvedValue(null); // No existing user

      const mockCreatedUser: User = {
        id: '123',
        name,
        email,
        password: 'hashed_password',
        role: UserRole.MEMBER,
        createdAt: new Date(),
        projects: [],
        assignedTasks: [],
      };

      repository.create.mockReturnValue(mockCreatedUser);
      repository.save.mockResolvedValue(mockCreatedUser);

      const result = await service.create(name, email, password);

      expect(result).toEqual(mockCreatedUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();

      // Verify password was hashed
      const createCall = repository.create.mock.calls[0][0];
      expect(createCall.password).not.toBe(password);
      expect(createCall.role).toBe(UserRole.MEMBER);
    });

    it('should hash password with bcrypt', async () => {
      const password = 'password123';
      const email = 'john@example.com';

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue({} as User);
      repository.save.mockResolvedValue({} as User);

      await service.create('John Doe', email, password);

      // Verify that the password passed to create is not the plain text password
      const createCall = repository.create.mock.calls[0][0];
      expect(createCall.password).not.toBe(password);
      expect(createCall.password).toBeTruthy();
      expect(createCall.password.length).toBeGreaterThan(password.length);
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser: User = {
        id: '123',
        name: 'Existing User',
        email: 'john@example.com',
        password: 'hashed_password',
        role: UserRole.MEMBER,
        createdAt: new Date(),
        projects: [],
        assignedTasks: [],
      };

      repository.findOne.mockResolvedValue(existingUser);

      await expect(
        service.create('John Doe', 'john@example.com', 'password123'),
      ).rejects.toThrow(ConflictException);

      await expect(
        service.create('John Doe', 'john@example.com', 'password123'),
      ).rejects.toThrow("User with email 'john@example.com' already exists");

      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should set default role to MEMBER', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue({} as User);
      repository.save.mockResolvedValue({} as User);

      await service.create('John Doe', 'john@example.com', 'password123');

      const createCall = repository.create.mock.calls[0][0];
      expect(createCall.role).toBe(UserRole.MEMBER);
    });
  });
});
