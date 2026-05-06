import { Roles, ROLES_KEY } from './roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { Reflector } from '@nestjs/core';

describe('Roles Decorator', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  it('should set metadata with single role', () => {
    class TestController {
      @Roles(UserRole.ADMIN)
      testMethod() {}
    }

    const roles = reflector.get<UserRole[]>(
      ROLES_KEY,
      TestController.prototype.testMethod,
    );

    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('should set metadata with multiple roles', () => {
    class TestController {
      @Roles(UserRole.ADMIN, UserRole.MEMBER)
      testMethod() {}
    }

    const roles = reflector.get<UserRole[]>(
      ROLES_KEY,
      TestController.prototype.testMethod,
    );

    expect(roles).toEqual([UserRole.ADMIN, UserRole.MEMBER]);
  });

  it('should set metadata with MEMBER role', () => {
    class TestController {
      @Roles(UserRole.MEMBER)
      testMethod() {}
    }

    const roles = reflector.get<UserRole[]>(
      ROLES_KEY,
      TestController.prototype.testMethod,
    );

    expect(roles).toEqual([UserRole.MEMBER]);
  });

  it('should use correct metadata key', () => {
    expect(ROLES_KEY).toBe('roles');
  });
});
