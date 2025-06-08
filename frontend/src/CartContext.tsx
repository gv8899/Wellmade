"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  cover: string;
  spec: { [key: string]: string }; // 新增：商品規格（如顏色、長度等）
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart 必須在 CartProvider 內使用");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartClickCount, setCartClickCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 初始化時讀取 localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        setCartItems([]);
      }
    }
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

  // cartItems 變動時同步到 localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

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

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.id === itemId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity };
        return updated;
      }
      return prev;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, cartClickCount, addCartClick }}
    >
      {children}
    </CartContext.Provider>
  );
}
