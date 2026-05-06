# Roles Guard and @Roles() Decorator Usage Guide

This guide explains how to use the RolesGuard and @Roles() decorator for role-based access control in the Task & Schedule Manager API.

## Overview

The system implements role-based access control (RBAC) using:
- **@Roles() decorator**: Marks routes with required roles
- **RolesGuard**: Validates that authenticated users have the required roles
- **UserRole enum**: Defines available roles (ADMIN, MEMBER)

## Components

### 1. @Roles() Decorator

Located in: `src/auth/decorators/roles.decorator.ts`

The @Roles() decorator is used to specify which roles are allowed to access a route.

**Usage:**
```typescript
import { Roles } from './auth/decorators';
import { UserRole } from './users/entities/user.entity';

@Roles(UserRole.ADMIN)              // Single role
@Roles(UserRole.ADMIN, UserRole.MEMBER)  // Multiple roles
```

### 2. RolesGuard

Located in: `src/auth/guards/roles.guard.ts`

The RolesGuard checks if the authenticated user has one of the required roles specified by the @Roles() decorator.

**Features:**
- Automatically allows access if no @Roles() decorator is present
- Checks user role against required roles
- Denies access if user is not authenticated or lacks required role

## Usage Examples

### Example 1: Admin-Only Route

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { UserRole } from './users/entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)  // Apply both guards
export class AdminController {
  @Get('dashboard')
  @Roles(UserRole.ADMIN)  // Only admins can access
  getDashboard() {
    return { message: 'Admin dashboard' };
  }
}
```

### Example 2: Multiple Roles

```typescript
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MEMBER)  // Both roles can access
  findAll() {
    return this.projectsService.findAll();
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)  // Only admins can delete
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
```

### Example 3: Mixed Access Control

```typescript
@Controller('tasks')
@UseGuards(JwtAuthGuard)  // All routes require authentication
export class TasksController {
  @Get()
  // No @Roles() decorator = all authenticated users can access
  findAll() {
    return this.tasksService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)  // Only admins can delete
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
```

### Example 4: Using with @CurrentUser() Decorator

```typescript
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { User } from './users/entities/user.entity';

@Controller('profile')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfileController {
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  getProfile(@CurrentUser() user: User) {
    // user object is automatically extracted from JWT
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
```

## Guard Order

**Important:** Always apply JwtAuthGuard before RolesGuard:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)  // ✅ Correct order
```

**Why?**
1. JwtAuthGuard validates the JWT token and attaches the user to the request
2. RolesGuard reads the user from the request and checks their role

If you reverse the order, RolesGuard won't find the user object.

## Global vs Route-Level Guards

### Route-Level (Recommended)

Apply guards to specific controllers or routes:

```typescript
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)  // Controller-level
export class ProjectsController {
  @Get()
  @Roles(UserRole.ADMIN)  // Route-level
  findAll() {}
}
```

### Global (Alternative)

Apply guards globally in main.ts:

```typescript
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const reflector = app.get(Reflector);
  app.useGlobalGuards(
    new JwtAuthGuard(),
    new RolesGuard(reflector)
  );
  
  await app.listen(3000);
}
```

**Note:** With global guards, you'll need to use @Public() decorator for public routes (not implemented in this system).

## Error Responses

### 401 Unauthorized (No JWT token)

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden (Insufficient role)

When RolesGuard denies access, NestJS returns:

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

## Testing

### Unit Testing with RolesGuard

```typescript
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access for admin', () => {
    const context = createMockContext({ role: UserRole.ADMIN });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    
    expect(guard.canActivate(context)).toBe(true);
  });
});
```

### E2E Testing

```typescript
describe('Projects (e2e)', () => {
  it('should deny access without admin role', () => {
    return request(app.getHttpServer())
      .delete('/projects/123')
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);
  });

  it('should allow access with admin role', () => {
    return request(app.getHttpServer())
      .delete('/projects/123')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
  });
});
```

## Best Practices

1. **Always use JwtAuthGuard with RolesGuard**: RolesGuard depends on the user object from JWT
2. **Be explicit with roles**: Use @Roles() decorator even if all roles are allowed for clarity
3. **Test role-based access**: Write tests for both allowed and denied scenarios
4. **Document role requirements**: Add comments explaining why certain roles are required
5. **Consider resource ownership**: RolesGuard checks roles, but you may also need to check resource ownership in service layer

## Common Patterns

### Pattern 1: Admin Override

Admins can access everything, members have limited access:

```typescript
@Get(':id')
@Roles(UserRole.ADMIN, UserRole.MEMBER)
async findOne(@Param('id') id: string, @CurrentUser() user: User) {
  const project = await this.projectsService.findOne(id);
  
  // Admins can see any project, members only their own
  if (user.role !== UserRole.ADMIN && project.ownerId !== user.id) {
    throw new ForbiddenException('You can only view your own projects');
  }
  
  return project;
}
```

### Pattern 2: Role-Based Response

Return different data based on role:

```typescript
@Get('stats')
@Roles(UserRole.ADMIN, UserRole.MEMBER)
getStats(@CurrentUser() user: User) {
  if (user.role === UserRole.ADMIN) {
    return this.statsService.getAllStats();  // Full stats
  }
  return this.statsService.getUserStats(user.id);  // User's stats only
}
```

## Troubleshooting

### Issue: RolesGuard always denies access

**Solution:** Ensure JwtAuthGuard is applied before RolesGuard:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)  // Correct order
```

### Issue: User object is undefined in RolesGuard

**Solution:** Check that JwtStrategy is properly configured and attaching user to request:
```typescript
// jwt.strategy.ts
async validate(payload: any) {
  return { id: payload.sub, role: payload.role };  // Must return user object
}
```

### Issue: @Roles() decorator not working

**Solution:** Ensure Reflector is injected in RolesGuard constructor:
```typescript
constructor(private reflector: Reflector) {}
```

## Related Files

- `src/auth/decorators/roles.decorator.ts` - @Roles() decorator implementation
- `src/auth/guards/roles.guard.ts` - RolesGuard implementation
- `src/auth/guards/jwt-auth.guard.ts` - JWT authentication guard
- `src/auth/decorators/current-user.decorator.ts` - @CurrentUser() decorator
- `src/users/entities/user.entity.ts` - UserRole enum definition

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 5.4**: JWT Guards protect all authenticated endpoints
- **Requirement 5.5**: Role-based access control for Admin and Member roles
- **Requirement 5.6**: Custom decorator for extracting current user from JWT
