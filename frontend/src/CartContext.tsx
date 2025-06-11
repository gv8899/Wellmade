"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "react-hot-toast";
import { cartApi, localCartStorage } from "@/services/cart";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  cover: string;
  specs: { [key: string]: string }; // 確保與後端命名一致：商品規格（如顏色、長度等）
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  cartClickCount: number;
  addCartClick: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart 必須在 CartProvider 內使用");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartClickCount, setCartClickCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // 初始化購物車 - 嘗試從 API 獲取，失敗則從本地存儲加載
  useEffect(() => {
    const initializeCart = async () => {
      try {
        // 嘗試從 API 獲取購物車
        const response = await cartApi.getCart();
        if (response.success && response.data) {
          setCartItems(response.data);
        } else {
          // API 失敗，嘗試從本地存儲加載
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            try {
              setCartItems(JSON.parse(savedCart));
            } catch {
              setCartItems([]);
            }
          }
        }
      } catch (error) {
        console.error('初始化購物車失敗:', error);
        // 加載本地存儲作為後備
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart));
          } catch {
            setCartItems([]);
          }
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeCart();
  }, []);

  // 監聽 localStorage 變動（跨分頁/視窗）
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "cart") {
        setCartItems(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // 監聽 cartItems 變化，更新 localStorage 與總金額
  useEffect(() => {
    if (isInitialized) {
      // 只在客戶端環境執行且購物車已初始化後
      localCartStorage.saveCart(cartItems);
    }
  }, [cartItems, isInitialized]);

  const addCartClick = () => {
    setCartClickCount(prev => {
      const next = prev + 1;
      localStorage.setItem("cartClickCount", String(next));
      return next;
    });
  };

  // 初始化 cartClickCount
  useEffect(() => {
    const savedCount = localStorage.getItem("cartClickCount");
    setCartClickCount(savedCount ? parseInt(savedCount, 10) : 0);
  }, []);

  const addToCart = async (item: Omit<CartItem, "quantity">) => {
    setIsLoading(true);

    try {
      // 檢查是否已存在相同商品 (id相同)
      const existingItem = cartItems.find(cartItem => cartItem.id === item.id);

      if (existingItem) {
        // 如果已存在相同id的商品，則增加數量
        await updateQuantity(item.id, existingItem.quantity + 1);
      } else {
        // 否則新增商品到購物車
        // 先進行樂觀更新
        const newItem = { ...item, quantity: 1 };
        setCartItems(prev => [...prev, newItem]);

        // 然後嘗試 API 調用
        // 假設 id 格式為 "productId_specValue" 或空格字符
        const productId = item.id.includes('_') 
          ? item.id.split('_')[0] 
          : item.id; // 暫時使用完整 ID 作為備用方案
        const variantId = item.id;

        const response = await cartApi.addToCart({
          productId,
          variantId,
          quantity: 1,
          specs: item.specs
        });

        if (!response.success) {
          throw new Error(response.message || '添加商品失敗');
        }

        // 如果 API 成功但返回的 ID 不同，則更新本地狀態
        if (response.data && response.data.id !== item.id) {
          setCartItems(prev => {
            const newItems = [...prev];
            const idx = newItems.findIndex(i => i.id === item.id);
            if (idx >= 0 && response.data) {
              // 確保 response.data 不為 undefined 且處理所有必要欄位
              newItems[idx] = { 
                id: response.data.id,
                name: response.data.name || item.name, // 使用回傳資料或原資料
                price: response.data.price || item.price,
                quantity: response.data.quantity || 1,
                cover: response.data.cover || item.cover,
                specs: response.data.specs || item.specs
              };
            }
            return newItems;
          });
        }
      }
    } catch (error) {
      console.error('添加商品到購物車失敗:', error);
      // 錯誤已經通過樂觀更新處理，這裡只需顯示提示
      toast.error('同步到服務器失敗，但已在本地添加');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setIsLoading(true);

    // 先進行樂觀更新
    const removedItem = cartItems.find(item => item.id === itemId);
    setCartItems(prev => prev.filter(item => item.id !== itemId));

    try {
      // 然後嘗試 API 調用
      const response = await cartApi.removeFromCart(itemId);

      if (response.success) {
        toast.success('已從購物車移除');
      } else {
        throw new Error(response.message || '移除商品失敗');
      }
    } catch (error) {
      console.error('從購物車移除商品失敗:', error);

      // 如果 API 調用失敗，恢復原始狀態
      if (removedItem) {
        setCartItems(prev => [...prev, removedItem]);
      }

      toast.error('同步到服務器失敗，但已在本地移除');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    setIsLoading(true);

    // 保存原始數量用於恢復
    const originalItem = cartItems.find(item => item.id === itemId);
    const originalQuantity = originalItem?.quantity || 1;

    // 先進行樂觀更新
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.id === itemId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity };
        return updated;
      }
      return prev;
    });

    try {
      // 然後嘗試 API 調用
      const response = await cartApi.updateQuantity(itemId, quantity);

      if (response.success) {
        toast.success('已更新購物車數量');
      } else {
        throw new Error(response.message || '更新數量失敗');
      }
    } catch (error) {
      console.error('更新購物車數量失敗:', error);

      // 如果 API 調用失敗，恢復原始狀態
      setCartItems(prev => {
        const idx = prev.findIndex(i => i.id === itemId);
        if (idx >= 0 && originalItem) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: originalQuantity };
          return updated;
        }
        return prev;
      });

      toast.error('同步到服務器失敗，但已在本地更新');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);

    // 保存原始購物車用於恢復
    const originalCart = [...cartItems];

    // 先進行樂觀更新
    setCartItems([]);

    try {
      // 然後嘗試 API 調用
      const response = await cartApi.clearCart();

      if (response.success) {
        toast.success('購物車已清空');
      } else {
        throw new Error(response.message || '清空購物車失敗');
      }
    } catch (error) {
      console.error('清空購物車失敗:', error);

      // 如果 API 調用失敗，恢復原始狀態
      setCartItems(originalCart);

      toast.error('同步到服務器失敗，但已在本地清空');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        cartClickCount,
        addCartClick,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
