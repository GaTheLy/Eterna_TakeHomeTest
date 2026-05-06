import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Custom decorator to mark routes with required roles
 * Usage: @Roles(UserRole.ADMIN, UserRole.MEMBER)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
