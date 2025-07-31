import React, { useState, useEffect } from "react";
import { useCart } from "@/CartContext";
import RestockNotifyModal from "./RestockNotifyModal";
import { toast } from "react-hot-toast";
import { ProductStatus, InventoryType, ProductVariant as GlobalProductVariant, canPurchaseVariant, getCurrentPrice } from "@/types/product";
import ProductStatusBadge from "@/components/product/ProductStatusBadge";
import PreorderInfo from "@/components/product/PreorderInfo";

// 🎯 導入設計系統
import { Text, Button } from "@/design-system";
import { colors } from "@/design-system";
import type { ColorMode } from "@/design-system";

export type StockStatus = "in_stock" | "out_of_stock" | "preorder";

export interface ProductSpecOption {
  name: string;            // 規格名稱，例如「顏色」
  options: string[];       // 可選項目，例如["白","黑"]
}

// 購物頁面顯示用的變體介面，基於全域 ProductVariant 擴展顯示需求
export interface DisplayProductVariant extends Omit<GlobalProductVariant, 'imageUrl'> {
  image: string; // 顯示用的圖片 URL（對應全域介面的 imageUrl）
  stockStatus: StockStatus; // 衍生的庫存狀態，用於 UI 顯示
}

export interface ProductPurchaseOptionsProps {
  productId: string; // 產品ID
  title: string;
  variants: DisplayProductVariant[];
  specOptions: ProductSpecOption[];
  defaultQuantity?: number;
  isContainer?: boolean; // 是否為容器產品
}

const ProductPurchaseOptions: React.FC<ProductPurchaseOptionsProps> = ({
  productId,
  title,
  variants: initialVariants,
  specOptions: initialSpecOptions,
  defaultQuantity = 1,
  isContainer = false,
}) => {
  const { addToCart, addCartClick } = useCart();
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  
  // 狀態管理
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 產品變體和規格選項
  const [variants, setVariants] = useState(initialVariants);
  const [specOptions, setSpecOptions] = useState(initialSpecOptions);
  
  // 只使用第一個規格選項
  const primarySpecOption = specOptions.length > 0 ? specOptions[0] : null;
  const initialSpecs = primarySpecOption 
    ? { [primarySpecOption.name]: primarySpecOption.options[0] } 
    : {};

  const [selectedSpecs, setSelectedSpecs] = useState<{ [specName: string]: string }>(initialSpecs);
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [notifyOpen, setNotifyOpen] = useState(false);
  
  // 使用初始數據，不再嘗試加載 API 數據
  useEffect(() => {
    // 直接使用傳入的初始數據
    setIsLoading(false);
    setError(null);
    
    // 確保有選擇規格
    if (specOptions.length > 0) {
      setSelectedSpecs({ [specOptions[0].name]: specOptions[0].options[0] });
    }
  }, []);  // 只在組件渲染時執行一次

  // 根據選擇的規格找到對應 variant
  const currentVariant = React.useMemo(() => {
    if (!primarySpecOption) return variants[0];
    
    // 確保選擇的規格在變體中存在
    const selectedSpecValue = selectedSpecs[primarySpecOption.name];
    const variant = variants.find(v => v.specs[primarySpecOption.name] === selectedSpecValue);
    
    // 如果找不到對應的變體，返回第一個可用的變體
    return variant || variants[0];
  }, [variants, primarySpecOption, selectedSpecs]);

  // 增強的狀態判斷邏輯
  const canPurchase = currentVariant ? (() => {
    // 如果沒有新的狀態系統欄位，使用舊的 stockStatus 判斷
    if (!currentVariant.status && !currentVariant.inventoryType) {
      return currentVariant.stockStatus === "in_stock" || currentVariant.stockStatus === "preorder";
    }
    
    // 使用新的狀態系統
    return canPurchaseVariant({
      ...currentVariant,
      isActive: currentVariant.isActive !== false, // 預設為 true
      stock: currentVariant.stock || 1, // 預設庫存為 1
      preorderLimit: currentVariant.preorderLimit || 999, // 預設預購限量
      preorderSold: currentVariant.preorderSold || 0 // 預設已売為 0
    });
  })() : false;
  
  const currentPrice = currentVariant ? getCurrentPrice(currentVariant) : 0;
  
  // 變體選擇處理函數
  const handleVariantSelection = (variant: DisplayProductVariant) => {
    if (!primarySpecOption) return;
    
    // 更新選擇的規格以匹配所選變體
    const newSpecs = { [primarySpecOption.name]: variant.specs[primarySpecOption.name] };
    setSelectedSpecs(newSpecs);
  };
  
  // 調試信息
  console.log('ProductPurchaseOptions Debug:', {
    currentVariant,
    selectedSpecs,
    primarySpecOption,
    variants: variants.length,
    canPurchase,
    isAddingToCart
  });
  
  // 狀態與按鈕文案
  let statusLabel = "現貨";
  let actionButtons: React.ReactNode = null;
  
  if (!currentVariant) {
    statusLabel = "無此規格";
    actionButtons = (
      <Button
        variant="secondary"
        size="large"
        colorMode={colorMode}
        disabled
        style={{ width: '100%', marginTop: '1rem' }}
      >
        無法購買
      </Button>
    );
  } else {
    // 使用新的狀態系統
    const isInStock = currentVariant.stockStatus === "in_stock" || 
      (currentVariant.status === ProductStatus.IN_STOCK && canPurchase);
    const isPreorder = currentVariant.stockStatus === "preorder" || 
      (currentVariant.status === ProductStatus.PREORDER && canPurchase);
    const isOutOfStock = currentVariant.stockStatus === "out_of_stock" || 
      currentVariant.status === ProductStatus.OUT_OF_STOCK || 
      !canPurchase;
    
    if (isInStock) {
      statusLabel = "現貨";
      actionButtons = (
        <Button
          variant="primary"
          size="large"
          colorMode={colorMode}
          disabled={!canPurchase || isAddingToCart}
          style={{ width: '100%', height: '4rem', fontSize: '1.25rem' }}
          onClick={async () => {
            if (!currentVariant) return;
            
            setIsAddingToCart(true);
            
            try {
              // 使用正確的 AddToCartInput 結構
              await addToCart({
                productId: productId,
                variantId: isContainer ? currentVariant.id : undefined,  // 容器產品提供 variantId，簡單產品不提供
                quantity: quantity,
                specs: selectedSpecs
              });
              
              addCartClick();
              toast.success('已成功加入購物車');
            } catch (error) {
              console.error('加入購物車失敗:', error);
              toast.error('加入購物車失敗，請稍後再試');
            } finally {
              setIsAddingToCart(false);
            }
          }}
        >
          {isAddingToCart ? '處理中...' : '加入購物車'}
        </Button>
      );
    } else if (isPreorder) {
      statusLabel = "預購";
      actionButtons = (
        <Button
          variant="info"
          size="large"
          colorMode={colorMode}
          disabled={!canPurchase || isAddingToCart}
          style={{ width: '100%', height: '4rem', fontSize: '1.25rem' }}
          onClick={async () => {
            if (!currentVariant) return;
            
            setIsAddingToCart(true);
            
            try {
              // 使用正確的 AddToCartInput 結構
              await addToCart({
                productId: productId,
                variantId: isContainer ? currentVariant.id : undefined,  // 容器產品提供 variantId，簡單產品不提供
                quantity: quantity,
                specs: selectedSpecs
              });
              
              addCartClick();
              toast.success('已成功加入預購!');
            } catch (error) {
              console.error('預購失敗:', error);
              toast.error('預購失敗，請稍後再試');
            } finally {
              setIsAddingToCart(false);
            }
          }}
        >
          {isAddingToCart ? '處理中...' : '立即預購'}
        </Button>
      );
    } else {
      statusLabel = "缺貨";
      actionButtons = (
        <Button
          variant="warning"
          size="large"
          colorMode={colorMode}
          style={{ width: '100%', height: '4rem', fontSize: '1.25rem' }}
          onClick={() => setNotifyOpen(true)}
        >
          貨到通知
        </Button>
      );
    }
  }

  // 顯示加載狀態
  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto my-10">
        <div className="text-center mb-10">
          <Text variant="title1" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600', letterSpacing: '0.025em' }}>
            購買產品
          </Text>
        </div>
        <div className="flex justify-center items-center h-40">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
            style={{
              borderTopColor: colors.primary.light,
              borderBottomColor: colors.primary.light
            }}
          ></div>
        </div>
      </div>
    );
  }
  
  // 顯示錯誤狀態
  if (error) {
    return (
      <div className="w-full max-w-5xl mx-auto my-10">
        <div className="text-center mb-10">
          <Text variant="title1" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600', letterSpacing: '0.025em' }}>
            購買產品
          </Text>
        </div>
        <div className="flex justify-center items-center h-40 flex-col">
          <Text variant="headline" color={colors.danger} colorMode={colorMode} style={{ marginBottom: '1rem' }}>
            {error}
          </Text>
          <Button 
            variant="primary"
            size="medium"
            colorMode={colorMode}
            onClick={() => window.location.reload()}
          >
            重新整理
          </Button>
        </div>
      </div>
    );
  }

  // 容器產品檢查：必須選擇變體
  if (isContainer && (!currentVariant || variants.length === 0)) {
    return (
      <div className="w-full max-w-5xl mx-auto my-10">
        <div className="text-center mb-10">
          <Text variant="title1" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600', letterSpacing: '0.025em' }}>
            購買產品
          </Text>
        </div>
        <div className="flex justify-center items-center h-40 flex-col">
          <div className="text-center py-8">
            <Text variant="headline" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ marginBottom: '1rem' }}>
              請選擇規格：
            </Text>
            <Text variant="subhead" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
              此產品需要選擇具體規格才能購買
            </Text>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-5xl mx-auto my-10">
      {/* 標題 */}
      <div className="text-center">
        <Text variant="title1" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600', letterSpacing: '0.025em' }}>
          購買產品
        </Text>
      </div>
      
      <div className="flex flex-col items-center w-full mt-8">
        {/* 大圖片展示 */}
        <div className="w-full max-w-48 mx-auto mb-8">
          <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            <img 
              src={currentVariant?.image || variants[0]?.image} 
              alt={title}
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        {/* 數量選擇器 */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex flex-row gap-6 items-center">
            <button
              className="w-10 h-10 text-gray-600 flex items-center justify-center disabled:opacity-30 hover:text-gray-800 transition"
              disabled={quantity <= 1}
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
            >
              <Text variant="title2" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '400' }}>-</Text>
            </button>
            <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600', minWidth: '2rem', textAlign: 'center' }}>
              {quantity}
            </Text>
            <button
              className="w-10 h-10 text-gray-600 flex items-center justify-center hover:text-gray-800 transition"
              onClick={() => setQuantity(q => q + 1)}
            >
              <Text variant="title2" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '400' }}>+</Text>
            </button>
          </div>
        </div>

        {/* 變體選項卡片 */}
        <div className="w-full max-w-sm mx-auto px-4 space-y-4 mb-8">
          {variants.map((variant) => {
            const isSelected = currentVariant?.id === variant.id;
            const variantPrice = getCurrentPrice(variant);
            
            return (
              <div key={variant.id} className="relative">
                {/* 狀態標籤覆蓋在框線上 */}
                {variant.status && (
                  <div className="absolute -top-3 right-4 z-10">
                    <ProductStatusBadge status={variant.status} size="sm" showIcon={false} />
                  </div>
                )}
                
                <button
                  type="button"
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onClick={() => handleVariantSelection(variant)}
                >
                  <div className="flex flex-col">
                    <div className="text-left mb-1">
                      <Text variant="title3" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '700', fontSize: '17px', lineHeight: '1.3' }}>
                        {title}
                      </Text>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-left">
                        <Text variant="callout" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ lineHeight: '1.4', fontSize: '15px' }}>
                          {variant.variantTitle}
                        </Text>
                      </div>
                      <div className="text-right">
                        <Text variant="body" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', fontSize: '17px' }}>
                          ${variantPrice}
                        </Text>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
        {/* 預購信息顯示 */}
        {currentVariant && currentVariant.inventoryType && currentVariant.inventoryType !== InventoryType.PHYSICAL && (
          <div className="w-full max-w-md mx-auto mb-6">
            <PreorderInfo variant={currentVariant} />
          </div>
        )}
        
        {/* 行動按鈕（加入購物車/預購/貨到通知） */}
        <div className="w-full max-w-sm mx-auto px-4 min-h-[64px] flex items-center">
          <div className="w-full">
            {actionButtons}
            <RestockNotifyModal
              open={notifyOpen}
              onClose={() => setNotifyOpen(false)}
              onSubmit={() => {
                setNotifyOpen(false);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPurchaseOptions;
