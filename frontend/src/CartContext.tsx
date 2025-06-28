"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { cartApi, localCartStorage } from "@/services/cart";
import { useSession } from "next-auth/react";
import { CartItem, AddToCartInput } from "@/types/cart";

// 簡化的購物車狀態
interface CartContextType {
  // 狀態
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // 操作
  addToCart: (input: AddToCartInput) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<boolean>;
  
  // 計算屬性
  totalAmount: number;
  cartClickCount: number;
  addCartClick: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart 必須在 CartProvider 內使用");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartClickCount, setCartClickCount] = useState<number>(0);
  
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const previousAuthState = useRef(isAuthenticated);
  const operationLock = useRef(false);

  // 載入購物車數據
  const loadCart = useCallback(async (): Promise<CartItem[]> => {
    if (isAuthenticated) {
      // 會員模式：從後端獲取
      try {
        console.log('[CART] 載入會員購物車');
        const response = await cartApi.getCart();
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || '獲取購物車失敗');
      } catch (error) {
        console.error('[CART] 後端獲取失敗，使用本地購物車:', error);
        return localCartStorage.getCart();
      }
    } else {
      // 訪客模式：從本地存儲獲取
      console.log('[CART] 載入訪客購物車');
      return localCartStorage.getCart();
    }
  }, [isAuthenticated]);

  // 合併訪客購物車到會員帳戶
  const mergeGuestCart = useCallback(async (): Promise<void> => {
    const localCart = localCartStorage.getCart();
    if (localCart.length === 0) return;

    console.log('[CART] 合併訪客購物車，項目數:', localCart.length);
    console.log('[CART] 本地購物車項目詳情:', localCart);
    
    try {
      let successCount = 0;
      let skipCount = 0;
      
      for (const item of localCart) {
        try {
          // 提取 productId，支持複合 ID 格式
          let productId = (item as any).productId || item.id;
          
          // 如果是複合 ID (例如: uuid_specs)，提取第一部分
          if (productId && productId.includes('_')) {
            const parts = productId.split('_');
            productId = parts[0];
          }
          
          console.log('[CART] 處理商品:', {
            原始ID: item.id,
            提取的ProductId: productId,
            商品名稱: item.name,
            數量: item.quantity,
            規格: item.specs
          });
          
          if (!productId) {
            console.warn('[CART] 跳過無效的商品ID:', item);
            skipCount++;
            continue;
          }

          // 驗證 productId 是否為 UUID 格式
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(productId)) {
            console.warn('[CART] 跳過非UUID格式的商品ID:', productId);
            skipCount++;
            continue;
          }

          const response = await cartApi.addToCart({
            productId,
            quantity: item.quantity,
            specs: item.specs || {}
          });
          
          if (response.success) {
            successCount++;
          } else {
            console.warn('[CART] 商品添加失敗:', response.error, item);
            skipCount++;
          }
        } catch (itemError) {
          console.warn('[CART] 處理單項商品時出錯:', itemError, item);
          skipCount++;
        }
      }
      
      // 合併完成後清空本地購物車並顯示結果
      localCartStorage.clearCart();
      
      if (successCount > 0) {
        if (skipCount > 0) {
          toast.success(`已將 ${successCount} 項商品加入購物車，跳過 ${skipCount} 項無法處理的商品`);
        } else {
          toast.success(`已將 ${successCount} 項商品加入您的購物車`);
        }
      } else if (skipCount > 0) {
        toast.error(`無法處理 ${skipCount} 項商品，請手動重新添加`);
      }
    } catch (error) {
      console.error('[CART] 合併失敗:', error);
      toast.error('合併購物車失敗，請手動添加商品');
    }
  }, []);

  // 刷新購物車
  const refreshCart = useCallback(async (): Promise<boolean> => {
    if (operationLock.current) return false;
    
    operationLock.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const items = await loadCart();
      setCartItems(items);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '載入購物車失敗';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
      operationLock.current = false;
    }
  }, [loadCart]);

  // 添加商品到購物車
  const addToCart = useCallback(async (input: AddToCartInput): Promise<boolean> => {
    if (operationLock.current) return false;
    
    operationLock.current = true;

    try {
      if (isAuthenticated) {
        // 會員模式：直接調用 API
        console.log('[CART] 會員模式添加商品:', input);
        
        const response = await cartApi.addToCart({
          productId: input.productId,
          variantId: input.variantId,
          quantity: input.quantity,
          specs: input.specs || {}
        });
        
        if (response.success) {
          await refreshCart();
          return true;
        }
        throw new Error(response.error);
      } else {
        // 訪客模式：保存到本地存儲
        console.log('[CART] 訪客模式添加商品:', input);
        
        // 為訪客模式生成本地購物車項目 ID
        const localItemId = input.variantId || input.productId;
        const specsString = input.specs ? Object.entries(input.specs)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}:${v}`)
          .join('_') : '';
        const fullLocalId = specsString ? `${localItemId}_${specsString}` : localItemId;
        
        const localCart = localCartStorage.getCart();
        const existingIndex = localCart.findIndex(cartItem => cartItem.id === fullLocalId);
        
        if (existingIndex >= 0) {
          localCart[existingIndex].quantity += input.quantity;
        } else {
          // 為訪客模式創建臨時購物車項目（缺少部分顯示資訊）
          const tempCartItem: CartItem = {
            id: fullLocalId,
            productId: input.productId,
            variantId: input.variantId,
            name: `Product ${input.productId}`, // 臨時名稱
            price: 0, // 臨時價格，需要後續從產品資料補充
            quantity: input.quantity,
            cover: '', // 臨時封面
            specs: input.specs || {}
          };
          localCart.push(tempCartItem);
        }
        
        localCartStorage.saveCart(localCart);
        setCartItems(localCart);
        return true;
      }
    } catch (error) {
      console.error('[CART] 添加商品失敗:', error);
      setError(error instanceof Error ? error.message : '添加商品失敗');
      return false;
    } finally {
      operationLock.current = false;
    }
  }, [isAuthenticated, refreshCart]);

  // 更新商品數量
  const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<boolean> => {
    if (operationLock.current || quantity < 1) return false;
    
    operationLock.current = true;

    try {
      if (isAuthenticated) {
        // 會員模式：調用 API
        const response = await cartApi.updateQuantity(itemId, quantity);
        if (response.success) {
          await refreshCart();
          return true;
        }
        throw new Error(response.error);
      } else {
        // 訪客模式：更新本地存儲
        const localCart = localCartStorage.getCart();
        const index = localCart.findIndex(item => item.id === itemId);
        
        if (index >= 0) {
          localCart[index].quantity = quantity;
          localCartStorage.saveCart(localCart);
          setCartItems(localCart);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('[CART] 更新數量失敗:', error);
      setError(error instanceof Error ? error.message : '更新數量失敗');
      return false;
    } finally {
      operationLock.current = false;
    }
  }, [isAuthenticated, refreshCart]);

  // 移除商品
  const removeFromCart = useCallback(async (itemId: string): Promise<boolean> => {
    if (operationLock.current) return false;
    
    operationLock.current = true;

    try {
      if (isAuthenticated) {
        // 會員模式：調用 API
        const response = await cartApi.removeFromCart(itemId);
        if (response.success) {
          await refreshCart();
          return true;
        }
        throw new Error(response.error);
      } else {
        // 訪客模式：從本地存儲移除
        const localCart = localCartStorage.getCart();
        const filteredCart = localCart.filter(item => item.id !== itemId);
        
        localCartStorage.saveCart(filteredCart);
        setCartItems(filteredCart);
        return true;
      }
    } catch (error) {
      console.error('[CART] 移除商品失敗:', error);
      setError(error instanceof Error ? error.message : '移除商品失敗');
      return false;
    } finally {
      operationLock.current = false;
    }
  }, [isAuthenticated, refreshCart]);

  // 清空購物車
  const clearCart = useCallback(async (): Promise<boolean> => {
    if (operationLock.current) return false;
    
    operationLock.current = true;

    try {
      if (isAuthenticated) {
        // 會員模式：調用 API
        const response = await cartApi.clearCart();
        if (response.success) {
          setCartItems([]);
          return true;
        }
        throw new Error(response.error);
      } else {
        // 訪客模式：清空本地存儲
        localCartStorage.clearCart();
        setCartItems([]);
        return true;
      }
    } catch (error) {
      console.error('[CART] 清空購物車失敗:', error);
      setError(error instanceof Error ? error.message : '清空購物車失敗');
      return false;
    } finally {
      operationLock.current = false;
    }
  }, [isAuthenticated]);

  // 計算總金額
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 點擊計數器
  const addCartClick = useCallback(() => {
    setCartClickCount(prev => prev + 1);
  }, []);

  // 初始載入和登入狀態變化處理
  useEffect(() => {
    const handleAuthChange = async () => {
      if (previousAuthState.current !== isAuthenticated) {
        previousAuthState.current = isAuthenticated;
        
        if (isAuthenticated) {
          // 剛登入：合併訪客購物車
          await mergeGuestCart();
        }
        
        // 重新載入購物車
        await refreshCart();
      } else if (status !== 'loading') {
        // 初始載入
        await refreshCart();
      }
    };

    handleAuthChange();
  }, [isAuthenticated, status, mergeGuestCart, refreshCart]);

  const contextValue: CartContextType = {
    cartItems,
    isLoading,
    error,
    isAuthenticated,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    totalAmount,
    cartClickCount,
    addCartClick,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}