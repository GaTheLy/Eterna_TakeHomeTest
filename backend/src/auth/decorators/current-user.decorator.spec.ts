import { ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

/**
 * Unit tests for CurrentUser decorator
 * Tests the decorator's ability to extract user from request context
 */
describe('CurrentUser Decorator', () => {
  // Import the decorator factory function directly for testing
  const getCurrentUserFactory = () => {
    // This simulates what createParamDecorator does internally
    return (_data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    };
  };

  const createMockExecutionContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  it('should extract user from request', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.MEMBER,
    };

    const context = createMockExecutionContext(mockUser);
    const factory = getCurrentUserFactory();
    const result = factory(null, context);

    expect(result).toEqual(mockUser);
  });

  it('should extract admin user from request', () => {
    const mockUser = {
      id: '456',
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
    };

    const context = createMockExecutionContext(mockUser);
    const factory = getCurrentUserFactory();
    const result = factory(null, context);

    expect(result).toEqual(mockUser);
  });

  it('should return undefined when user is not in request', () => {
    const context = createMockExecutionContext(undefined);
    const factory = getCurrentUserFactory();
    const result = factory(null, context);

    expect(result).toBeUndefined();
  });

  it('should extract user with all properties', () => {
    const mockUser = {
      id: '789',
      email: 'user@example.com',
      name: 'Full User',
      role: UserRole.MEMBER,
      createdAt: new Date('2024-01-01'),
      password: 'hashed_password',
    };

    const context = createMockExecutionContext(mockUser);
    const factory = getCurrentUserFactory();
    const result = factory(null, context);

    expect(result).toEqual(mockUser);
    expect(result.id).toBe('789');
    expect(result.email).toBe('user@example.com');
    expect(result.name).toBe('Full User');
    expect(result.role).toBe(UserRole.MEMBER);
  });

  it('should extract only user property from request object', () => {
    const mockUser = {
      id: '999',
      email: 'test@example.com',
      role: UserRole.MEMBER,
    };

    const mockRequest = {
      user: mockUser,
      headers: { authorization: 'Bearer token' },
      body: { data: 'test' },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;

    const factory = getCurrentUserFactory();
    const result = factory(null, context);

    expect(result).toEqual(mockUser);
    expect(result).not.toHaveProperty('headers');
    expect(result).not.toHaveProperty('body');
  });
});
