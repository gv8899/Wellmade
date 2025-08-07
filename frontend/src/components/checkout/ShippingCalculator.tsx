'use client';
import React, { useMemo } from 'react';
import { DeliveryMethod, DeliveryInfo } from '@/types/logistics';
import { Text } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';
import { formatTWD } from '@/utils/format';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight?: number; // 公斤
  isPreorder?: boolean;
}

interface ShippingCalculatorProps {
  cartItems: CartItem[];
  deliveryInfo: DeliveryInfo | null;
  colorMode?: ColorMode;
  showDetails?: boolean;
}

interface ShippingCalculation {
  subtotal: number;           // 商品小計
  shippingFee: number;        // 運費
  handlingFee: number;        // 手續費
  discount: number;           // 折扣
  freeShippingThreshold: number; // 免運門檻
  total: number;              // 總計
  estimatedDays: number;      // 預估配送天數
  needsMoreForFreeShipping: number; // 還需多少錢免運
}

const ShippingCalculator: React.FC<ShippingCalculatorProps> = ({
  cartItems,
  deliveryInfo,
  colorMode = 'light',
  showDetails = true
}) => {
  const calculation = useMemo((): ShippingCalculation => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalWeight = cartItems.reduce((sum, item) => sum + ((item.weight || 0.5) * item.quantity), 0);
    
    // 免運門檻設定
    const freeShippingThreshold = 1000; // NT$ 1000 免運
    
    let shippingFee = 0;
    let handlingFee = 0;
    let estimatedDays = 3;
    
    if (deliveryInfo) {
      // 基本運費
      shippingFee = deliveryInfo.fee;
      estimatedDays = deliveryInfo.estimatedDays;
      
      // 根據配送方式計算額外費用
      switch (deliveryInfo.method) {
        case DeliveryMethod.HOME_DELIVERY:
          // 宅配根據重量計算額外費用
          if (totalWeight > 5) {
            shippingFee += Math.ceil((totalWeight - 5) / 5) * 30; // 每超過5公斤加30元
          }
          break;
          
        case DeliveryMethod.SEVEN_ELEVEN:
        case DeliveryMethod.FAMILY_MART:
          // 7-11 和全家手續費較高
          handlingFee = Math.round(subtotal * 0.0075); // 0.75% 手續費
          break;
          
        case DeliveryMethod.HI_LIFE:
        case DeliveryMethod.OK_MART:
          // 萊爾富和OK手續費
          handlingFee = Math.round(subtotal * 0.0075); // 0.75% 手續費
          break;
      }
    }
    
    // 免運優惠
    let discount = 0;
    if (subtotal >= freeShippingThreshold) {
      discount = shippingFee;
      shippingFee = 0;
    }
    
    // 預購商品額外處理
    const hasPreorderItems = cartItems.some(item => item.isPreorder);
    if (hasPreorderItems) {
      estimatedDays = Math.max(estimatedDays, 7); // 預購商品至少7天
    }
    
    const total = subtotal + shippingFee + handlingFee - discount;
    const needsMoreForFreeShipping = subtotal < freeShippingThreshold 
      ? freeShippingThreshold - subtotal 
      : 0;
    
    return {
      subtotal,
      shippingFee,
      handlingFee,
      discount,
      freeShippingThreshold,
      total,
      estimatedDays,
      needsMoreForFreeShipping
    };
  }, [cartItems, deliveryInfo]);

  const getDeliveryMethodName = (method: DeliveryMethod): string => {
    switch (method) {
      case DeliveryMethod.HOME_DELIVERY:
        return '宅配到府';
      case DeliveryMethod.SEVEN_ELEVEN:
        return '7-ELEVEN 取貨';
      case DeliveryMethod.FAMILY_MART:
        return '全家便利商店';
      case DeliveryMethod.HI_LIFE:
        return '萊爾富';
      case DeliveryMethod.OK_MART:
        return 'OK便利商店';
      default:
        return '未選擇';
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
          購物車是空的
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 配送資訊摘要 */}
      {deliveryInfo && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                {getDeliveryMethodName(deliveryInfo.method)}
              </Text>
              <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
                預估 {calculation.estimatedDays} 個工作天送達
              </Text>
              {deliveryInfo.store && (
                <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ marginTop: '0.25rem' }}>
                  取貨門市: {deliveryInfo.store.name}
                </Text>
              )}
            </div>
            <div className="text-right">
              <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600' }}>
                {formatTWD(calculation.shippingFee)}
              </Text>
              {calculation.discount > 0 && (
                <Text variant="footnote" color={colors.success} colorMode={colorMode}>
                  已免運費 {formatTWD(calculation.discount)}
                </Text>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 免運提醒 */}
      {calculation.needsMoreForFreeShipping > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <Text variant="subhead" color={colors.warning} colorMode={colorMode} style={{ fontWeight: '500' }}>
            💡 再購買 {formatTWD(calculation.needsMoreForFreeShipping)} 即可免運費！
          </Text>
        </div>
      )}

      {/* 費用明細 */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">


        {/* 運費 */}
        {deliveryInfo && (
          <div className="flex justify-between items-center">
            <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              運費
            </Text>
            <Text variant="subhead" color={calculation.shippingFee === 0 ? colors.success : colors.neutral.label} colorMode={colorMode}>
              {calculation.shippingFee === 0 ? '免費' : formatTWD(calculation.shippingFee)}
            </Text>
          </div>
        )}

        {/* 手續費 */}
        {calculation.handlingFee > 0 && (
          <div className="flex justify-between items-center">
            <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              服務手續費
            </Text>
            <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode}>
              {formatTWD(calculation.handlingFee)}
            </Text>
          </div>
        )}

        {/* 折扣 */}
        {calculation.discount > 0 && (
          <div className="flex justify-between items-center">
            <Text variant="subhead" color={colors.success} colorMode={colorMode}>
              免運優惠
            </Text>
            <Text variant="subhead" color={colors.success} colorMode={colorMode}>
              -{formatTWD(calculation.discount)}
            </Text>
          </div>
        )}

        {/* 總計區塊 */}
        <div className="pt-2">
          <div className="flex justify-between items-center">
            <Text variant="title3" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600', fontSize: '20px' }}>
              總計
            </Text>
            <Text variant="title2" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '700', fontSize: '20px' }}>
              {formatTWD(calculation.total)}
            </Text>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ShippingCalculator;