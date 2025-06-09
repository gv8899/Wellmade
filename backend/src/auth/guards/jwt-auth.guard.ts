import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.debug(`JwtAuthGuard checking route. isPublic: ${isPublic}`);

    if (isPublic) {
      this.logger.debug('Route is public, skipping JWT check');
      return true;
    }

    // For non-public routes, proceed with JWT validation
    const result = super.canActivate(context);
    if (result instanceof Promise) {
      result.then(res => this.logger.debug(`JWT validation result: ${res}`))
            .catch(err => this.logger.error('JWT validation failed:', err));
    }
    return result;
  }

  handleRequest(err, user, info, context) {
    this.logger.debug(`JwtAuthGuard handleRequest called. User: ${JSON.stringify(user)}, Info: ${JSON.stringify(info)}, Error: ${err}`);
    
    if (err || !user) {
      this.logger.warn(`JWT authentication failed. Error: ${err}, User: ${user}`);
      throw err || new Error(info?.message || 'Unauthorized from JwtAuthGuard');
    }
    return user;
  }
}
