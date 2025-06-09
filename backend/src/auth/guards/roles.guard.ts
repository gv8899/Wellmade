import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/user.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      this.logger.debug('No roles required for this route');
      return true; // No roles required
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      this.logger.warn('No user found in request. Make sure JwtAuthGuard is used before RolesGuard');
      return false;
    }

    this.logger.debug(`Checking roles. Required: ${requiredRoles.join(', ')}, User has: ${user.roles?.join(', ')}`);
    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));
    
    if (!hasRole) {
      this.logger.warn(`User ${user.username} lacks required roles: ${requiredRoles.join(', ')}`);
    }
    
    return hasRole;
  }
}
