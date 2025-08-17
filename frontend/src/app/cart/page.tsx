'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/CartContext';
import { CartItem } from '@/types/cart';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { formatSimpleDollar } from '@/utils/format';

// 🎯 導入設計系統
import { Text, Button } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

export default function CartPage() {
  const router = useRouter();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    totalAmount, 
    selectedTotalAmount,
    selectedItems,
    selectedItemIds,
    toggleItemSelection,
    isLoading, 
    refreshCart, 
    isAuthenticated 
  } = useCart();
  const [isSyncing, setIsSyncing] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>('light');

  // 手動同步購物車資料
  const handleSyncCart = async () => {
    setIsSyncing(true);
    try {
      await refreshCart();
      toast.success('購物車資料已更新');
    } catch (error) {
      console.error('同步購物車失敗:', error);
      toast.error('同步購物車失敗，請稍後再試');
    } finally {
      setIsSyncing(false);
    }
  };

  // 處理登入
  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/cart' });
  };

  if (isLoading) {
    return <div className="text-center py-16">載入中...</div>;
  }

  // 商品總數量
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // 預購商品統計
  const preorderItems = cartItems.filter(item => item.isPreorder);
  const regularItems = cartItems.filter(item => !item.isPreorder);
  const hasPreorderItems = preorderItems.length > 0;
  // 當 cartItems 變動時自動同步勾選的邏輯已移至上方
  // 切換勾選
  // 使用 Context 中的選擇狀態
  const checkedItems = selectedItems;
  const subtotal = selectedTotalAmount;

  return (
    <div className="min-h-screen w-full bg-white font-sans flex items-start justify-center">
      <div className="max-w-lg w-full px-4 py-12">
      
        
      {/* 標題與右上角商品數量 */}
      <div className="flex justify-between items-center mb-8">
        <Text variant="title2" color={colors.neutral.label} colorMode={colorMode}>
          購物車明細
        </Text>
        <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode}>
          共 {totalItems} 件商品
        </Text>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <Text variant="callout" color={colors.neutral.tertiaryLabel} colorMode={colorMode} style={{ marginBottom: '2rem' }}>
            購物車目前是空的
          </Text>
          <Button
            variant="primary"
            size="large"
            colorMode={colorMode}
            style={{ width: '100%' }}
            onClick={() => window.location.href = '/'}
          >
            繼續購物
          </Button>
        </div>
      ) : (
        <>
          {/* 商品列表（可勾選） */}
          <div className="divide-y divide-gray-100 mb-8">
            {cartItems.map((item, index) => (
              <div key={`${item.id}_${index}`} className="flex items-center py-6">
                {/* checkbox */}
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-black mr-4"
                  checked={selectedItemIds.includes(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  aria-label="選擇本商品結帳"
                />
                {/* 商品圖片 */}
                <div className="w-20 h-20 relative flex-shrink-0 bg-gray-100">
                  {item.cover && item.cover.trim() !== '' ? (
                    <Image
                      src={item.cover}
                      alt={item.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // 圖片加載失敗時隱藏圖片元素
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-gray-400">無圖</div>
                  )}
                </div>
                {/* 商品資訊 */}
                <div className="flex-1 ml-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ marginBottom: '0.25rem' }}>
                        {item.name}
                      </Text>
                      
                      {/* 變體規格顯示 - 固定斷行，沒有變體時不顯示 */}
                      {item.specs && Object.keys(item.specs).length > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
                            {Object.values(item.specs).join('・')}
                          </Text>
                        </div>
                      )}
                      
                      {/* 預購狀態顯示 */}
                      {item.isPreorder && (
                        <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                          📅 預購商品
                        </div>
                      )}
                      
                      {/* 預購信息顯示 */}
                      {item.isPreorder && item.preorderInfo && (
                        <div style={{ marginTop: '0.25rem' }}>
                          {item.preorderInfo.expectedShipDate && (
                            <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
                              預計出貨: {new Date(item.preorderInfo.expectedShipDate).toLocaleDateString('zh-TW')}
                            </Text>
                          )}
                          {item.preorderInfo.preorderDescription && (
                            <Text variant="footnote" color={colors.info} colorMode={colorMode}>
                              {item.preorderInfo.preorderDescription}
                            </Text>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                  {/* 數量選單與單價 */}
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      className="w-8 h-8 flex items-center justify-center text-lg text-gray-700 disabled:text-gray-300"
                      onClick={async () => {
                        try {
                          await updateQuantity(item.id, Math.max(1, item.quantity - 1));
                        } catch (error) {
                          console.error('更新數量失敗:', error);
                          toast.error('更新數量失敗，請稍後再試');
                        }
                      }}
                      disabled={item.quantity <= 1}
                      aria-label="減少數量"
                    >
                      -
                    </button>
                    <Text variant="small" color={colors.neutral.label} colorMode={colorMode} style={{ width: '32px', textAlign: 'center', userSelect: 'none', margin: '0 0.5rem', lineHeight: '2rem' }}>
                      {item.quantity}
                    </Text>
                    <button
                      className="w-8 h-8 flex items-center justify-center text-lg text-gray-700"
                      onClick={async () => {
                        try {
                          await updateQuantity(item.id, item.quantity + 1);
                        } catch (error) {
                          console.error('更新數量失敗:', error);
                          toast.error('更新數量失敗，請稍後再試');
                        }
                      }}
                      aria-label="增加數量"
                    >
                      +
                    </button>
                    <Text variant="small" color={colors.neutral.label} colorMode={colorMode} style={{ marginLeft: '0.5rem' }}>
                      {formatSimpleDollar(item.price)}
                    </Text>
                  </div>
                </div>
                {/* 垃圾桶 icon（最右側，垂直置中） */}
                <button
                  onClick={async () => {
                    try {
                      await removeFromCart(item.id);
                    } catch (error) {
                      console.error('移除商品失敗:', error);
                      toast.error('移除商品失敗，請稍後再試');
                    }
                  }}
                  className="text-gray-400 hover:text-red-600 transition p-2 flex items-center justify-center self-center ml-4"
                  title="移除"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6h16zm-9 4v6m4-6v6" /></svg>
                </button>
              </div>
            ))}
          </div>



          {/* 勾選商品總計區塊 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            {/* 基本總計 */}
            <div className="flex justify-between items-center mb-2">
              <Text variant="title3" color={colors.neutral.label} colorMode={colorMode}>
                總計
              </Text>
              <Text variant="title3" color={colors.neutral.label} colorMode={colorMode}>
                {formatSimpleDollar(subtotal)}
              </Text>
            </div>
            
            {/* 預購商品提示 */}
            {hasPreorderItems && (
              <div className="border-t pt-2 mt-2">
                <div className="bg-blue-50 p-2 rounded">
                  <Text variant="subhead" color={colors.info} colorMode={colorMode}>
                    📅 您的購物車包含 {preorderItems.length} 件預購商品，將按預計時間分批出貨。
                  </Text>
                </div>
                {regularItems.length > 0 && (
                  <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ marginTop: '0.25rem' }}>
                    現貨商品 {regularItems.length} 件將優先出貨
                  </Text>
                )}
              </div>
            )}
          </div>

          {/* 結帳按鈕 */}
          <div className="mt-8">
            <Button
              variant="primary"
              size="large"
              colorMode={colorMode}
              disabled={checkedItems.length === 0 || (!isAuthenticated && hasPreorderItems)}
              style={{ width: '100%', marginTop: '1.5rem', marginBottom: '0.5rem' }}
              onClick={() => {
                // 檢查是否有選擇商品
                if (checkedItems.length === 0) {
                  toast.error('請選擇要結帳的商品');
                  return;
                }
                
                // 如果有預購商品但未登入，強制要求登入
                if (!isAuthenticated && hasPreorderItems) {
                  toast.error('預購商品需要會員身份，請先登入。');
                  handleSignIn();
                  return;
                }
                
                // 如果沒有登入，直接登入（移除確認彈窗）
                if (!isAuthenticated && checkedItems.length > 0) {
                  handleSignIn();
                  return;
                }
                
                // 導向結帳頁面
                router.push('/checkout');
              }}
            >
              {checkedItems.length === 0 
                ? '還沒選擇要結帳的產品' 
                : (!isAuthenticated && hasPreorderItems)
                  ? '預購商品需要會員身份'
                  : '前往結帳'
              }
            </Button>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
