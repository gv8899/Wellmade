'use client';

import React, { useState, useEffect } from 'react';
import { Text } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

import { 
  DeliveryMethod, 
  DeliveryOption, 
  CartDeliveryAvailability,
  DeliveryRestrictionType 
} from '@/types/logistics';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
  price: number;
}

interface Props {
  selectedMethod: DeliveryMethod | null;
  onMethodChange: (method: DeliveryMethod) => void;
  cartItems: CartItem[];
  colorMode?: ColorMode;
}

const EnhancedDeliverySelector: React.FC<Props> = ({
  selectedMethod,
  onMethodChange,
  cartItems,
  colorMode = 'light'
}) => {
  const [deliveryAvailability, setDeliveryAvailability] = useState<CartDeliveryAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 載入配送可用性
  useEffect(() => {
    const checkDeliveryAvailability = async () => {
      if (!cartItems || cartItems.length === 0) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/cart/logistics/check-availability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cartItems: cartItems.map(item => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity
            }))
          })
        });

        if (!response.ok) {
          throw new Error('檢查配送可用性失敗');
        }

        const availability: CartDeliveryAvailability[] = await response.json();
        setDeliveryAvailability(availability);

        // 如果當前選中的配送方式不可用，自動選擇第一個可用的方式
        if (selectedMethod) {
          const currentMethodAvailability = availability.find(a => a.method === selectedMethod);
          if (currentMethodAvailability && !currentMethodAvailability.available) {
            const firstAvailable = availability.find(a => a.available);
            if (firstAvailable) {
              onMethodChange(firstAvailable.method);
            }
          }
        }

      } catch (err: any) {
        console.error('檢查配送可用性錯誤:', err);
        setError(err.message || '檢查配送可用性失敗');
      } finally {
        setIsLoading(false);
      }
    };

    checkDeliveryAvailability();
  }, [cartItems, selectedMethod, onMethodChange]);

  // 獲取配送方式名稱 (只保留需要的選項)
  const getDeliveryName = (method: DeliveryMethod): string => {
    const nameMap = {
      [DeliveryMethod.HOME_DELIVERY]: '宅配到府',
      [DeliveryMethod.SEVEN_ELEVEN]: '7-ELEVEN 取貨',
      [DeliveryMethod.FAMILY_MART]: '全家便利商店',
    };
    return nameMap[method] || method;
  };

  // 獲取限制類型的中文說明
  const getRestrictionTypeText = (type: DeliveryRestrictionType): string => {
    const typeMap = {
      [DeliveryRestrictionType.SIZE_LIMIT]: '尺寸限制',
      [DeliveryRestrictionType.WEIGHT_LIMIT]: '重量限制',
      [DeliveryRestrictionType.FRAGILE_ITEM]: '易碎品限制',
      [DeliveryRestrictionType.HIGH_VALUE]: '高價值商品限制',
      [DeliveryRestrictionType.REFRIGERATED]: '冷藏商品限制',
      [DeliveryRestrictionType.DANGEROUS_GOODS]: '危險品限制',
      [DeliveryRestrictionType.STORE_CAPACITY]: '門市容量限制',
      [DeliveryRestrictionType.CUSTOM]: '其他限制',
    };
    return typeMap[type] || '未知限制';
  };

  // 處理配送方式選擇
  const handleMethodSelect = (method: DeliveryMethod, available: boolean) => {
    if (!available) return;
    onMethodChange(method);
  };

  if (isLoading) {
    return (
      <div>
        <Text variant="title2" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600', fontSize: '22px', marginBottom: '2.5rem' }}>
          配送方式
        </Text>
        <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
          檢查配送方式可用性中...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Text variant="title2" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600', fontSize: '22px', marginBottom: '2.5rem' }}>
          配送方式
        </Text>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <Text variant="subhead" color={colors.danger} colorMode={colorMode} style={{ fontWeight: '600' }}>
            載入配送選項時發生錯誤
          </Text>
          <Text variant="footnote" color={colors.danger} colorMode={colorMode} style={{ marginTop: '0.25rem' }}>
            {error}
          </Text>
        </div>
      </div>
    );
  }

  // 過濾掉不需要的配送方式
  const filteredAvailability = deliveryAvailability.filter(
    availability => 
      availability.method !== DeliveryMethod.HI_LIFE && 
      availability.method !== DeliveryMethod.OK_MART
  );
  
  const availableCount = filteredAvailability.filter(a => a.available).length;

  return (
    <div>
      <Text variant="title2" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600', fontSize: '22px', marginBottom: '2.5rem' }}>
        配送方式
      </Text>

      <div className="space-y-3" style={{ marginTop: '1rem' }}>
        {filteredAvailability.map((availability) => {
          const isSelected = selectedMethod === availability.method;
          const isAvailable = availability.available;
          const hasRestrictions = availability.restrictions.length > 0;

          return (
            <div
              key={availability.method}
              className={`p-4 border rounded-lg transition-all cursor-pointer ${
                isSelected && isAvailable 
                  ? 'border-blue-500 bg-blue-50' 
                  : isAvailable
                  ? 'border-gray-300 bg-white hover:border-gray-400'
                  : 'border-red-300 bg-red-50 cursor-not-allowed opacity-75'
              }`}
              onClick={() => handleMethodSelect(availability.method, isAvailable)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Text 
                        variant="subhead" 
                        color={isAvailable ? colors.neutral.label : colors.neutral.tertiaryLabel} 
                        colorMode={colorMode} 
                        style={{ fontWeight: '600' }}
                      >
                        {getDeliveryName(availability.method)}
                      </Text>
                      
                      {isSelected && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          已選擇
                        </span>
                      )}
                    </div>

                    {/* 顯示限制資訊 */}
                    {hasRestrictions && (
                      <div className="mt-2 space-y-1">
                        <Text variant="footnote" color={colors.danger} colorMode={colorMode} style={{ fontWeight: '600' }}>
                          ⚠️ 此配送方式有以下限制:
                        </Text>
                        {availability.restrictions.map((restriction, index) => (
                          <div key={index} className="text-xs text-red-600 ml-4">
                            • <strong>{restriction.productName}</strong>: {restriction.reason}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 顯示可用狀態 */}
                    {!isAvailable && !hasRestrictions && (
                      <Text variant="footnote" color={colors.neutral.tertiaryLabel} colorMode={colorMode} style={{ marginTop: '0.25rem' }}>
                        此配送方式暫時不可用
                      </Text>
                    )}
                  </div>
                </div>

                {/* 選擇指示器 */}
                <div className="ml-4">
                  {isAvailable ? (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-red-300 bg-red-100 flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 沒有可用配送方式的提示 */}
      {availableCount === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Text variant="subhead" color={colors.warning} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            目前沒有可用的配送方式
          </Text>
          <Text variant="footnote" color={colors.warning} colorMode={colorMode}>
            購物車中的商品可能有特殊限制，建議聯繫客服了解詳情。
          </Text>
        </div>
      )}
    </div>
  );
};

export default EnhancedDeliverySelector;