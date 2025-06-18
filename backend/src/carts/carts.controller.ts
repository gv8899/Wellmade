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
      
      // 優先使用 userId (sub) 查找
      const userId = payload.sub;
      if (userId) {
        console.log('使用 userId 查找用戶:', userId);
        try {
          user = await this.usersService.findById(userId);
          if (user) {
            console.log('使用 ID 找到用戶:', user.id);
          } else {
            console.log('使用 ID 未找到用戶，將嘗試使用 email');
            
            // 如果 ID 查找失敗，嘗試用 email 查找
            if (payload.email) {
              console.log('使用 email 查找用戶:', payload.email);
              user = await this.usersService.findOneByEmail(payload.email);
              if (user) {
                console.log('使用 email 找到用戶:', user.id);
              } else {
                console.log('使用 email 也未找到用戶');
              }
            }
          }
        } catch (error) {
          console.log('查找用戶時發生錯誤:', error.message);
          console.error('完整錯誤:', error);
        }
      } else if (payload.email) {
        console.log('無 userId，僅使用 email 查找用戶:', payload.email);
        try {
          user = await this.usersService.findOneByEmail(payload.email);
          if (user) {
            console.log('僅使用 email 找到用戶:', user.id);
          } else {
            console.log('僅使用 email 未找到用戶');
          }
        } catch (error) {
          console.log('查找用戶時發生錯誤:', error.message);
        }
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
    
    // 詳細記錄會話信息
    console.log('會話物件完整內容:', session);
    
    // Express 會話 ID 應該被存儲在 request.sessionID
    const cookies = (request.headers.cookie as string) || '';
    console.log('請求 cookies:', cookies);
    
    // 獲取會話 ID
    // 1. 優先使用 express-session 特定的 sessionID
    // 2. 然後嘗試手動從 cookie 中解析 (wellmade.sid)
    // 3. 最後才使用預設值
    let sessionId = (request as any).sessionID || '';
    
    if (!sessionId && cookies) {
      const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('wellmade.sid='));
      if (sessionCookie) {
        sessionId = sessionCookie.trim().substring('wellmade.sid='.length);
      }
    }
    
    if (!sessionId) {
      sessionId = session?.id || 'anonymous-session-' + Date.now();
    }
    
    console.log('獲取購物車 - 詳細會話信息:', { 
      userId, 
      sessionId, 
      hasUser: !!user, 
      hasSession: !!session,
      sessionKeys: session ? Object.keys(session) : [],
      requestSessionID: (request as any).sessionID,
      hasCookies: !!cookies,
      cookiesLength: cookies.length
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
    
    // Express 會話 ID 應該被存儲在 request.sessionID
    const cookies = (request.headers.cookie as string) || '';
    
    // 獲取會話 ID
    let sessionId = (request as any).sessionID || '';
    
    if (!sessionId && cookies) {
      const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('wellmade.sid='));
      if (sessionCookie) {
        sessionId = sessionCookie.trim().substring('wellmade.sid='.length);
      }
    }
    
    if (!sessionId) {
      sessionId = session?.id || 'anonymous-session-' + Date.now();
    }

    console.log('添加商品到購物車 - 用戶信息:', { 
      userId, 
      sessionId, 
      hasUser: !!user, 
      hasSession: !!session,
      requestSessionID: (request as any).sessionID,
      hasCookies: !!cookies
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
    @Session() session: Record<string, any>
  ) {
    // 嘗試獲取用戶（可選認證）
    const user = await this.getOptionalUser(authorization);
    const userId = user?.id;
    const sessionId = session?.id || 'anonymous-session';

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
    @Session() session: Record<string, any>
  ) {
    // 嘗試獲取用戶（可選認證）
    const user = await this.getOptionalUser(authorization);
    const userId = user?.id;
    const sessionId = session?.id || 'anonymous-session';

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
    @Session() session: Record<string, any>
  ) {
    // 嘗試獲取用戶（可選認證）
    const user = await this.getOptionalUser(authorization);
    const userId = user?.id;
    const sessionId = session?.id || 'anonymous-session';

    // 獲取購物車
    const cart = await this.cartsService.getOrCreateCart(userId, sessionId);
    
    // 清空購物車
    await this.cartsService.clearCart(cart);
  }

  /**
   * 合併本地購物車到用戶帳號
   */
  @Post('merge')
  async mergeCart(
    @Body() mergeCartDto: { items: any[] },
    @Headers('authorization') authorization: string,
    @Session() session: Record<string, any>
  ) {
    // 確保用戶已登入
    const user = await this.getOptionalUser(authorization);
    if (!user?.id) {
      throw new UnauthorizedException('必須登入才能合併購物車');
    }

    const userId = user.id;
    const sessionId = session?.id || 'anonymous-session';
    
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
