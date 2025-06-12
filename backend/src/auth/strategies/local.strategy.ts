import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    this.logger.debug(`Validating user with email: ${email}`);
    try {
      const user = await this.authService.validateUser(email, password);
      if (!user) {
        this.logger.warn(`User validation failed for email: ${email}`);
        throw new UnauthorizedException('電子郵件或密碼錯誤');
      }
      this.logger.debug(`User with email ${email} validated successfully`);
      return user;
    } catch (error) {
      this.logger.error(`User validation error for ${email}:`, error);
      throw error;
    }
  }
}
