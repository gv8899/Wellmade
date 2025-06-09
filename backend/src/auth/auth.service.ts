import { Injectable, UnauthorizedException, Logger, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

type SafeUser = Omit<User, 'password' | 'hashPassword' | 'validatePassword'>;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<SafeUser | null> {
    this.logger.debug(`Attempting to validate user: ${username}`);
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      this.logger.debug(`User found: ${username}. Validating password...`);
      const isMatch = await user.validatePassword(password);
      if (isMatch) {
        this.logger.debug(`Password for user ${username} is valid.`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }
      this.logger.warn(`Invalid password for user: ${username}`);
    } else {
      this.logger.warn(`User not found: ${username}`);
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: SafeUser }> {
    this.logger.debug(`Login attempt for user: ${loginDto.username}`);
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      this.logger.error(`Login failed for user: ${loginDto.username} - Unauthorized`);
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username, sub: user.id, roles: user.roles };
    this.logger.debug(`Generating JWT for user: ${user.username} with payload: ${JSON.stringify(payload)}`);
    const { id, username, email, roles, isActive, createdAt, updatedAt } = user;
    const safeUser: SafeUser = { id, username, email, roles, isActive, createdAt, updatedAt };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: safeUser,
    };
  }

  async register(createUserDto: CreateUserDto): Promise<SafeUser> {
    this.logger.debug(`Registration attempt for user: ${createUserDto.username}`);    
    try {
      const user = await this.usersService.create(createUserDto);
      // Extract only the safe fields
      const { id, username, email, roles, isActive, createdAt, updatedAt } = user;
      const safeUser: SafeUser = { id, username, email, roles, isActive, createdAt, updatedAt };
      
      this.logger.debug(`User ${username} registered successfully`);
      return safeUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Re-throw ConflictException with the original message
      }
      this.logger.error(`Failed to register user ${createUserDto.username}:`, error);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }
}
