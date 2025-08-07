'use client';

import React from 'react';
import { Text, Card } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

import { 
  CartDeliveryAvailability, 
  DeliveryMethod,
  DeliveryRestrictionType 
} from '@/types/logistics';

interface Props {
  deliveryAvailability: CartDeliveryAvailability[];
  colorMode?: ColorMode;
}

const DeliveryRestrictionExplainer: React.FC<Props> = ({
  deliveryAvailability,
  colorMode = 'light'
}) => {
  // 獲取所有限制的商品
  const restrictedItems = deliveryAvailability
    .filter(availability => !availability.available && availability.restrictions.length > 0)
    .reduce((acc, availability) => {
      availability.restrictions.forEach(restriction => {
        const key = `${restriction.productId}-${restriction.restrictionType}`;
        if (!acc.some(item => `${item.productId}-${item.restrictionType}` === key)) {
          acc.push({
            ...restriction,
            affectedMethods: [availability.method]
          });
        } else {
          const existingItem = acc.find(item => 
            `${item.productId}-${item.restrictionType}` === key
          );
          if (existingItem && !existingItem.affectedMethods.includes(availability.method)) {
            existingItem.affectedMethods.push(availability.method);
          }
        }
      });
      return acc;
    }, [] as Array<{
      productId: string;
      productName: string;
      restrictionType: DeliveryRestrictionType;
      reason: string;
      affectedMethods: DeliveryMethod[];
    }>);

  // 如果沒有限制，不顯示組件
  if (restrictedItems.length === 0) {
    return null;
  }

  // 獲取配送方式的中文名稱
  const getDeliveryMethodName = (method: DeliveryMethod): string => {
    const nameMap = {
      [DeliveryMethod.HOME_DELIVERY]: '宅配到府',
      [DeliveryMethod.SEVEN_ELEVEN]: '7-ELEVEN',
      [DeliveryMethod.FAMILY_MART]: '全家',
      [DeliveryMethod.HI_LIFE]: '萊爾富',
      [DeliveryMethod.OK_MART]: 'OK超商',
    };
    return nameMap[method] || method;
  };

  // 獲取限制類型的圖標和顏色
  const getRestrictionIcon = (type: DeliveryRestrictionType): string => {
    const iconMap = {
      [DeliveryRestrictionType.SIZE_LIMIT]: '📏',
      [DeliveryRestrictionType.WEIGHT_LIMIT]: '⚖️',
      [DeliveryRestrictionType.FRAGILE_ITEM]: '⚠️',
      [DeliveryRestrictionType.HIGH_VALUE]: '💎',
      [DeliveryRestrictionType.REFRIGERATED]: '❄️',
      [DeliveryRestrictionType.DANGEROUS_GOODS]: '☢️',
      [DeliveryRestrictionType.STORE_CAPACITY]: '📦',
      [DeliveryRestrictionType.CUSTOM]: '⚠️',
    };
    return iconMap[type] || '⚠️';
  };

  // 獲取建議的替代方案
  const getAlternativeSuggestions = (restrictedMethods: DeliveryMethod[]): string[] => {
    const availableMethods = deliveryAvailability
      .filter(a => a.available)
      .map(a => getDeliveryMethodName(a.method));

    const suggestions: string[] = [];

    if (availableMethods.length > 0) {
      suggestions.push(`建議使用 ${availableMethods.join('、')} 進行配送`);
    }

    // 根據限制類型提供具體建議
    const hasFragileRestriction = restrictedItems.some(
      item => item.restrictionType === DeliveryRestrictionType.FRAGILE_ITEM
    );
    const hasSizeRestriction = restrictedItems.some(
      item => item.restrictionType === DeliveryRestrictionType.SIZE_LIMIT
    );

    if (hasFragileRestriction && availableMethods.includes('宅配到府')) {
      suggestions.push('易碎商品建議選擇宅配到府，享有更好的包裝保護');
    }

    if (hasSizeRestriction && availableMethods.includes('宅配到府')) {
      suggestions.push('大型商品請選擇宅配到府，確保順利配送');
    }

    return suggestions;
  };

  const suggestions = getAlternativeSuggestions(
    restrictedItems.flatMap(item => item.affectedMethods)
  );

  return (
    <Card variant="outlined" padding="large" colorMode={colorMode} 
          style={{ borderColor: colors.warning, backgroundColor: `${colors.warning}10` }}>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-xl">📋</span>
          <Text variant="headline" color={colors.warning} colorMode={colorMode} style={{ fontWeight: '600' }}>
            配送限制說明
          </Text>
        </div>

        <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
          您的購物車中有部分商品因特殊屬性而限制某些配送方式：
        </Text>

        {/* 限制商品列表 */}
        <div className="space-y-3">
          {restrictedItems.map((item, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-start space-x-3">
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {getRestrictionIcon(item.restrictionType)}
                </span>
                <div className="flex-1">
                  <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} 
                        style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {item.productName}
                  </Text>
                  <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode} 
                        style={{ marginBottom: '0.5rem' }}>
                    {item.reason}
                  </Text>
                  <div className="flex flex-wrap gap-1">
                    <Text variant="caption1" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
                      不可使用：
                    </Text>
                    {item.affectedMethods.map((method, methodIndex) => (
                      <span
                        key={methodIndex}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-700"
                      >
                        {getDeliveryMethodName(method)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 建議替代方案 */}
        {suggestions.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-start space-x-2">
              <span className="text-lg flex-shrink-0 mt-0.5">💡</span>
              <div className="flex-1">
                <Text variant="subhead" color={colors.primary} colorMode={colorMode} 
                      style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  建議方案
                </Text>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <Text key={index} variant="footnote" color={colors.primary} colorMode={colorMode}>
                      • {suggestion}
                    </Text>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 聯繫客服提示 */}
        <div className="border-t border-gray-200 pt-3">
          <Text variant="caption1" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
            💬 如有任何配送相關問題，請聯繫客服團隊，我們將為您提供最適合的配送建議。
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default DeliveryRestrictionExplainer;