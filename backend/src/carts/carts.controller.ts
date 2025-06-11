import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, Session, HttpCode, NotFoundException } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AuthenticatedRequest } from './interfaces/request.interface';

@Controller('cart')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  /**
   * 獲取當前用戶的購物車
   */
  @Get()
  async getCart(@Req() req: AuthenticatedRequest, @Session() session: Record<string, any>) {
    // 取得用戶ID（如果已登入）或會話ID
    const userId = req.user?.id;
    const sessionId = session.id;

    // 獲取或創建購物車
    const cart = await this.cartsService.getOrCreateCart(userId, sessionId);
    
    // 獲取詳細信息並返回
    return this.cartsService.getCartDetails(cart);
  }

  /**
   * 新增商品到購物車
   */
  @Post('items')
  async addToCart(
    @Body() createCartItemDto: CreateCartItemDto,
    @Req() req: AuthenticatedRequest,
    @Session() session: Record<string, any>
  ) {
    // 取得用戶ID（如果已登入）或會話ID
    const userId = req.user?.id;
    const sessionId = session.id;

    // 獲取或創建購物車
    const cart = await this.cartsService.getOrCreateCart(userId, sessionId);
    
    // 添加商品並返回
    return this.cartsService.addItemToCart(cart, createCartItemDto);
  }

  /**
   * 更新購物車項目數量
   */
  @Patch('items/:id')
  async updateCartItem(
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Req() req: AuthenticatedRequest,
    @Session() session: Record<string, any>
  ) {
    // 取得用戶ID（如果已登入）或會話ID
    const userId = req.user?.id;
    const sessionId = session.id;

    // 獲取購物車
    const cart = await this.cartsService.getOrCreateCart(userId, sessionId);
    
    // 更新項目
    return this.cartsService.updateCartItem(cart, id, updateCartItemDto);
  }

  /**
   * 從購物車移除項目
   */
  @Delete('items/:id')
  @HttpCode(204)
  async removeFromCart(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Session() session: Record<string, any>
  ) {
    // 取得用戶ID（如果已登入）或會話ID
    const userId = req.user?.id;
    const sessionId = session.id;

    // 獲取購物車
    const cart = await this.cartsService.getOrCreateCart(userId, sessionId);
    
    // 刪除項目
    await this.cartsService.removeCartItem(cart, id);
  }

  /**
   * 清空購物車
   */
  @Delete()
  @HttpCode(204)
  async clearCart(
    @Req() req: AuthenticatedRequest,
    @Session() session: Record<string, any>
  ) {
    // 取得用戶ID（如果已登入）或會話ID
    const userId = req.user?.id;
    const sessionId = session.id;

    // 獲取購物車
    const cart = await this.cartsService.getOrCreateCart(userId, sessionId);
    
    // 清空購物車
    await this.cartsService.clearCart(cart);
  }
}
