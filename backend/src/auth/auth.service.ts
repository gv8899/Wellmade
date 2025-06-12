import { Injectable, UnauthorizedException, Logger, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/user.enum';

type SafeUser = Omit<User, 'password' | 'hashPassword' | 'validatePassword'>;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<SafeUser | null> {
    this.logger.debug(`Attempting to validate user by email: ${email}`);
    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      this.logger.debug(`User found with email: ${email}. Validating password...`);
      const isMatch = await user.validatePassword(password);
      if (isMatch) {
        this.logger.debug(`Password for user with email ${email} is valid.`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }
      this.logger.warn(`Invalid password for user with email: ${email}`);
    } else {
      this.logger.warn(`User not found with email: ${email}`);
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: SafeUser }> {
    this.logger.debug(`Login attempt for user with email: ${loginDto.email}`);
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      this.logger.error(`Login failed for user with email: ${loginDto.email} - Unauthorized`);
      throw new UnauthorizedException('電子郵件或密碼錯誤');
    }
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    this.logger.debug(`Generating JWT for user with email: ${user.email} with payload: ${JSON.stringify(payload)}`);
    const { id, username, email, roles, isActive, createdAt, updatedAt } = user;
    const safeUser: SafeUser = { id, username, email, roles, isActive, createdAt, updatedAt };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: safeUser,
    };
  }

  async register(registerDto: RegisterDto): Promise<SafeUser> {
    this.logger.debug(`Registration attempt for user with email: ${registerDto.email}`);    
    try {
      
      // 使用 email 作為 username
      const createUserDto = {
        username: registerDto.email,
        email: registerDto.email,
        password: registerDto.password,
        roles: [UserRole.USER],
      };
      
      const user = await this.usersService.create(createUserDto);
      
      // 僅提取安全字段
      const { id, username, email, roles, isActive, createdAt, updatedAt } = user;
      const safeUser: SafeUser = { id, username, email, roles, isActive, createdAt, updatedAt };
      
      this.logger.debug(`User with email ${email} registered successfully`);
      return safeUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Re-throw ConflictException with the original message
      }
      this.logger.error(`Failed to register user with email ${registerDto.email}:`, error);
      throw new Error(`註冊失敗: ${error.message}`);
    }
  }
}
