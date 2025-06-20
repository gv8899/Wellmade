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
   * 如果用戶已登入，會更新已存在的匿名購物車為該用戶的購物車
   */
  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    console.log('getOrCreateCart 被調用，參數:', { userId, sessionId });
    let cart: Cart;

    // 優先根據用戶 ID 查詢
    if (userId) {
      console.log('嘗試根據用戶 ID 查找購物車:', userId);
      cart = await this.cartRepository.findOne({ 
        where: { userId },
        relations: ['items', 'items.product']
      });
      
      if (cart) {
        console.log('找到用戶購物車:', cart.id);
      }
    }
    
    // 如果沒有用戶 ID 或找不到購物車，則根據會話 ID 查詢
    if (!cart && sessionId) {
      console.log('嘗試根據會話 ID 查找購物車:', sessionId);
      cart = await this.cartRepository.findOne({
        where: { sessionId },
        relations: ['items', 'items.product']
      });
      
      // 如果找到匿名購物車，且有用戶ID，則更新為該用戶的購物車
      if (cart && userId) {
        console.log('更新匿名購物車為用戶購物車, 用戶ID:', userId);
        
        // 檢查該用戶是否已有購物車
        const existingUserCart = await this.cartRepository.findOne({
          where: { userId },
          relations: ['items', 'items.product']
        });
        
        if (existingUserCart) {
          console.log('用戶已有購物車，合併匿名購物車項目到用戶購物車');
          // 合併購物車項目
          for (const item of cart.items) {
            // 查找用戶購物車中是否已有相同產品
            const existingItem = existingUserCart.items.find(i => i.productId === item.productId);
            if (existingItem) {
              // 增加數量
              existingItem.quantity += item.quantity;
              await this.cartItemRepository.save(existingItem);
            } else {
              // 移動項目到用戶購物車
              item.cart = existingUserCart;
              await this.cartItemRepository.save(item);
            }
          }
          // 刪除匿名購物車
          await this.cartRepository.remove(cart);
          cart = existingUserCart;
        } else {
          // 直接將匿名購物車轉換為用戶購物車
          cart.userId = userId;
          cart.sessionId = null; // 清除會話ID，確保這是一個純用戶購物車
          await this.cartRepository.save(cart);
        }
      }
    }

    // 如果仍然找不到購物車，則創建一個新的
    if (!cart) {
      console.log('創建新購物車, 參數:', { userId, sessionId });
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
    // 使用事務確保數據一致性
    await this.cartItemRepository.manager.transaction(async transactionalEntityManager => {
      // 查詢並確保該項目屬於指定的購物車
      const cartItem = cart.items?.find(item => item.id === itemId);

      if (!cartItem) {
        throw new NotFoundException(`找不到 ID 為 ${itemId} 的購物車項目`);
      }

      console.log(`刪除購物車項目: ${itemId} from cart: ${cart.id}`);
      
      // 在事務中刪除購物車項目
      await transactionalEntityManager.remove(cartItem);
      
      // 重新加載購物車以獲取最新狀態
      const updatedCart = await transactionalEntityManager.findOne(this.cartRepository.target, {
        where: { id: cart.id },
        relations: ['items']
      });
      
      if (updatedCart) {
        // 確認項目確實已被刪除
        const itemStillExists = updatedCart.items?.some(item => item.id === itemId);
        if (itemStillExists) {
          throw new Error(`購物車項目 ${itemId} 刪除失敗`);
        }
        console.log(`購物車項目 ${itemId} 已成功刪除，剩餘 ${updatedCart.items?.length || 0} 項`);
      }
    });
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
