import { Controller, Get, UseGuards } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { Reflector } from '@nestjs/core';

/**
 * Integration test demonstrating how RolesGuard and @Roles() decorator work together
 */
describe('RolesGuard Integration', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  @Controller('test')
  class TestController {
    @Get('admin-only')
    @Roles(UserRole.ADMIN)
    adminOnly() {
      return 'admin content';
    }

    @Get('member-only')
    @Roles(UserRole.MEMBER)
    memberOnly() {
      return 'member content';
    }

    @Get('admin-or-member')
    @Roles(UserRole.ADMIN, UserRole.MEMBER)
    adminOrMember() {
      return 'shared content';
    }

    @Get('public')
    public() {
      return 'public content';
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockExecutionContext = (
    user: any,
    handler: Function,
  ): any => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => handler,
      getClass: () => TestController,
    };
  };

  describe('Admin-only route', () => {
    it('should allow access for admin user', () => {
      const context = createMockExecutionContext(
        { role: UserRole.ADMIN },
        TestController.prototype.adminOnly,
      );

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access for member user', () => {
      const context = createMockExecutionContext(
        { role: UserRole.MEMBER },
        TestController.prototype.adminOnly,
      );

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });
  });

  describe('Member-only route', () => {
    it('should allow access for member user', () => {
      const context = createMockExecutionContext(
        { role: UserRole.MEMBER },
        TestController.prototype.memberOnly,
      );

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access for admin user', () => {
      const context = createMockExecutionContext(
        { role: UserRole.ADMIN },
        TestController.prototype.memberOnly,
      );

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });
  });

  describe('Admin or Member route', () => {
    it('should allow access for admin user', () => {
      const context = createMockExecutionContext(
        { role: UserRole.ADMIN },
        TestController.prototype.adminOrMember,
      );

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access for member user', () => {
      const context = createMockExecutionContext(
        { role: UserRole.MEMBER },
        TestController.prototype.adminOrMember,
      );

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('Public route (no @Roles decorator)', () => {
    it('should allow access for admin user', () => {
      const context = createMockExecutionContext(
        { role: UserRole.ADMIN },
        TestController.prototype.public,
      );

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access for member user', () => {
      const context = createMockExecutionContext(
        { role: UserRole.MEMBER },
        TestController.prototype.public,
      );

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access for unauthenticated user', () => {
      const context = createMockExecutionContext(
        undefined,
        TestController.prototype.public,
      );

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
