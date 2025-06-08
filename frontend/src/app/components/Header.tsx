"use client";
import React from "react";
import Link from "next/link";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { useCart } from "@/CartContext";

export default function Header() {
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <header className="fixed top-0 left-0 w-full z-30 bg-white border-b border-gray-100 shadow-sm h-16 flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between h-full">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <span className="font-bold text-xl text-gray-900 tracking-wide">Wellmade</span>
          </Link>
        </div>
        {/* Right side: Cart & User */}
        <div className="flex items-center gap-6">
          <Link href="/cart" className="relative group">
            <FaShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] h-[20px] flex items-center justify-center font-bold shadow">
                {cartCount}
              </span>
            )}
          </Link>
          <Link href="/login" className="flex items-center">
            <FaUserCircle className="w-7 h-7 text-gray-700 hover:text-gray-900 transition" />
          </Link>
        </div>
      </div>
    </header>
  );
}
