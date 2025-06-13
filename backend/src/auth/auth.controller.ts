import { Controller, Post, Get, UseGuards, Body, Logger, HttpCode, HttpStatus, ConflictException, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // 這個端點會自動由 Passport 處理，將用戶重定向到 Google
    return { msg: 'Google Authentication' };
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    // 處理從 Google 返回的請求
    return this.authService.googleLogin(req);
  }

  @Public()
  @Post('oauth-sync')
  @HttpCode(HttpStatus.OK)
  async oauthSync(@Body() oauthData: { email: string; name: string; picture: string; provider: string }) {
    this.logger.log(`OAuth 同步請求收到：`, JSON.stringify(oauthData));
    try {
      // 構建 profile 對象，以便重用現有的 validateOAuthLogin 方法
      let firstName = '';
      let lastName = '';
      
      if (oauthData.name) {
        const nameParts = oauthData.name.split(' ');
        if (nameParts.length >= 2) {
          // 西式名字格式：姓在後
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else if (nameParts.length === 1) {
          // 只有一個名字，放在 firstName
          firstName = nameParts[0];
        }
      }
      
      const profile = {
        email: oauthData.email,
        firstName,
        lastName,
        picture: oauthData.picture || null,
        provider: oauthData.provider
      };
      
      this.logger.log(`處理後的資料：`, JSON.stringify(profile));
      
      // 驗證或創建用戶
      const user = await this.authService.validateOAuthLogin(profile);
      
      this.logger.log(`用戶已存入/更新到數據庫，回傳結果：`, JSON.stringify(user));
      
      // 返回用戶資料和訪問令牌
      return {
        user,
        accessToken: (user as any).access_token,
        message: '用戶資料同步成功'
      };
    } catch (error) {
      this.logger.error(`OAuth 同步失敗，用戶： ${oauthData.email}`, error);
      throw error;
    }
  }
}
