'use client';

import React from 'react';
import { Text, Card, Button } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

import { useQuickDeliveryCheck } from '@/hooks/useCartLogistics';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
  price: number;
}

interface Props {
  cartItems: CartItem[];
  colorMode?: ColorMode;
  onViewDetails?: () => void;
}

/**
 * 購物車配送警告組件
 * 在購物車頁面顯示配送限制的簡要提醒
 */
const DeliveryWarning: React.FC<Props> = ({
  cartItems,
  colorMode = 'light',
  onViewDetails
}) => {
  const { hasRestrictions, isChecking } = useQuickDeliveryCheck(cartItems);

  // 如果沒有限制或正在檢查中，不顯示警告
  if (!hasRestrictions || isChecking) {
    return null;
  }

  return (
    <Card 
      variant="outlined" 
      padding="medium" 
      colorMode={colorMode}
      style={{ 
        borderColor: colors.warning,
        backgroundColor: `${colors.warning}08`
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <span className="text-xl">⚠️</span>
        </div>
        
        <div className="flex-1">
          <Text 
            variant="subhead" 
            color={colors.warning} 
            colorMode={colorMode} 
            style={{ fontWeight: '600', marginBottom: '0.25rem' }}
          >
            配送限制提醒
          </Text>
          
          <Text 
            variant="footnote" 
            color={colors.neutral.secondaryLabel} 
            colorMode={colorMode}
            style={{ marginBottom: '0.75rem' }}
          >
            您的購物車中有商品可能限制某些配送方式。建議在結帳時確認可用的配送選項。
          </Text>

          {onViewDetails && (
            <Button
              variant="secondary"
              size="small"
              colorMode={colorMode}
              onClick={onViewDetails}
              style={{ 
                fontSize: '0.75rem',
                padding: '0.25rem 0.75rem',
                borderColor: colors.warning,
                color: colors.warning
              }}
            >
              查看詳情
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DeliveryWarning;