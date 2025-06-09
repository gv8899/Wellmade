import { Injectable, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  private readonly logger = new Logger(LocalAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug('LocalAuthGuard canActivate called');
    try {
      const result = (await super.canActivate(context)) as boolean;
      this.logger.debug(`LocalAuthGuard canActivate result: ${result}`);
      return result;
    } catch (error) {
      this.logger.error('LocalAuthGuard canActivate error:', error);
      throw error;
    }
  }

  handleRequest<TUser = any>(
    err: any,
    user: TUser,
    info: any,
  ): TUser {
    this.logger.debug(`LocalAuthGuard handleRequest called. User: ${JSON.stringify(user)}, Info: ${JSON.stringify(info)}, Error: ${err}`);
    
    if (err || !user) {
      this.logger.warn(`Authentication failed. Error: ${err}, Info: ${info}`);
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }
    
    return user;
  }
}
