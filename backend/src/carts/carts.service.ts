import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    
    private productsService: ProductsService,
  ) {}

  /**
   * 根據 userId 或 sessionId 查找購物車，如果不存在則創建一個新的
   */
  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    let cart: Cart;

    // 優先根據用戶 ID 查詢
    if (userId) {
      cart = await this.cartRepository.findOne({ 
        where: { userId },
        relations: ['items']
      });
    }
    
    // 如果沒有用戶 ID 或找不到購物車，則根據會話 ID 查詢
    if (!cart && sessionId) {
      cart = await this.cartRepository.findOne({
        where: { sessionId },
        relations: ['items']
      });
    }

    // 如果仍然找不到購物車，則創建一個新的
    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        sessionId,
        items: []
      });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  /**
   * 獲取購物車詳情
   */
  async getCartDetails(cart: Cart): Promise<Cart> {
    return cart;
  }

  /**
   * 添加商品到購物車
   */
  async addItemToCart(
    cart: Cart,
    createCartItemDto: CreateCartItemDto
  ): Promise<CartItem> {
    const { productId, variantId, quantity, specs } = createCartItemDto;

    // 檢查產品是否存在
    const product = await this.productsService.findOne(productId);
    
    if (!product) {
      throw new NotFoundException(`找不到 ID 為 ${productId} 的產品`);
    }

    // 檢查購物車中是否已存在相同的商品（相同產品和規格）
    const existingItem = cart.items?.find(item => 
      item.productId === productId && 
      item.variantId === variantId &&
      JSON.stringify(item.specs) === JSON.stringify(specs)
    );

    if (existingItem) {
      // 更新現有項目的數量
      existingItem.quantity += quantity;
      return this.cartItemRepository.save(existingItem);
    }

    // 創建新的購物車項目
    const cartItem = this.cartItemRepository.create({
      cartId: cart.id,
      productId,
      variantId,
      quantity,
      specs,
      name: product.name,
      price: product.price,
      cover: product.images && product.images.length > 0 ? product.images[0] : null
    });

    // 保存並返回
    await this.cartItemRepository.save(cartItem);
    
    // 更新購物車的項目數組
    cart.items = [...(cart.items || []), cartItem];
    await this.cartRepository.save(cart);

    return cartItem;
  }

  /**
   * 更新購物車項目數量
   */
  async updateCartItem(
    cart: Cart,
    itemId: string,
    updateCartItemDto: UpdateCartItemDto
  ): Promise<CartItem> {
    // 查詢並確保該項目屬於指定的購物車
    const cartItem = cart.items?.find(item => item.id === itemId);

    if (!cartItem) {
      throw new NotFoundException(`找不到 ID 為 ${itemId} 的購物車項目`);
    }

    // 更新項目屬性
    Object.assign(cartItem, updateCartItemDto);
    
    // 保存並返回
    return this.cartItemRepository.save(cartItem);
  }

  /**
   * 從購物車中移除項目
   */
  async removeCartItem(cart: Cart, itemId: string): Promise<void> {
    // 查詢並確保該項目屬於指定的購物車
    const cartItem = cart.items?.find(item => item.id === itemId);

    if (!cartItem) {
      throw new NotFoundException(`找不到 ID 為 ${itemId} 的購物車項目`);
    }

    // 從數據庫中刪除
    await this.cartItemRepository.remove(cartItem);

    // 更新購物車的項目數組（移除已刪除的項目）
    cart.items = cart.items.filter(item => item.id !== itemId);
    await this.cartRepository.save(cart);
  }

  /**
   * 清空購物車
   */
  async clearCart(cart: Cart): Promise<void> {
    // 如果購物車沒有項目，則不執行任何操作
    if (!cart.items || cart.items.length === 0) {
      return;
    }

    // 刪除所有購物車項目
    await this.cartItemRepository.remove(cart.items);
    
    // 更新購物車的項目數組
    cart.items = [];
    await this.cartRepository.save(cart);
  }

  /**
   * 合併購物車（用於用戶登錄後合併匿名購物車）
   */
  async mergeCart(sourceCart: Cart, targetCart: Cart): Promise<Cart> {
    if (!sourceCart.items || sourceCart.items.length === 0) {
      return targetCart;
    }

    // 遍歷源購物車的每個項目
    for (const item of sourceCart.items) {
      // 檢查目標購物車是否已包含相同的項目
      const existingItem = targetCart.items?.find(ti => 
        ti.productId === item.productId && 
        ti.variantId === item.variantId &&
        JSON.stringify(ti.specs) === JSON.stringify(item.specs)
      );

      if (existingItem) {
        // 更新現有項目的數量
        existingItem.quantity += item.quantity;
        await this.cartItemRepository.save(existingItem);
      } else {
        // 創建新的購物車項目
        const newItem = this.cartItemRepository.create({
          cartId: targetCart.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          specs: item.specs,
          name: item.name,
          price: item.price,
          cover: item.cover
        });
        
        await this.cartItemRepository.save(newItem);
        
        // 更新目標購物車的項目數組
        targetCart.items = [...(targetCart.items || []), newItem];
      }
    }

    // 保存目標購物車
    await this.cartRepository.save(targetCart);
    
    // 清除源購物車
    await this.clearCart(sourceCart);
    
    return targetCart;
  }
}
