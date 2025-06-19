import { Controller, Get, Post, Patch, Delete, Body, Param, Headers, Session, Req, UnauthorizedException, HttpCode, NotFoundException } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AuthenticatedRequest } from './interfaces/request.interface';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Public } from '../auth/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Controller('cart')
export class CartsController {
  constructor(
    private readonly cartsService: CartsService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService
  ) {}

  /**
   * 獲取穩定的會話ID
   */
  private getSessionId(request: Request): string {
    // 優先使用 express-session 提供的 session ID
    const sessionId = (request as any).session?.id || (request as any).sessionID;
    
    if (sessionId) {
      console.log('使用 express-session ID:', sessionId);
      return sessionId;
    }
    
    // 如果沒有 session ID，使用 IP + User-Agent 產生相對穩定的訪客ID
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';
    const stableId = `guest-${Buffer.from(`${ip}-${userAgent}`).toString('base64').substring(0, 12)}`;
    
    console.log('生成穩定訪客ID:', stableId, { ip, userAgent: userAgent.substring(0, 50) });
    return stableId;
  }

  /**
   * 嘗試從 JWT 令牌中獲取用戶（可選認證）
   */
  private async getOptionalUser(authorization?: string) {
    console.log('getOptionalUser 被調用，authorization:', authorization ? 'Bearer token present' : 'No authorization header');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      console.log('沒有有效的 Bearer token');
      return null;
    }

    try {
      const token = authorization.substring(7);
      console.log('嘗試驗證 JWT token，長度:', token.length);
      
      // 驗證前先輸出 JWT 密鑰信息 (不輸出密鑰本身)
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      console.log('JWT Secret 配置狀態:', {
        defined: !!jwtSecret,
        length: jwtSecret?.length,
        firstTwoChars: jwtSecret?.substring(0, 2)
      });
      
      const payload = this.jwtService.verify(token);
      console.log('JWT 驗證成功，payload:', payload);
      
      // 根據 payload 中的信息查找用戶
      // JWT payload 結構: { email: user.email, sub: user.id, roles: user.roles }
      let user = null;
      
      try {
        // 優先使用 userId (sub) 查找
        if (payload.sub) {
          console.log('使用 userId 查找用戶:', payload.sub, '(類型:', typeof payload.sub, ')');
          user = await this.usersService.findById(payload.sub);
          if (user) {
            console.log('使用 ID 找到用戶:', user.id, user.email);
          } else {
            console.log('使用 ID 未找到用戶，檢查用戶是否存在於資料庫');
          }
        }
        
        // 如果 ID 查找失敗，嘗試用 email 查找
        if (!user && payload.email) {
          console.log('使用 email 查找用戶:', payload.email);
          try {
            user = await this.usersService.findOneByEmail(payload.email);
            if (user) {
              console.log('使用 email 找到用戶:', user.id, user.email);
              if (payload.sub !== user.id) {
                console.log('警告：用戶ID不匹配！JWT中的ID:', payload.sub, '實際ID:', user.id);
                console.log('這可能是因為用戶重新註冊或資料庫重置導致的，但會繼續使用 email 找到的用戶');
              }
            } else {
              console.log('使用 email 也未找到用戶');
            }
          } catch (emailError) {
            console.log('email 查找發生錯誤:', emailError.message);
          }
        }
        
        if (!user) {
          console.log('未找到用戶，詳細payload:', JSON.stringify(payload, null, 2));
        }
      } catch (error) {
        console.log('查找用戶時發生錯誤:', error.message);
        console.error('完整錯誤:', error);
      }
      
      console.log('用戶查找結果:', { found: !!user, userId: user?.id, email: user?.email });
      return user;
    } catch (error) {
      console.log('JWT 驗證失敗:', error.message);
      console.log('錯誤詳情:', error);
      return null;
    }
  }

  /**
   * 檢查 JWT 配置端點
   */
  @Public()
  @Get('debug-jwt-config')
  async debugJwtConfig() {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtExpiration = this.configService.get<string>('JWT_EXPIRATION_TIME');
    const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN');
    
    return {
      hasJwtSecret: !!jwtSecret,
      jwtSecretLength: jwtSecret?.length || 0,
      jwtSecretPreview: jwtSecret ? jwtSecret.substring(0, 10) + '...' : null,
      jwtExpiration,
      jwtExpiresIn,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('JWT')),
      nodeEnv: process.env.NODE_ENV
    };
  }

  /**
   * 調試用戶查找端點
   */
  @Public()
  @Get('debug-user')
  async debugUser(@Headers('authorization') authorization: string) {
    console.log('=== DEBUG USER 端點被調用 ===');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return {
        hasAuthorization: false,
        error: '沒有有效的 Bearer token',
        message: '認證失敗'
      };
    }

    try {
      const token = authorization.substring(7);
      const payload = this.jwtService.verify(token);
      
      console.log('JWT 解析成功，payload:', payload);
      
      let debugInfo = {
        hasAuthorization: true,
        jwtPayload: payload,
        userId: payload.sub,
        email: payload.email
      };
      
      // 測試用戶查找
      let user = null;
      if (payload.sub) {
        try {
          user = await this.usersService.findById(payload.sub);
          debugInfo['userFindByIdResult'] = user ? '找到' : '未找到';
          debugInfo['userFindByIdError'] = null;
        } catch (error) {
          debugInfo['userFindByIdResult'] = '錯誤';
          debugInfo['userFindByIdError'] = error.message;
        }
      }
      
      if (!user && payload.email) {
        try {
          user = await this.usersService.findOneByEmail(payload.email);
          debugInfo['userFindByEmailResult'] = user ? '找到' : '未找到';
          debugInfo['userFindByEmailError'] = null;
        } catch (error) {
          debugInfo['userFindByEmailResult'] = '錯誤';
          debugInfo['userFindByEmailError'] = error.message;
        }
      }
      
      debugInfo['finalUser'] = user ? {
        id: user.id,
        email: user.email,
        username: user.username
      } : null;
      
      return debugInfo;
    } catch (error) {
      return {
        hasAuthorization: true,
        jwtError: error.message,
        message: 'JWT 驗證失敗'
      };
    }
  }

  /**
   * 測試 JWT 驗證端點
   */
  @Public()
  @Get('test-jwt')
  async testJwt(@Headers('authorization') authorization: string) {
    console.log('測試 JWT 端點被調用');
    
    // 檢查 JWT secret 配置
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    console.log('JWT Secret 配置狀態:', {
      defined: !!jwtSecret,
      length: jwtSecret?.length,
      firstTwoChars: jwtSecret?.substring(0, 2)
    });
    
    let decodedToken = null;
    let verifyError = null;
    
    // 大臨說明錯誤
    const commonErrors = {
      'JsonWebTokenError: invalid signature': '簽名無效，可能 JWT_SECRET 不匹配',
      'JsonWebTokenError: jwt malformed': '令牌格式不正確',
      'TokenExpiredError': '令牌已過期'
    };
    
    // 嘗試直接解析令牌（不驗證簽名）
    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.substring(7);
      try {
        // decode 只解析不驗證
        decodedToken = this.jwtService.decode(token);
        console.log('令牌解析結果（不驗證簽名）:', decodedToken);
      } catch (error) {
        console.error('令牌解析失敗:', error);
      }
    }
    
    // 正常驗證流程
    const user = await this.getOptionalUser(authorization);
    
    // 取得後端 JWT 配置中的過期時間
    const jwtExpiration = this.configService.get<string>('JWT_EXPIRATION_TIME');
    const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN');
    
    return {
      hasAuthorization: !!authorization,
      authorizationPrefix: authorization?.substring(0, 15),
      hasJwtSecret: !!jwtSecret,
      jwtConfig: {
        expirationTime: jwtExpiration,
        expiresIn: jwtExpiresIn
      },
      decodedToken: decodedToken ? {
        sub: decodedToken['sub'],
        email: decodedToken['email'],
        exp: decodedToken['exp'] ? new Date(decodedToken['exp'] * 1000).toISOString() : null
      } : null,
      user: user ? { id: user.id, email: user.email } : null,
      message: user ? 'JWT 驗證成功' : 'JWT 驗證失敗或無令牌'
    };
  }

  /**
   * 獲取當前用戶的購物車
   */
  @Public()
  @Get()
  async getCart(@Headers('authorization') authorization: string, @Session() session: Record<string, any>, @Req() request: Request) {
    // 嘗試獲取用戶（可選認證）
    const user = await this.getOptionalUser(authorization);
    const userId = user?.id;
    
    // 使用新的穩定會話ID邏輯
    const sessionId = this.getSessionId(request);
    
    console.log('獲取購物車 - 會話信息:', { 
      userId, 
      sessionId, 
      hasUser: !!user, 
      hasSession: !!session
    });

    // 獲取或創建購物車
    const cart = await this.cartsService.getOrCreateCart(userId, sessionId);
    console.log('購物車資料:', { 
      cartId: cart.id, 
      cartUserId: cart.userId, 
      cartSessionId: cart.sessionId, 
      itemsCount: cart.items?.length || 0 
    });
    
    // 獲取詳細信息並返回
    return this.cartsService.getCartDetails(cart);
  }

  /**
   * 新增商品到購物車
   */
  @Public()
  @Post('items')
  async addToCart(
    @Body() createCartItemDto: CreateCartItemDto,
    @Headers('authorization') authorization: string,
    @Session() session: Record<string, any>,
    @Req() request: Request
  ) {
    // 嘗試獲取用戶（可選認證）
    const user = await this.getOptionalUser(authorization);
    const userId = user?.id;
    
    // 使用新的穩定會話ID邏輯
    const sessionId = this.getSessionId(request);

    console.log('添加商品到購物車 - 用戶信息:', { 
      userId, 
      sessionId, 
      hasUser: !!user
    });
    console.log('添加的商品:', createCartItemDto);

    // 先獲取購物車
    const cart = await this.cartsService.getOrCreateCart(userId, sessionId);

    // 添加商品到購物車（傳入整個購物車對象，而不只是ID）
    const newCartItem = await this.cartsService.addItemToCart(cart, createCartItemDto);
    console.log('已新增購物車項目:', { 
      itemId: newCartItem.id, 
      productId: newCartItem.productId,
      quantity: newCartItem.quantity
    });
    
    // 獲取更新後的購物車詳細信息並返回
    const updatedCart = await this.cartsService.getOrCreateCart(userId, sessionId);
    return this.cartsService.getCartDetails(updatedCart);
  }

  /**
   * 更新購物車項目數量
   */
  @Public()
  @Patch('items/:id')
  async updateCartItem(
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Headers('authorization') authorization: string,
    @Session() session: Record<string, any>,
    @Req() request: Request
  ) {
    // 嘗試獲取用戶（可選認證）
    const user = await this.getOptionalUser(authorization);
    const userId = user?.id;
    const sessionId = this.getSessionId(request);

    // 獲取購物車
    const cart = await this.cartsService.getOrCreateCart(userId, sessionId);
    
    // 更新項目並返回
    return this.cartsService.updateCartItem(cart, id, updateCartItemDto);
  }

  /**
   * 從購物車移除項目
   */
  @Public()
  @Delete('items/:id')
  @HttpCode(204)
  async removeFromCart(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
    @Session() session: Record<string, any>,
    @Req() request: Request
  ) {
    // 嘗試獲取用戶（可選認證）
    const user = await this.getOptionalUser(authorization);
    const userId = user?.id;
    const sessionId = this.getSessionId(request);

    // 獲取購物車
    const cart = await this.cartsService.getOrCreateCart(userId, sessionId);
    
    // 移除項目
    await this.cartsService.removeCartItem(cart, id);
  }

  /**
   * 清空購物車
   */
  @Public()
  @Delete()
  @HttpCode(204)
  async clearCart(
    @Headers('authorization') authorization: string,
    @Session() session: Record<string, any>,
    @Req() request: Request
  ) {
    // 嘗試獲取用戶（可選認證）
    const user = await this.getOptionalUser(authorization);
    const userId = user?.id;
    const sessionId = this.getSessionId(request);

    // 獲取購物車
    const cart = await this.cartsService.getOrCreateCart(userId, sessionId);
    
    // 清空購物車
    await this.cartsService.clearCart(cart);
  }

  /**
   * 合併本地購物車到用戶帳號
   */
  @Public()
  @Post('merge')
  async mergeCart(
    @Body() mergeCartDto: { items: any[] },
    @Headers('authorization') authorization: string,
    @Session() session: Record<string, any>,
    @Req() request: Request
  ) {
    // 確保用戶已登入
    const user = await this.getOptionalUser(authorization);
    if (!user?.id) {
      throw new UnauthorizedException('必須登入才能合併購物車');
    }

    const userId = user.id;
    const sessionId = this.getSessionId(request);
    
    // 獲取用戶購物車
    const cart = await this.cartsService.getOrCreateCart(userId, sessionId);
    
    // 遍歷本地項目并添加到購物車
    const results = [];
    for (const item of mergeCartDto.items) {
      const cartItem = await this.cartsService.addItemToCart(cart, {
        productId: item.productId || item.id,
        quantity: item.quantity,
        specs: item.specs
      });
      results.push(cartItem);
    }
    
    // 返回更新後的購物車
    const updatedCart = await this.cartsService.getCartDetails(cart);
    return updatedCart;
  }
}
