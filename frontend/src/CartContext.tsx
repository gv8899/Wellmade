"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { cartApi, localCartStorage } from "@/services/cart";
import { productApi } from "@/services/products";
import { useSession } from "next-auth/react";
import { CartItem, AddToCartInput } from "@/types/cart";

// 簡化的購物車狀態
interface CartContextType {
  // 狀態
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // 選擇狀態
  selectedItemIds: string[];
  selectedItems: CartItem[];
  
  // 操作
  addToCart: (input: AddToCartInput) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<boolean>;
  
  // 選擇操作
  setSelectedItemIds: (ids: string[]) => void;
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: () => void;
  unselectAllItems: () => void;
  
  // 計算屬性
  totalAmount: number;
  selectedTotalAmount: number;
  cartClickCount: number;
  addCartClick: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    console.error('[CART] ⚠️  useCart 被在 CartProvider 外使用');
    throw new Error("useCart 必須在 CartProvider 內使用");
  }
  
  // 添加調試信息：追蹤 useCart 的使用
  console.log('[CART] 📌 useCart hook 被呼叫:', {
    cartItemsCount: ctx.cartItems?.length || 0,
    isLoading: ctx.isLoading,
    error: ctx.error,
    isAuthenticated: ctx.isAuthenticated
  });
  
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  console.log('[CART] 🏗️  CartProvider 組件初始化');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartClickCount, setCartClickCount] = useState<number>(0);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const previousAuthState = useRef(isAuthenticated);
  const operationLock = useRef(false);

  // 補充本地購物車項目的完整資訊
  const enrichLocalCartItems = useCallback(async (localItems: CartItem[]): Promise<CartItem[]> => {
    if (localItems.length === 0) return localItems;
    
    console.log('[CART] 開始補充本地購物車項目資訊');
    const enrichedItems: CartItem[] = [];
    
    for (const item of localItems) {
      try {
        // 如果項目已經有完整資訊（名稱不是以 "Product " 開頭），直接使用
        if (item.name && !item.name.startsWith('Product ') && item.price > 0) {
          enrichedItems.push(item);
          continue;
        }
        
        // 提取真實的 productId
        const productId = item.productId || (item.id.includes('_') ? item.id.split('_')[0] : item.id);
        
        console.log('[CART] 補充商品資訊:', productId);
        const productInfo = await productApi.getOne(productId);
        
        // 增強價格處理邏輯 - 優先使用變體價格
        let productPrice = 0;
        
        // 1. 如果項目有 variantId，從 variants 陣列中查找對應變體的價格
        if (item.variantId && productInfo.variants && Array.isArray(productInfo.variants)) {
          const targetVariant = productInfo.variants.find(v => v.id === item.variantId);
          if (targetVariant && targetVariant.price) {
            const variantPrice = typeof targetVariant.price === 'number' 
              ? targetVariant.price 
              : parseFloat(targetVariant.price);
            if (!isNaN(variantPrice) && variantPrice > 0) {
              productPrice = variantPrice;
              console.log('[CART] 補充時使用變體價格:', {
                variantId: item.variantId,
                variantTitle: targetVariant.variantTitle,
                price: productPrice
              });
            }
          }
        }
        
        // 2. 如果沒有變體價格，回退到商品基本價格
        if (productPrice === 0) {
          if (typeof productInfo.price === 'number' && productInfo.price > 0) {
            productPrice = productInfo.price;
          } else if (typeof productInfo.price === 'string' && productInfo.price.trim() !== '') {
            const parsed = parseFloat(productInfo.price);
            productPrice = !isNaN(parsed) && parsed > 0 ? parsed : 0;
          } else if (productInfo.priceRange) {
            // 容器商品：使用 priceRange（但這應該是最後的回退選項）
            if ('price' in productInfo.priceRange && typeof productInfo.priceRange.price === 'number') {
              productPrice = productInfo.priceRange.price;
            } else if ('minPrice' in productInfo.priceRange && typeof productInfo.priceRange.minPrice === 'number') {
              productPrice = productInfo.priceRange.minPrice; // 使用最低價格作為顯示價格
            }
          }
        }
          
        const enrichedItem: CartItem = {
          ...item,
          name: productInfo.name || `商品 ${productId}`,
          price: productPrice,
          cover: productInfo.imageUrl || productInfo.cover || '',
          productId: productId
        };
        
        console.log('[CART] 商品價格處理:', {
          原始價格: productInfo.price,
          原始類型: typeof productInfo.price,
          是否容器商品: productInfo.isContainer,
          價格範圍: productInfo.priceRange,
          轉換後價格: productPrice,
          商品名稱: productInfo.name,
          是否有效: productPrice > 0
        });
        
        enrichedItems.push(enrichedItem);
        console.log('[CART] 成功補充商品資訊:', enrichedItem.name);
      } catch (error) {
        console.warn('[CART] 無法補充商品資訊:', item.id, error);
        // 保留原始項目
        enrichedItems.push(item);
      }
    }
    
    // 如果有更新，保存到本地存儲
    if (enrichedItems.some((item, index) => 
      item.name !== localItems[index]?.name || item.price !== localItems[index]?.price
    )) {
      console.log('[CART] 保存已補充的購物車資訊到本地');
      localCartStorage.saveCart(enrichedItems);
    }
    
    return enrichedItems;
  }, []);

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
        const localItems = localCartStorage.getCart();
        return await enrichLocalCartItems(localItems);
      }
    } else {
      // 訪客模式：從本地存儲獲取並補充資訊
      console.log('[CART] 載入訪客購物車');
      const localItems = localCartStorage.getCart();
      return await enrichLocalCartItems(localItems);
    }
  }, [isAuthenticated, enrichLocalCartItems]);

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
            variantId: (item as any).variantId, // 保留原有的 variantId（如果存在）
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

  // 修復購物車綁定問題
  const fixCartBinding = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      console.log('[CART] 嘗試修復購物車綁定問題');
      const response = await fetch('/api/cart/force-bind', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log('[CART] 購物車綁定修復成功');
        return true;
      } else {
        console.warn('[CART] 購物車綁定修復失敗:', response.status);
        return false;
      }
    } catch (error) {
      console.error('[CART] 購物車綁定修復錯誤:', error);
      return false;
    }
  }, [isAuthenticated]);

  // 刷新購物車
  const refreshCart = useCallback(async (): Promise<boolean> => {
    if (operationLock.current) return false;
    
    operationLock.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const items = await loadCart();
      
      // 如果已登入但購物車為空，嘗試修復綁定問題
      if (isAuthenticated && items.length === 0) {
        console.log('[CART] 🔧 檢測到已登入用戶但購物車為空，嘗試修復綁定問題');
        const fixed = await fixCartBinding();
        if (fixed) {
          console.log('[CART] ✅ 購物車綁定修復成功，重新載入購物車');
          // 重新載入購物車
          const fixedItems = await loadCart();
          setCartItems(fixedItems);
          console.log('[CART] 📊 修復後載入商品數量:', fixedItems.length);
          return true;
        } else {
          console.log('[CART] ❌ 購物車綁定修復失敗');
        }
      }
      
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
  }, [loadCart, isAuthenticated, fixCartBinding]);

  // 添加商品到購物車
  const addToCart = useCallback(async (input: AddToCartInput): Promise<boolean> => {
    if (operationLock.current) return false;
    
    operationLock.current = true;

    try {
      if (isAuthenticated) {
        // 會員模式：樂觀更新 + API 同步
        console.log('[CART] 會員模式樂觀添加商品:', input);
        
        // 首先調用 API，因為添加新商品需要完整的商品資訊
        const response = await cartApi.addToCart({
          productId: input.productId,
          variantId: input.variantId,
          quantity: input.quantity,
          specs: input.specs || {}
        });
        
        if (response.success) {
          // API 成功後立即更新本地狀態，不需要等待 refreshCart
          if (response.data) {
            console.log('[CART] API 添加成功，樂觀更新本地狀態');
            
            // 使用 setState 的函數形式確保使用最新狀態
            setCartItems(prevItems => {
              const currentItems = [...prevItems];
              
              // 檢查是否已存在相同商品（相同 ID 和規格）
              const existingIndex = currentItems.findIndex(item => 
                item.id === response.data.id || 
                (item.productId === input.productId && 
                 JSON.stringify(item.specs) === JSON.stringify(input.specs || {}))
              );
              
              if (existingIndex >= 0) {
                // 更新現有商品數量
                currentItems[existingIndex] = response.data;
              } else {
                // 添加新商品
                currentItems.push(response.data);
              }
              
              console.log('[CART] 樂觀添加完成，界面已更新');
              return currentItems;
            });
          } else {
            // 沒有返回商品數據，回退到重新載入
            await refreshCart();
          }
          return true;
        }
        throw new Error(response.error);
      } else {
        // 訪客模式：保存到本地存儲，但需要獲取商品完整資訊
        console.log('[CART] 訪客模式添加商品:', input);
        
        try {
          // 獲取商品完整資訊
          console.log('[CART] 獲取商品詳細資訊:', input.productId);
          const productInfo = await productApi.getOne(input.productId);
          
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
            // 增強價格處理邏輯 - 優先使用變體價格
          let productPrice = 0;
          
          // 1. 如果有 variantId，從 variants 陣列中查找對應變體的價格
          if (input.variantId && productInfo.variants && Array.isArray(productInfo.variants)) {
            const targetVariant = productInfo.variants.find(v => v.id === input.variantId);
            if (targetVariant && targetVariant.price) {
              const variantPrice = typeof targetVariant.price === 'number' 
                ? targetVariant.price 
                : parseFloat(targetVariant.price);
              if (!isNaN(variantPrice) && variantPrice > 0) {
                productPrice = variantPrice;
                console.log('[CART] 使用變體價格:', {
                  variantId: input.variantId,
                  variantTitle: targetVariant.variantTitle,
                  price: productPrice
                });
              }
            }
          }
          
          // 2. 如果沒有變體價格，回退到商品基本價格
          if (productPrice === 0) {
            if (typeof productInfo.price === 'number' && productInfo.price > 0) {
              productPrice = productInfo.price;
            } else if (typeof productInfo.price === 'string' && productInfo.price.trim() !== '') {
              const parsed = parseFloat(productInfo.price);
              productPrice = !isNaN(parsed) && parsed > 0 ? parsed : 0;
            } else if (productInfo.priceRange) {
              // 容器商品：使用 priceRange（但這應該是最後的回退選項）
              if ('price' in productInfo.priceRange && typeof productInfo.priceRange.price === 'number') {
                productPrice = productInfo.priceRange.price;
              } else if ('minPrice' in productInfo.priceRange && typeof productInfo.priceRange.minPrice === 'number') {
                productPrice = productInfo.priceRange.minPrice; // 使用最低價格作為顯示價格
              }
            }
          }
              
            const cartItem: CartItem = {
              id: fullLocalId,
              productId: input.productId,
              variantId: input.variantId,
              name: productInfo.name || `商品 ${input.productId}`, // 使用真實商品名稱，提供備選
              price: productPrice, // 轉換價格為數字
              quantity: input.quantity,
              cover: productInfo.imageUrl || productInfo.cover || '', // 使用真實封面圖片，支援多種欄位名稱
              specs: input.specs || {},
              // 添加預購相關資訊（如果存在）
              isPreorder: productInfo.isPreorder || false,
              preorderInfo: productInfo.preorderInfo || undefined
            };
            localCart.push(cartItem);
            console.log('[CART] 訪客模式成功添加商品:', {
              name: cartItem.name,
              price: cartItem.price,
              priceValid: cartItem.price > 0,
              cover: cartItem.cover,
              hasImage: !!cartItem.cover,
              isContainer: productInfo.isContainer,
              priceRange: productInfo.priceRange
            });
            
            // 價格驗證和容器商品特殊處理（靜默處理，不顯示詳細通知）
            if (cartItem.price === 0) {
              if (productInfo.isContainer && !input.variantId) {
                console.warn('[CART] 容器商品未選擇變體，價格為 0');
              } else if (productInfo.isContainer && input.variantId) {
                console.warn('[CART] 容器商品已選擇變體但價格仍為 0，可能存在資料問題');
              } else {
                console.warn('[CART] 警告：添加的商品價格為 0，可能需要重新獲取商品資訊');
              }
            }
          }
          
          localCartStorage.saveCart(localCart);
          setCartItems(localCart);
          return true;
        } catch (error) {
          console.error('[CART] 訪客模式獲取商品資訊失敗:', error);
          
          // 降級處理：使用基本資訊，但提供更好的用戶體驗
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
            // 靜默處理，不顯示詳細通知
          } else {
            const tempCartItem: CartItem = {
              id: fullLocalId,
              productId: input.productId,
              variantId: input.variantId,
              name: `商品 ${input.productId.substring(0, 8)}...`, // 更友善的臨時名稱
              price: 0, // 標記為無效價格
              quantity: input.quantity,
              cover: '', // 臨時封面
              specs: input.specs || {},
              // 標記為需要補充資訊的項目
              needsEnrichment: true
            };
            localCart.push(tempCartItem);
            // 靜默處理，不顯示詳細通知
          }
          
          localCartStorage.saveCart(localCart);
          setCartItems(localCart);
          return true;
        }
      }
    } catch (error) {
      console.error('[CART] 添加商品失敗:', error);
      const errorMessage = error instanceof Error ? error.message : '添加商品失敗';
      setError(errorMessage);
      toast.error(`添加商品失敗：${errorMessage}`);
      return false;
    } finally {
      operationLock.current = false;
    }
  }, [isAuthenticated, refreshCart]);

  // 更新商品數量 - 支援樂觀更新
  const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<boolean> => {
    if (operationLock.current || quantity < 1) return false;
    
    operationLock.current = true;

    try {
      if (isAuthenticated) {
        // 會員模式：樂觀更新 + API 同步
        console.log('[CART] 會員模式樂觀更新數量:', { id: itemId, quantity });
        
        // 1. 樂觀更新：立即更新本地狀態
        let oldQuantity: number;
        let targetIndex: number;
        
        setCartItems(prevItems => {
          const currentItems = [...prevItems];
          targetIndex = currentItems.findIndex(item => item.id === itemId);
          
          if (targetIndex >= 0) {
            oldQuantity = currentItems[targetIndex].quantity;
            currentItems[targetIndex].quantity = quantity;
            console.log('[CART] 樂觀更新完成，界面已更新');
            return currentItems;
          }
          return prevItems;
        });
        
        if (targetIndex >= 0) {
          try {
            // 2. 後台同步：調用 API 同步到後端
            const response = await cartApi.updateQuantity(itemId, quantity);
            if (response.success) {
              console.log('[CART] API 同步成功');
              return true;
            } else {
              // API 失敗：回滾樂觀更新
              console.warn('[CART] API 同步失敗，回滾樂觀更新');
              setCartItems(prevItems => {
                const currentItems = [...prevItems];
                if (targetIndex >= 0) {
                  currentItems[targetIndex].quantity = oldQuantity;
                }
                return currentItems;
              });
              throw new Error(response.error);
            }
          } catch (apiError) {
            // API 錯誤：回滾樂觀更新
            console.error('[CART] API 調用失敗，回滾樂觀更新:', apiError);
            setCartItems(prevItems => {
              const currentItems = [...prevItems];
              if (targetIndex >= 0) {
                currentItems[targetIndex].quantity = oldQuantity;
              }
              return currentItems;
            });
            throw apiError;
          }
        } else {
          console.warn('[CART] 找不到要更新的商品:', itemId);
          return false;
        }
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
      const errorMessage = error instanceof Error ? error.message : '更新數量失敗';
      setError(errorMessage);
      // 不顯示 toast，讓調用方處理用戶反饋
      return false;
    } finally {
      operationLock.current = false;
    }
  }, [isAuthenticated, cartItems]);

  // 移除商品 - 支援樂觀更新
  const removeFromCart = useCallback(async (itemId: string): Promise<boolean> => {
    if (operationLock.current) return false;
    
    operationLock.current = true;

    try {
      if (isAuthenticated) {
        // 會員模式：樂觀更新 + API 同步
        console.log('[CART] 會員模式樂觀移除商品:', itemId);
        
        // 1. 樂觀更新：立即從界面移除
        let removedItem: CartItem;
        let targetIndex: number;
        
        setCartItems(prevItems => {
          const currentItems = [...prevItems];
          targetIndex = currentItems.findIndex(item => item.id === itemId);
          
          if (targetIndex >= 0) {
            removedItem = currentItems[targetIndex];
            const updatedItems = currentItems.filter(item => item.id !== itemId);
            console.log('[CART] 樂觀移除完成，界面已更新');
            return updatedItems;
          }
          return prevItems;
        });
        
        if (targetIndex >= 0) {
          try {
            // 2. 後台同步：調用 API 同步到後端
            const response = await cartApi.removeFromCart(itemId);
            if (response.success) {
              console.log('[CART] API 同步成功');
              return true;
            } else {
              // API 失敗：回滾樂觀更新
              console.warn('[CART] API 同步失敗，回滾樂觀更新');
              setCartItems(prevItems => {
                const restoredItems = [...prevItems];
                restoredItems.splice(targetIndex, 0, removedItem);
                return restoredItems;
              });
              throw new Error(response.error);
            }
          } catch (apiError) {
            // API 錯誤：回滾樂觀更新
            console.error('[CART] API 調用失敗，回滾樂觀更新:', apiError);
            setCartItems(prevItems => {
              const restoredItems = [...prevItems];
              restoredItems.splice(targetIndex, 0, removedItem);
              return restoredItems;
            });
            throw apiError;
          }
        } else {
          console.warn('[CART] 找不到要移除的商品:', itemId);
          return false;
        }
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
      const errorMessage = error instanceof Error ? error.message : '移除商品失敗';
      setError(errorMessage);
      // 不顯示 toast，讓調用方處理用戶反饋
      return false;
    } finally {
      operationLock.current = false;
    }
  }, [isAuthenticated, cartItems]);

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

  // 增強總金額計算邏輯
  const totalAmount = cartItems.reduce((sum, item) => {
    // 統一價格處理邏輯
    let itemPrice = 0;
    if (typeof item.price === 'number' && item.price > 0) {
      itemPrice = item.price;
    } else if (typeof item.price === 'string') {
      const parsed = parseFloat(item.price);
      itemPrice = !isNaN(parsed) && parsed > 0 ? parsed : 0;
    }
    
    const itemSubtotal = itemPrice * item.quantity;
    
    // 調試輸出價格計算問題
    if (itemPrice === 0 && process.env.NODE_ENV === 'development') {
      console.warn('[CART] 總金額計算發現無效價格:', {
        id: item.id,
        name: item.name,
        originalPrice: item.price,
        originalPriceType: typeof item.price,
        processedPrice: itemPrice,
        quantity: item.quantity,
        提示: '如果是容器商品，請檢查是否正確處理了 priceRange'
      });
    }
    
    return sum + itemSubtotal;
  }, 0);

  // 點擊計數器
  const addCartClick = useCallback(() => {
    setCartClickCount(prev => prev + 1);
  }, []);

  // 初始載入和登入狀態變化處理
  useEffect(() => {
    const handleAuthChange = async () => {
      console.log('[CART] 🔄 認證狀態檢查:', {
        currentAuth: isAuthenticated,
        previousAuth: previousAuthState.current,
        status,
        operationLocked: operationLock.current
      });
      
      if (previousAuthState.current !== isAuthenticated) {
        console.log('[CART] 🔄 認證狀態改變:', {
          from: previousAuthState.current,
          to: isAuthenticated
        });
        previousAuthState.current = isAuthenticated;
        
        if (isAuthenticated) {
          // 剛登入：合併訪客購物車
          console.log('[CART] 👤 用戶剛登入，開始合併訪客購物車');
          await mergeGuestCart();
        }
        
        // 重新載入購物車
        console.log('[CART] 🔄 認證狀態改變後重新載入購物車');
        await refreshCart();
      } else if (status !== 'loading' && !operationLock.current) {
        // 初始載入：確保不在操作鎖定狀態下
        console.log('[CART] 🚀 執行初始購物車載入');
        await refreshCart();
      }
    };

    handleAuthChange();
  }, [isAuthenticated, status, mergeGuestCart, refreshCart]);

  // 選擇狀態管理：當購物車商品變化時，自動調整選擇狀態
  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectedItemIds(prev => {
        // 移除已經不存在的商品 ID
        const validIds = prev.filter(id => cartItems.some(item => item.id === id));
        // 如果沒有任何選中項目，則全選
        if (validIds.length === 0) {
          return cartItems.map(item => item.id);
        }
        return validIds;
      });
    } else {
      setSelectedItemIds([]);
    }
  }, [cartItems]);

  // 選擇相關的計算屬性
  const selectedItems = cartItems.filter(item => selectedItemIds.includes(item.id));
  const selectedTotalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 選擇操作函數
  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const selectAllItems = useCallback(() => {
    setSelectedItemIds(cartItems.map(item => item.id));
  }, [cartItems]);

  const unselectAllItems = useCallback(() => {
    setSelectedItemIds([]);
  }, []);

  // 添加額外的組件掛載檢查，確保購物車在所有情況下都能正確初始化
  useEffect(() => {
    console.log('[CART] 📊 購物車組件狀態監控:', {
      cartItemsCount: cartItems.length,
      selectedItemsCount: selectedItems.length,
      isLoading,
      error,
      isAuthenticated,
      totalAmount,
      selectedTotalAmount
    });
  }, [cartItems, selectedItems.length, isLoading, error, isAuthenticated, totalAmount, selectedTotalAmount]);

  const contextValue: CartContextType = {
    cartItems,
    isLoading,
    error,
    isAuthenticated,
    selectedItemIds,
    selectedItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    setSelectedItemIds,
    toggleItemSelection,
    selectAllItems,
    unselectAllItems,
    totalAmount,
    selectedTotalAmount,
    cartClickCount,
    addCartClick,
  };

  // 添加調試信息：每次 Context Value 變化時記錄
  useEffect(() => {
    console.log('[CART] 🎯 Context Value 更新:', {
      cartItemsCount: cartItems.length,
      totalAmount,
      isLoading,
      error: error ? error.substring(0, 50) : null,
      isAuthenticated
    });
  }, [cartItems.length, totalAmount, isLoading, error, isAuthenticated]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}