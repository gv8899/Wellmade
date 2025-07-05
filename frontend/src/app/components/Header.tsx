"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
import { useCart } from "@/CartContext";
import { useUser } from "./UserContext";
import { AdminOnly } from "@/components/auth/ConditionalRender";
import HamburgerMenu from "./HamburgerMenu";

// 🎯 導入設計系統
import { Text } from "@/design-system";
import { colors } from "@/design-system";
import type { ColorMode } from "@/design-system";

export default function Header() {
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  
  return (
    <header className="fixed top-0 left-0 w-full z-30 bg-white border-b border-gray-100 shadow-sm h-16 flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between h-full">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'light', letterSpacing: '0.025em' }}>
              Wellmade
            </Text>
          </Link>
        </div>
        {/* Right side: Admin + Cart + Hamburger */}
        <div className="flex items-center gap-6">
          {/* 管理員後台入口 - 僅管理員可見 */}
          <AdminOnly>
            <Link href="/admin" className="relative group">
              <Image
                src="/icons/settings.png"
                alt="設定"
                width={24}
                height={24}
                className="w-6 h-6 transition"
                style={{ 
                  filter: `brightness(0) saturate(100%) invert(29%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(75%) contrast(90%)`,
                }}
              />
              <span 
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                style={{
                  backgroundColor: colors.neutral.label.light,
                  color: colors.background.systemBackground.light
                }}
              >
                管理後台
              </span>
            </Link>
          </AdminOnly>
          
          <Link href="/cart" className="relative group">
            <Image
              src="/icons/shopping-cart.png"
              alt="購物車"
              width={24}
              height={24}
              className="w-6 h-6 transition"
              style={{ 
                filter: `brightness(0) saturate(100%) invert(29%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(75%) contrast(90%)`,
              }}
            />
            {cartCount > 0 && (
              <span 
                className="absolute -top-2 -right-2 text-xs rounded-full px-1.5 py-0.5 min-w-[20px] h-[20px] flex items-center justify-center font-bold shadow"
                style={{
                  backgroundColor: colors.danger.light,
                  color: colors.background.systemBackground.light
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* 漢堡選單 */}
          <div className="relative">
            <HamburgerMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
