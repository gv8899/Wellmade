import { Controller, Post, UseGuards, Body, Logger, HttpCode, HttpStatus, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Public() // Mark this route as public, not requiring JWT auth
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    this.logger.debug(`Login attempt for user with email: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  // Example of a protected route (we'll use JwtAuthGuard later)
  // @UseGuards(JwtAuthGuard) // We'll create JwtAuthGuard soon
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user; // req.user is populated by JwtStrategy
  // }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);
    try {
      const user = await this.authService.register(registerDto);
      return {
        success: true,
        message: '註冊成功',
        user
      };
    } catch (error) {
      this.logger.error(`Registration failed for ${registerDto.email}: ${error.message}`);
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new ConflictException('此電子郵件已被註冊');
      }
      throw error; // Re-throw to let NestJS handle the HTTP response
    }
  }
}
