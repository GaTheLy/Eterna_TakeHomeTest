import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockExecutionContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      const context = createMockExecutionContext({ role: UserRole.MEMBER });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role (ADMIN)', () => {
      const context = createMockExecutionContext({ role: UserRole.ADMIN });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role (MEMBER)', () => {
      const context = createMockExecutionContext({ role: UserRole.MEMBER });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.MEMBER]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      const context = createMockExecutionContext({ role: UserRole.MEMBER });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN, UserRole.MEMBER]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      const context = createMockExecutionContext({ role: UserRole.MEMBER });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should deny access when user is not authenticated', () => {
      const context = createMockExecutionContext(undefined);
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should deny access when user object exists but has no role', () => {
      const context = createMockExecutionContext({});
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should use correct metadata key', () => {
      const context = createMockExecutionContext({ role: UserRole.ADMIN });
      const spy = jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);

      guard.canActivate(context);

      expect(spy).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });
  });
});
