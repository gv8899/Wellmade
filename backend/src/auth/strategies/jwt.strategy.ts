import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service'; // To potentially fetch full user object

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService, // Optional: if you want to enrich the user object
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
    this.logger.log('JwtStrategy initialized');
    if (!configService.get<string>('JWT_SECRET')) {
      this.logger.error('JWT_SECRET is not defined. JWT Strategy will not work correctly.');
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }
  }

  async validate(payload: any) {
    this.logger.debug(`JwtStrategy validate called with payload: ${JSON.stringify(payload)}`);
    // The payload here is the object that was signed into the JWT (username, sub, roles)
    // You could fetch the full user object from the database if needed:
    // const user = await this.usersService.findById(payload.sub);
    // if (!user || !user.isActive) {
    //   this.logger.warn(`User ${payload.sub} not found or inactive.`);
    //   throw new UnauthorizedException();
    // }
    // For now, we'll just return the payload as is, assuming it contains enough info.
    // Ensure the payload structure matches what you sign in AuthService.login
    if (!payload || !payload.sub || !payload.username || !payload.roles) {
        this.logger.error('Invalid JWT payload structure.');
        throw new UnauthorizedException('Invalid token payload.');
    }
    return { userId: payload.sub, username: payload.username, roles: payload.roles };
  }
}
