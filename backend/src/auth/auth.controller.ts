import { Controller, Post, UseGuards, Body, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Public() // Mark this route as public, not requiring JWT auth
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    this.logger.debug(`Login attempt for user: ${loginDto.username}`);
    return this.authService.login(loginDto);
  }

  // Example of a protected route (we'll use JwtAuthGuard later)
  // @UseGuards(JwtAuthGuard) // We'll create JwtAuthGuard soon
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user; // req.user is populated by JwtStrategy
  // }

  // Optional: Registration endpoint
  // @Public()
  // @Post('register')
  // async register(@Body() createUserDto: CreateUserDto) {
  //   this.logger.log(`Registration attempt for username: ${createUserDto.username}`);
  //   try {
  //     const user = await this.authService.register(createUserDto);
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     const { password, ...result } = user;
  //     return result;
  //   } catch (error) {
  //     this.logger.error(`Registration failed for ${createUserDto.username}: ${error.message}`);
  //     throw error; // Re-throw to let NestJS handle the HTTP response
  //   }
  // }
}
