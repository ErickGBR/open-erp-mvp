import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Mark a route handler (or an entire controller) with the roles that are
 * allowed to access it.
 *
 * @example
 * ```typescript
 * @Roles(UserRole.ROOT)
 * @Get('users')
 * findAll() { ... }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
