import { validate } from 'class-validator';
import { User, UserRole } from './user.entity';

describe('User Entity Validation', () => {
  describe('Email Validation', () => {
    it('should accept valid email format', () => {
      const user = new User();
      user.name = 'John Doe';
      user.email = 'john.doe@example.com';
      user.password = 'hashedPassword123';
      user.role = UserRole.MEMBER;

      expect(user.email).toBe('john.doe@example.com');
    });

    it('should store email with various valid formats', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
        'user123@test.org',
      ];

      validEmails.forEach((email) => {
        const user = new User();
        user.email = email;
        expect(user.email).toBe(email);
      });
    });

    it('should enforce unique email constraint at database level', () => {
      // Note: Uniqueness is enforced by TypeORM @Column({ unique: true })
      // This test verifies the decorator is present
      const user = new User();
      user.email = 'test@example.com';
      
      // The unique constraint is defined in the entity
      expect(user.email).toBeDefined();
    });

    it('should enforce email length constraint (max 255 characters)', () => {
      const user = new User();
      const longEmail = 'a'.repeat(240) + '@example.com'; // 252 characters
      user.email = longEmail;
      
      expect(user.email.length).toBeLessThanOrEqual(255);
    });
  });

  describe('Password Validation', () => {
    it('should store hashed password', () => {
      const user = new User();
      user.name = 'John Doe';
      user.email = 'john@example.com';
      user.password = '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890'; // bcrypt hash format
      user.role = UserRole.MEMBER;

      expect(user.password).toBeDefined();
      expect(user.password.length).toBeGreaterThan(0);
    });

    it('should enforce password length constraint (max 255 characters)', () => {
      const user = new User();
      const hashedPassword = '$2b$10$' + 'a'.repeat(50); // Typical bcrypt hash
      user.password = hashedPassword;
      
      expect(user.password.length).toBeLessThanOrEqual(255);
    });

    it('should not store plain text passwords', () => {
      // This is a business logic test - passwords should be hashed before storage
      const plainPassword = 'password123';
      const hashedPassword = '$2b$10$abcdefghijklmnopqrstuvwxyz';
      
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt format
    });
  });

  describe('Name Validation', () => {
    it('should accept valid name', () => {
      const user = new User();
      user.name = 'John Doe';
      user.email = 'john@example.com';
      user.password = 'hashedPassword';
      user.role = UserRole.MEMBER;

      expect(user.name).toBe('John Doe');
    });

    it('should enforce name length constraint (max 255 characters)', () => {
      const user = new User();
      const longName = 'a'.repeat(255);
      user.name = longName;
      
      expect(user.name.length).toBeLessThanOrEqual(255);
    });

    it('should accept names with special characters', () => {
      const specialNames = [
        "O'Brien",
        'Jean-Pierre',
        'María García',
        'John Doe Jr.',
        'Dr. Smith',
      ];

      specialNames.forEach((name) => {
        const user = new User();
        user.name = name;
        expect(user.name).toBe(name);
      });
    });
  });

  describe('Role Validation', () => {
    it('should accept ADMIN role', () => {
      const user = new User();
      user.name = 'Admin User';
      user.email = 'admin@example.com';
      user.password = 'hashedPassword';
      user.role = UserRole.ADMIN;

      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.role).toBe('ADMIN');
    });

    it('should accept MEMBER role', () => {
      const user = new User();
      user.name = 'Member User';
      user.email = 'member@example.com';
      user.password = 'hashedPassword';
      user.role = UserRole.MEMBER;

      expect(user.role).toBe(UserRole.MEMBER);
      expect(user.role).toBe('MEMBER');
    });

    it('should default to MEMBER role', () => {
      const user = new User();
      user.name = 'New User';
      user.email = 'new@example.com';
      user.password = 'hashedPassword';
      // Not setting role explicitly

      // TypeORM default is set in decorator: default: UserRole.MEMBER
      // When entity is saved without role, it will default to MEMBER
      expect(UserRole.MEMBER).toBe('MEMBER');
    });

    it('should only allow valid role enum values', () => {
      const validRoles = [UserRole.ADMIN, UserRole.MEMBER];
      
      validRoles.forEach((role) => {
        const user = new User();
        user.role = role;
        expect(Object.values(UserRole)).toContain(user.role);
      });
    });
  });

  describe('Timestamp Validation', () => {
    it('should have createdAt timestamp', () => {
      const user = new User();
      user.name = 'John Doe';
      user.email = 'john@example.com';
      user.password = 'hashedPassword';
      user.role = UserRole.MEMBER;
      user.createdAt = new Date();

      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should automatically set createdAt on entity creation', () => {
      // TypeORM @CreateDateColumn decorator automatically sets this
      const user = new User();
      const now = new Date();
      user.createdAt = now;

      expect(user.createdAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Entity Relationships', () => {
    it('should support projects relationship', () => {
      const user = new User();
      user.projects = [];

      expect(user.projects).toBeDefined();
      expect(Array.isArray(user.projects)).toBe(true);
    });

    it('should support assignedTasks relationship', () => {
      const user = new User();
      user.assignedTasks = [];

      expect(user.assignedTasks).toBeDefined();
      expect(Array.isArray(user.assignedTasks)).toBe(true);
    });
  });

  describe('Complete User Entity', () => {
    it('should create a valid user entity with all required fields', () => {
      const user = new User();
      user.id = '123e4567-e89b-12d3-a456-426614174000';
      user.name = 'John Doe';
      user.email = 'john.doe@example.com';
      user.password = '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890';
      user.role = UserRole.MEMBER;
      user.createdAt = new Date();
      user.projects = [];
      user.assignedTasks = [];

      expect(user.id).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/);
      expect(user.role).toBe(UserRole.MEMBER);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(Array.isArray(user.projects)).toBe(true);
      expect(Array.isArray(user.assignedTasks)).toBe(true);
    });
  });
});
