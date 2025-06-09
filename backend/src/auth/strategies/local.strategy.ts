import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    this.logger.debug(`Validating user: ${username}`);
    try {
      const user = await this.authService.validateUser(username, password);
      if (!user) {
        this.logger.warn(`User validation failed for username: ${username}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      this.logger.debug(`User ${username} validated successfully`);
      return user;
    } catch (error) {
      this.logger.error(`User validation error for ${username}:`, error);
      throw error;
    }
  }
}
