import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // 覆寫 canActivate 方法，使其始終返回 true
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // 嘗試執行 JWT 驗證
      const result = await super.canActivate(context);
      return true; // 無論驗證結果如何，都允許請求通過
    } catch (error) {
      // 如果驗證失敗，仍然允許請求通過
      console.log('JWT 驗證失敗，但允許請求繼續:', error.message);
      return true;
    }
  }

  // 覆寫 handleRequest 方法，即使驗證失敗也不拋出錯誤
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // 如果有用戶，返回用戶；否則返回 null
    // 不拋出錯誤，允許請求繼續
    if (err || !user) {
      console.log('JWT 驗證失敗或無令牌，繼續處理未認證請求:', {
        err: err?.message,
        info: info?.message,
      });
      return null;
    }

    console.log('JWT 驗證成功，用戶:', { id: user.id, email: user.email });
    return user;
  }
}
