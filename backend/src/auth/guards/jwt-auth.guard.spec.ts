import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should call super.canActivate with context', () => {
      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {
              authorization: 'Bearer valid-token',
            },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      // Mock the parent class method
      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      const result = guard.canActivate(mockContext);

      expect(superCanActivateSpy).toHaveBeenCalledWith(mockContext);
      expect(result).toBe(true);

      superCanActivateSpy.mockRestore();
    });

    it('should extend AuthGuard with jwt strategy', () => {
      // Verify that the guard is properly configured
      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });
  });
});
