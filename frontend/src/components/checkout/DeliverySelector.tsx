'use client';
import React from 'react';
import { DeliveryMethod, DeliveryOption } from '@/types/logistics';
import { Text } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

interface DeliverySelectorProps {
  selectedMethod: DeliveryMethod | null;
  onMethodChange: (method: DeliveryMethod) => void;
  deliveryOptions: DeliveryOption[];
  colorMode?: ColorMode;
  disabled?: boolean;
}

const DeliverySelector: React.FC<DeliverySelectorProps> = ({
  selectedMethod,
  onMethodChange,
  deliveryOptions,
  colorMode = 'light',
  disabled = false
}) => {
  const getMethodIcon = (method: DeliveryMethod): string => {
    switch (method) {
      case DeliveryMethod.HOME_DELIVERY:
        return '🚚';
      case DeliveryMethod.SEVEN_ELEVEN:
        return '🏪';
      case DeliveryMethod.FAMILY_MART:
        return '🏬';
      case DeliveryMethod.HI_LIFE:
        return '🏪';
      case DeliveryMethod.OK_MART:
        return '🏬';
      default:
        return '📦';
    }
  };

  const getMethodDisplayName = (method: DeliveryMethod): string => {
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
        return method;
    }
  };

  return (
    <div className="space-y-4">
      <Text variant="title3" color={colors.neutral.label} colorMode={colorMode}>
        選擇配送方式
      </Text>
      
      <div className="space-y-3">
        {deliveryOptions.map((option) => {
          const isSelected = selectedMethod === option.method;
          const isDisabled = disabled || !option.available;
          
          return (
            <div
              key={option.method}
              className={`
                relative border rounded-lg p-4 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-gray-800 bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
                ${isDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-25'
                }
              `}
              onClick={() => !isDisabled && onMethodChange(option.method)}
              data-testid={`delivery-option-${option.method}`}
            >
              {/* Hidden radio input for testing */}
              <input
                type="radio"
                name="deliveryMethod"
                value={option.method}
                checked={isSelected}
                onChange={() => !isDisabled && onMethodChange(option.method)}
                className="sr-only"
                data-testid={option.method.replace('_', '-')}
                disabled={isDisabled}
              />
              
              {/* Visual radio button */}
              <div className="flex items-start space-x-3">
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
                  ${isSelected 
                    ? 'border-gray-800 bg-gray-800' 
                    : 'border-gray-300'
                  }
                `}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  {/* 配送方式標題 */}
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getMethodIcon(option.method)}</span>
                    <Text 
                      variant="headline" 
                      color={colors.neutral.label} 
                      colorMode={colorMode}
                      style={{ fontWeight: '600' }}
                    >
                      <label 
                        htmlFor={`delivery-${option.method}`}
                        className="cursor-pointer"
                      >
                        {getMethodDisplayName(option.method)}
                      </label>
                    </Text>
                    {!option.available && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                        暫不提供
                      </span>
                    )}
                  </div>
                  
                  {/* 描述 */}
                  <Text 
                    variant="subhead" 
                    color={colors.neutral.secondaryLabel} 
                    colorMode={colorMode}
                    style={{ marginBottom: '0.5rem' }}
                  >
                    {option.description}
                  </Text>
                  
                  {/* 運費和預估時間 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Text 
                        variant="footnote" 
                        color={colors.neutral.tertiaryLabel} 
                        colorMode={colorMode}
                      >
                        運費: NT$ {option.baseFee}
                      </Text>
                      <Text 
                        variant="footnote" 
                        color={colors.neutral.tertiaryLabel} 
                        colorMode={colorMode}
                      >
                        {option.estimatedDays} 個工作天
                      </Text>
                    </div>
                  </div>
                  
                  {/* 特色功能 */}
                  {option.features && option.features.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {option.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliverySelector;