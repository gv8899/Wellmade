"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { cartApi, localCartStorage, sessionManager } from "@/services/cart";
import { useSession } from "next-auth/react";
import { consoleLogger } from "@/utils/console-logger";
import { 
  CartMode, 
  CartEvent, 
  CartStateMachine, 
  CartState, 
  CartOperationResult,
  CartItem
} from "@/types/cart";
import { ProductStatus, InventoryType, canPurchaseVariant, getCurrentPrice } from "@/types/product";

// 工具函數：驗證 UUID 格式
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// 工具函數：從購物車項目 ID 中提取 productId 和 variantId
function extractProductInfo(itemId: string): { productId: string | null; variantId: string | null } {
  if (!itemId || typeof itemId !== 'string') {
    return { productId: null, variantId: null };
  }

  // 情況1：直接是 UUID（例如：产品ID）
  if (isValidUUID(itemId)) {
    return { productId: itemId, variantId: null };
  }

  // 情況2：格式為 productId_specs 或 productId_variantId
  const parts = itemId.split('_');
  const potentialProductId = parts[0];
  
  if (isValidUUID(potentialProductId)) {
    // 如果第一部分是有效 UUID，檢查第二部分是否也是 UUID（變體ID）
    const potentialVariantId = parts[1];
    if (potentialVariantId && isValidUUID(potentialVariantId)) {
      return { productId: potentialProductId, variantId: potentialVariantId };
    }
    return { productId: potentialProductId, variantId: null };
  }

  // 情況3：舊格式或無效格式
  console.warn(`無法從 ID 中提取有效的 productId: ${itemId}`);
  return { productId: null, variantId: null };
}

// 工具函數：清理購物車中的無效項目
function cleanInvalidCartItems(items: CartItem[]): CartItem[] {
  const validItems: CartItem[] = [];
  const invalidItems: CartItem[] = [];

  for (const item of items) {
    const productId = (item as any).productId || item.id;
    if (productId && isValidUUID(productId)) {
      validItems.push(item);
    } else {
      invalidItems.push(item);
    }
  }

  if (invalidItems.length > 0) {
    console.warn(`[CART_CLEANUP] 清理了 ${invalidItems.length} 項無效商品:`, 
      invalidItems.map(item => ({ id: item.id, name: item.name }))
    );
  }

  return validItems;
}

export interface CartItemInput extends Omit<CartItem, "quantity"> {
  quantity?: number; // 可選的數量參數
}

interface CartContextType {
  // 狀態
  cartItems: CartItem[];
  currentMode: CartMode;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // 操作
  addToCart: (item: CartItemInput) => Promise<CartOperationResult>;
  removeFromCart: (itemId: string) => Promise<CartOperationResult>;
  updateQuantity: (itemId: string, quantity: number) => Promise<CartOperationResult>;
  clearCart: () => Promise<CartOperationResult>;
  refreshCart: () => Promise<CartOperationResult>;
  
  // 狀態管理
  transitionTo: (event: CartEvent) => boolean;
  
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
  // 狀態機實例
  const stateMachine = useRef(new CartStateMachine()).current;
  
  // 狀態
  const [cartState, setCartState] = useState<CartState>({
    mode: CartMode.GUEST,
    items: [],
    isLoading: true,
    error: null,
    lastSyncTime: 0
  });
  
  const [cartClickCount, setCartClickCount] = useState<number>(0);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const previousSessionRef = useRef(session);
  
  // 防止重複操作的鎖
  const operationLock = useRef(false);

  // 狀態轉換函數
  const transitionTo = useCallback((event: CartEvent): boolean => {
    if (!stateMachine.canTransition(event)) {
      console.warn(`無法執行狀態轉換: ${stateMachine.getCurrentMode()} -> ${event}`);
      return false;
    }
    
    const success = stateMachine.transition(event);
    if (success) {
      setCartState(prev => ({ ...prev, mode: stateMachine.getCurrentMode() }));
      return true;
    }
    return false;
  }, [stateMachine]);
  
  // 基於模式的資料載入
  const loadCartByMode = useCallback(async (mode: CartMode): Promise<CartItem[]> => {
    console.log(`[LOAD_CART] 載入購物車，模式: ${mode}`);
    
    switch (mode) {
      case CartMode.GUEST:
      case CartMode.OFFLINE:
        const localItems = localCartStorage.getCart();
        console.log(`[LOAD_CART] 本地購物車商品:`, localItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity
        })));
        return localItems;
        
      case CartMode.MEMBER:
        try {
          console.log(`[LOAD_CART] 從後端獲取會員購物車...`);
          const response = await cartApi.getCart();
          console.log(`[LOAD_CART] 後端響應:`, response);
          
          if (response.success && response.data) {
            console.log(`[LOAD_CART] 會員購物車載入完成，${response.data.length} 項商品`);
            return response.data;
          }
          throw new Error(response.error || '獲取購物車失敗');
        } catch (error) {
          console.error('API 獲取購物車失敗:', error);
          // 轉入離線模式
          stateMachine.enterOfflineMode();
          setCartState(prev => ({ ...prev, mode: CartMode.OFFLINE }));
          return localCartStorage.getCart();
        }
        
      case CartMode.SYNCING:
        return []; // 同步中不載入資料
        
      default:
        return [];
    }
  }, [stateMachine]);
  
  // 刷新購物車資料
  const refreshCart = useCallback(async (): Promise<CartOperationResult> => {
    if (operationLock.current) {
      return { success: false, error: '操作進行中' };
    }
    
    operationLock.current = true;
    setCartState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const items = await loadCartByMode(cartState.mode);
      setCartState(prev => ({
        ...prev,
        items,
        isLoading: false,
        lastSyncTime: Date.now()
      }));
      
      return { success: true, data: items };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '刷新購物車失敗';
      setCartState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      operationLock.current = false;
    }
  }, [cartState.mode, loadCartByMode]);

  // 使用單一數據源原則的合併邏輯
  const handleLoginSync = useCallback(async (): Promise<CartOperationResult> => {
    if (!transitionTo(CartEvent.LOGIN_START)) {
      return { success: false, error: '無法開始登入同步' };
    }
    
    try {
      // 先清空當前購物車狀態，避免前一個用戶的商品ID導致權限錯誤
      setCartState(prev => ({ ...prev, items: [] }));
      
      // 等待 session 完全載入
      if (!session || !(session as any).backendToken) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (!session || !(session as any).backendToken) {
        transitionTo(CartEvent.LOGIN_FAILURE);
        return { success: false, error: 'Session 或 Token 不存在' };
      }
      
      const rawLocalCart = localCartStorage.getCart();
      
      // 清理無效的購物車項目
      const localCart = cleanInvalidCartItems(rawLocalCart);
      
      // 如果清理後有變化，更新本地存儲
      if (localCart.length !== rawLocalCart.length) {
        localCartStorage.saveCart(localCart);
        toast.info(`已清理 ${rawLocalCart.length - localCart.length} 項無效商品`);
      }
      
      if (localCart.length > 0) {
        // 有本地購物車，需要合併
        console.log(`登入同步：合併 ${localCart.length} 項本地商品`);
        consoleLogger.cartAction('開始登入同步', { localItemCount: localCart.length });
        
        let successCount = 0;
        const failedItems: CartItem[] = [];
        
        for (const item of localCart) {
          try {
            // 從本地購物車項目中提取 productId 和 variantId
            const productId = (item as any).productId;
            const variantId = (item as any).variantId;
            
            // 如果沒有 productId，嘗試從 item.id 中解析
            let finalProductId = productId;
            if (!finalProductId && item.id) {
              // 如果 item.id 是 UUID 格式，直接使用
              if (isValidUUID(item.id)) {
                finalProductId = item.id;
              } else {
                // 如果是組合 ID，嘗試提取第一部分作為 productId
                const parts = item.id.split('_');
                if (parts.length > 0 && isValidUUID(parts[0])) {
                  finalProductId = parts[0];
                }
              }
            }
            
            // 跳過無效的商品 ID
            if (!finalProductId || !isValidUUID(finalProductId)) {
              console.warn(`[LOGIN_SYNC] 跳過無效商品 ID: ${finalProductId}，商品名: ${item.name}`);
              consoleLogger.warn('cart', `跳過無效商品 ID: ${finalProductId}`, { itemName: item.name, originalId: item.id });
              failedItems.push(item);
              continue;
            }
            
            console.log(`[LOGIN_SYNC] 準備合併商品:`, {
              原始ID: item.id,
              最終productId: finalProductId,
              提取的variantId: variantId,
              name: item.name,
              quantity: item.quantity,
              specs: item.specs
            });
            
            const response = await cartApi.addToCart({
              productId: finalProductId,
              ...(variantId && { variantId }),
              quantity: item.quantity,
              specs: item.specs
            });
            
            console.log(`[LOGIN_SYNC] 合併結果:`, response);
            
            if (response.success) {
              successCount++;
              console.log(`成功合併商品: ${item.name}`);
            } else {
              failedItems.push(item);
              console.error(`合併商品失敗: ${item.name}`, response.error);
            }
          } catch (error) {
            failedItems.push(item);
            console.error(`合併商品異常: ${item.name}`, error);
          }
        }
        
        if (successCount > 0) {
          // 只有成功合併的商品才從本地清除
          const remainingItems = failedItems;
          localCartStorage.saveCart(remainingItems);
          
          if (failedItems.length === 0) {
            toast.success(`已成功合併 ${successCount} 項商品到您的帳號`);
          } else {
            toast.warning(`已合併 ${successCount} 項商品，${failedItems.length} 項商品合併失敗，仍保存在本地`);
          }
        } else {
          toast.error('購物車合併失敗，商品仍保存在本地');
        }
      }
      
      // 轉換到會員模式並加載資料
      transitionTo(CartEvent.LOGIN_SUCCESS);
      const memberCart = await loadCartByMode(CartMode.MEMBER);
      
      setCartState(prev => ({
        ...prev,
        items: memberCart,
        lastSyncTime: Date.now()
      }));
      
      return { success: true, data: memberCart };
      
    } catch (error) {
      console.error('登入同步失敗:', error);
      transitionTo(CartEvent.LOGIN_FAILURE);
      
      // 失敗時保持本地購物車
      const localCart = localCartStorage.getCart();
      setCartState(prev => ({ ...prev, items: localCart }));
      
      toast.error('購物車同步失敗，但商品仍在本地保存');
      return { success: false, error: error instanceof Error ? error.message : '登入同步失敗' };
    }
  }, [session, transitionTo, loadCartByMode]);
  
  // 登出處理
  const handleLogoutSync = useCallback(async (): Promise<CartOperationResult> => {
    if (!transitionTo(CartEvent.LOGOUT_START)) {
      return { success: false, error: '無法開始登出同步' };
    }
    
    try {
      // 轉換到訪客模式並加載本地資料
      transitionTo(CartEvent.LOGOUT_SUCCESS);
      const guestCart = await loadCartByMode(CartMode.GUEST);
      
      setCartState(prev => ({
        ...prev,
        items: guestCart,
        lastSyncTime: Date.now()
      }));
      
      console.log(`登出同步：載入 ${guestCart.length} 項本地商品`);
      return { success: true, data: guestCart };
      
    } catch (error) {
      console.error('登出同步失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '登出同步失敗' };
    }
  }, [transitionTo, loadCartByMode]);

  // 初始化購物車
  useEffect(() => {
    if (cartState.isLoading && cartState.lastSyncTime === 0) {
      // 第一次初始化
      const initialMode = isAuthenticated ? CartMode.MEMBER : CartMode.GUEST;
      stateMachine.reset(initialMode);
      setCartState(prev => ({ ...prev, mode: initialMode }));
      refreshCart();
    }
  }, [cartState.isLoading, cartState.lastSyncTime, isAuthenticated, refreshCart]);
  
  // 監聽認證狀態變化
  useEffect(() => {
    if (cartState.lastSyncTime === 0) return; // 未初始化
    
    if (status === 'authenticated' && cartState.mode === CartMode.GUEST) {
      // 用戶登入：清空session緩存並從訪客模式轉換到會員模式
      console.log('[CART] 檢測到用戶登入，清空session緩存');
      sessionManager.clearCache();
      handleLoginSync();
    } else if (status === 'unauthenticated' && cartState.mode === CartMode.MEMBER) {
      // 用戶登出：清空session緩存並從會員模式轉換到訪客模式
      console.log('[CART] 檢測到用戶登出，清空session緩存');
      sessionManager.clearCache();
      handleLogoutSync();
    }
  }, [status, cartState.mode, cartState.lastSyncTime, handleLoginSync, handleLogoutSync]);

  // 監聽 localStorage 變動（跨分頁/視窗）
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "cart" && cartState.mode === CartMode.GUEST) {
        // 只有在訪客模式下才同步 localStorage 變化
        const newItems = e.newValue ? JSON.parse(e.newValue) : [];
        setCartState(prev => ({ ...prev, items: newItems }));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [cartState.mode]);
  
  // 監聽購物車項目變化，更新 localStorage
  useEffect(() => {
    if (cartState.lastSyncTime > 0 && (cartState.mode === CartMode.GUEST || cartState.mode === CartMode.OFFLINE)) {
      // 只有在訪客模式或離線模式下才保存到 localStorage
      localCartStorage.saveCart(cartState.items);
    }
  }, [cartState.items, cartState.mode, cartState.lastSyncTime]);

  // 計數器相關功能
  const addCartClick = useCallback(() => {
    setCartClickCount(prev => {
      const next = prev + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem("cartClickCount", String(next));
      }
      return next;
    });
  }, []);
  
  // 初始化 cartClickCount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCount = localStorage.getItem("cartClickCount");
      setCartClickCount(savedCount ? parseInt(savedCount, 10) : 0);
    }
  }, []);
  
  // 計算總金額（支援預購商品）
  const totalAmount = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // 計算預購商品數量
  const preorderItemsCount = cartState.items.filter(item => item.isPreorder).length;
  const regularItemsCount = cartState.items.filter(item => !item.isPreorder).length;

  // 增強的添加商品功能，支援預購
  const addToCart = useCallback(async (item: CartItemInput): Promise<CartOperationResult> => {
    if (operationLock.current) {
      return { success: false, error: '操作進行中' };
    }
    
    operationLock.current = true;
    setCartState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const quantity = item.quantity || 1;
    
    // 增強的預購信息處理
    const enhancedItem: CartItem = { 
      ...item, 
      quantity,
      // 檢查是否為預購商品
      isPreorder: (item as any).status === ProductStatus.PREORDER || 
                  (item as any).inventoryType === InventoryType.PREORDER_LIMITED || 
                  (item as any).inventoryType === InventoryType.PREORDER_UNLIMITED,
      // 添加預購信息
      preorderInfo: (item as any).status === ProductStatus.PREORDER ? {
        expectedShipDate: (item as any).expectedShipDate,
        preorderDescription: (item as any).preorderDescription,
        preorderLimit: (item as any).preorderLimit,
        preorderSold: (item as any).preorderSold
      } : undefined
    };
    
    try {
      // 檢查是否已存在相同商品
      const existingItem = cartState.items.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // 已存在，直接更新數量而不呼叫 updateQuantity 以避免循環依賴
        const newQuantity = existingItem.quantity + quantity;
        
        // 樂觀更新
        setCartState(prev => ({
          ...prev,
          items: prev.items.map(cartItem => 
            cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem
          )
        }));
        
        // 根據模式異步處理
        if (cartState.mode === CartMode.MEMBER) {
          try {
            const response = await cartApi.updateQuantity(item.id, newQuantity);
            if (!response.success) {
              throw new Error(response.error || '更新數量失敗');
            }
          } catch (apiError) {
            console.error('API 更新失敗:', apiError);
            // 轉入離線模式但不撤銷本地操作
            stateMachine.enterOfflineMode();
            setCartState(prev => ({ ...prev, mode: CartMode.OFFLINE }));
          }
        }
        
        operationLock.current = false;
        setCartState(prev => ({ ...prev, isLoading: false }));
        
        if (enhancedItem.isPreorder) {
          toast.success('已更新預購數量!');
        } else {
          toast.success('已更新數量!');
        }
        
        return { success: true, data: { ...existingItem, quantity: newQuantity } };
      }
      
      // 樂觀更新
      setCartState(prev => ({ ...prev, items: [...prev.items, enhancedItem] }));
      
      // 根據模式異步處理
      if (cartState.mode === CartMode.MEMBER) {
        try {
          // 使用正確的 productId 和 variantId
          const productId = item.productId || (item.id.includes('_') ? item.id.split('_')[0] : item.id);
          const variantId = item.variantId;
          
          const response = await cartApi.addToCart({
            productId,
            ...(variantId && { variantId }),
            quantity,
            specs: item.specs
          });
          
          if (!response.success) {
            throw new Error(response.error || '添加商品失敗');
          }
          
          // 根據商品類型顯示不同的成功消息
          if (enhancedItem.isPreorder) {
            toast.success('已成功加入預購清單!');
          } else {
            toast.success('已添加到購物車');
          }
          
        } catch (apiError) {
          console.error('API 添加失敗:', apiError);
          // 轉入離線模式
          stateMachine.enterOfflineMode();
          setCartState(prev => ({ ...prev, mode: CartMode.OFFLINE }));
          toast.error('同步失敗，已在本地保存');
        }
      } else {
        // GUEST 或 OFFLINE 模式，只在本地操作
        if (enhancedItem.isPreorder) {
          toast.success('已添加預購商品到本地購物車');
        } else {
          toast.success('已添加到本地購物車');
        }
      }
      
      return { success: true, data: enhancedItem };
      
    } catch (error) {
      console.error('添加商品失敗:', error);
      
      // 失敗時撤銷樂觀更新
      setCartState(prev => ({ 
        ...prev, 
        items: prev.items.filter(i => i.id !== item.id),
        error: error instanceof Error ? error.message : '添加商品失敗'
      }));
      
      return { success: false, error: error instanceof Error ? error.message : '添加商品失敗' };
      
    } finally {
      operationLock.current = false;
      setCartState(prev => ({ ...prev, isLoading: false }));
    }
  }, [cartState.items, cartState.mode, stateMachine]);

  // 移除商品
  const removeFromCart = useCallback(async (itemId: string): Promise<CartOperationResult> => {
    if (operationLock.current) {
      return { success: false, error: '操作進行中' };
    }
    
    operationLock.current = true;
    setCartState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const removedItem = cartState.items.find(item => item.id === itemId);
    if (!removedItem) {
      operationLock.current = false;
      setCartState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: '找不到指定商品' };
    }
    
    try {
      // 樂觀更新
      setCartState(prev => ({ 
        ...prev, 
        items: prev.items.filter(item => item.id !== itemId)
      }));
      
      // 根據模式異步處理
      if (cartState.mode === CartMode.MEMBER) {
        try {
          console.log(`[REMOVE] 準備刪除商品ID: ${itemId}`);
          console.log(`[REMOVE] 當前購物車商品:`, cartState.items.map(item => ({
            id: item.id,
            name: item.name
          })));
          
          const response = await cartApi.removeFromCart(itemId);
          console.log(`[REMOVE] 刪除API響應:`, response);
          
          if (!response.success) {
            // 如果是權限相關錯誤（如換帳號後商品ID不屬於當前用戶），
            // 不拋出錯誤，因為本地已經樂觀更新移除了
            console.warn(`[REMOVE] API移除失敗但本地已移除: ${response.error}`);
          }
          console.log(`成功從服務器移除商品: ${itemId}`);
          
          // 關鍵修復：釋放鎖後再同步狀態
          operationLock.current = false;  // 先釋放操作鎖
          setCartState(prev => ({ ...prev, isLoading: false }));
          
          try {
            console.log(`[REMOVE] 開始同步後端狀態...`);
            const syncResult = await refreshCart();
            console.log(`[REMOVE] 同步結果:`, syncResult);
            
            if (!syncResult.success) {
              console.warn('刪除後同步購物車失敗:', syncResult.error);
            } else {
              console.log(`[REMOVE] 同步後購物車商品:`, syncResult.data?.map(item => ({
                id: item.id,
                name: item.name
              })));
            }
          } catch (syncError) {
            console.warn('刪除後同步購物車異常:', syncError);
          }
          
          // 提前返回，避免重複釋放鎖
          toast.success('已從購物車移除');
          return { success: true };
        } catch (apiError) {
          console.error('API 移除失敗:', apiError);
          
          // 判斷錯誤類型決定是否回滾
          const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
          const isNetworkError = errorMessage.includes('網路') || errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED');
          
          if (isNetworkError) {
            // 網路問題：轉入離線模式但保持本地操作
            stateMachine.enterOfflineMode();
            setCartState(prev => ({ ...prev, mode: CartMode.OFFLINE }));
            toast.warning('網路異常，商品已在本地移除，稍後將同步到服務器');
          } else {
            // 其他錯誤（如授權問題、商品不存在等）：回滾本地操作
            setCartState(prev => ({ 
              ...prev, 
              items: [...prev.items, removedItem],
              error: '移除失敗，請稍後再試'
            }));
            toast.error('移除失敗，請稍後再試');
            
            operationLock.current = false;
            setCartState(prev => ({ ...prev, isLoading: false }));
            return { success: false, error: errorMessage };
          }
        }
      }
      
      // 如果是 GUEST 或 OFFLINE 模式，這裡處理
      toast.success('已從購物車移除');
      return { success: true };
      
    } catch (error) {
      console.error('移除商品失敗:', error);
      
      // 失敗時恢復樂觀更新
      setCartState(prev => ({ 
        ...prev, 
        items: [...prev.items, removedItem],
        error: error instanceof Error ? error.message : '移除失敗'
      }));
      
      return { success: false, error: error instanceof Error ? error.message : '移除失敗' };
      
    } finally {
      operationLock.current = false;
      setCartState(prev => ({ ...prev, isLoading: false }));
    }
  }, [cartState.items, cartState.mode, stateMachine]);

  // 更新數量
  const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<CartOperationResult> => {
    if (operationLock.current) {
      return { success: false, error: '操作進行中' };
    }
    
    if (quantity <= 0) {
      return await removeFromCart(itemId);
    }
    
    operationLock.current = true;
    setCartState(prev => ({ ...prev, isLoading: true, error: null }));
    
    let originalItem: CartItem | undefined;
    setCartState(prev => {
      originalItem = prev.items.find(item => item.id === itemId);
      return prev;
    });
    if (!originalItem) {
      operationLock.current = false;
      setCartState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: '找不到指定商品' };
    }
    
    const originalQuantity = originalItem.quantity;
    
    try {
      // 樂觀更新
      setCartState(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      }));
      
      // 根據模式異步處理
      let currentMode: CartMode;
      setCartState(prev => {
        currentMode = prev.mode;
        return prev;
      });
      
      if (currentMode === CartMode.MEMBER) {
        try {
          const response = await cartApi.updateQuantity(itemId, quantity);
          if (!response.success) {
            throw new Error(response.error || '更新數量失敗');
          }
          
          // 關鍵修復：釋放鎖後再同步狀態
          operationLock.current = false;
          setCartState(prev => ({ ...prev, isLoading: false }));
          
          try {
            const syncResult = await refreshCart();
            if (!syncResult.success) {
              console.warn('更新後同步購物車失敗:', syncResult.error);
            }
          } catch (syncError) {
            console.warn('更新後同步購物車異常:', syncError);
          }
          
          // 提前返回，避免重複釋放鎖
          return { success: true, data: { ...originalItem, quantity } };
        } catch (apiError) {
          console.error('API 更新失敗:', apiError);
          // 轉入離線模式但不撤銷本地操作
          stateMachine.enterOfflineMode();
          setCartState(prev => ({ ...prev, mode: CartMode.OFFLINE }));
          toast.error('同步失敗，但已在本地更新');
        }
      }
      
      toast.success('已更新購物車數量');
      return { success: true, data: { ...originalItem, quantity } };
      
    } catch (error) {
      console.error('更新數量失敗:', error);
      
      // 失敗時恢復樂觀更新
      setCartState(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === itemId ? { ...item, quantity: originalQuantity } : item
        ),
        error: error instanceof Error ? error.message : '更新數量失敗'
      }));
      
      return { success: false, error: error instanceof Error ? error.message : '更新數量失敗' };
      
    } finally {
      operationLock.current = false;
      setCartState(prev => ({ ...prev, isLoading: false }));
    }
  }, [stateMachine, removeFromCart, refreshCart]);

  // 清空購物車
  const clearCart = useCallback(async (): Promise<CartOperationResult> => {
    if (operationLock.current) {
      return { success: false, error: '操作進行中' };
    }
    
    operationLock.current = true;
    setCartState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const originalCart = [...cartState.items];
    
    try {
      // 樂觀更新
      setCartState(prev => ({ ...prev, items: [] }));
      
      // 根據模式異步處理
      if (cartState.mode === CartMode.MEMBER) {
        try {
          const response = await cartApi.clearCart();
          if (!response.success) {
            throw new Error(response.error || '清空失敗');
          }
        } catch (apiError) {
          console.error('API 清空失敗:', apiError);
          // 轉入離線模式但不撤銷本地操作
          stateMachine.enterOfflineMode();
          setCartState(prev => ({ ...prev, mode: CartMode.OFFLINE }));
          toast.error('同步失敗，但已在本地清空');
        }
      }
      
      toast.success('購物車已清空');
      return { success: true };
      
    } catch (error) {
      console.error('清空購物車失敗:', error);
      
      // 失敗時恢復樂觀更新
      setCartState(prev => ({ 
        ...prev, 
        items: originalCart,
        error: error instanceof Error ? error.message : '清空失敗'
      }));
      
      return { success: false, error: error instanceof Error ? error.message : '清空失敗' };
      
    } finally {
      operationLock.current = false;
      setCartState(prev => ({ ...prev, isLoading: false }));
    }
  }, [cartState.items, cartState.mode, stateMachine]);

  return (
    <CartContext.Provider
      value={{
        // 狀態
        cartItems: cartState.items,
        currentMode: cartState.mode,
        isLoading: cartState.isLoading,
        error: cartState.error,
        isAuthenticated,
        
        // 操作
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        
        // 狀態管理
        transitionTo,
        
        // 計算屬性
        totalAmount,
        cartClickCount,
        addCartClick,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}