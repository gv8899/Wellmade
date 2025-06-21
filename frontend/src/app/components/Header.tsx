"use client";
import React from "react";
import Link from "next/link";
import { FaShoppingCart, FaUserCircle, FaCog } from "react-icons/fa";
import { useCart } from "@/CartContext";
import { useUser } from "./UserContext";
import { AdminOnly } from "@/components/auth/ConditionalRender";
import HamburgerMenu from "./HamburgerMenu";

export default function Header() {
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <header className="fixed top-0 left-0 w-full z-30 bg-white border-b border-gray-100 shadow-sm h-16 flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between h-full">
        {/* Logo & 漢堡選單 */}
        <div className="flex items-center gap-4">
          {/* 漢堡選單 */}
          <div className="relative">
            {/* 點擊展開 dropdown 狀態管理 */}
            <HamburgerMenu />
          </div>
          <Link href="/">
            <span className="font-bold text-xl text-gray-900 tracking-wide">Wellmade</span>
          </Link>
        </div>
        {/* Right side: Admin + Cart */}
        <div className="flex items-center gap-6">
          {/* 管理員後台入口 - 僅管理員可見 */}
          <AdminOnly>
            <Link href="/admin" className="relative group">
              <FaCog className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                管理後台
              </span>
            </Link>
          </AdminOnly>
          
          <Link href="/cart" className="relative group">
            <FaShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] h-[20px] flex items-center justify-center font-bold shadow">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
