'use client';

import React, { useState, useEffect } from 'react';
import { Text, Button, Card } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

// 導入物流相關類型
import { 
  DeliveryMethod, 
  ProductLogisticsConfig,
  DeliveryMethodConfig 
} from '@/types/logistics';
import { 
  validateLogisticsConfig, 
  getDeliveryRecommendations,
  formatValidationMessage,
  ValidationResult 
} from '@/utils/logistics-validation';

interface Props {
  productId: string;
  currentConfig?: ProductLogisticsConfig;
  onConfigChange: (config: ProductLogisticsConfig) => void;
  colorMode?: ColorMode;
}

interface DeliveryOption {
  method: DeliveryMethod;
  name: string;
  description: string;
  icon: string;
  baseFee: number;
  estimatedDays: number;
  globalLimits: {
    maxWeight?: number;
    maxDimensions?: {
      length: number;
      width: number;
      height: number;
    };
    allowFragile?: boolean;
    allowHighValue?: boolean;
    allowRefrigerated?: boolean;
  };
}

const ProductLogisticsConfig: React.FC<Props> = ({
  productId,
  currentConfig,
  onConfigChange,
  colorMode = 'light'
}) => {
  // 狀態管理
  const [config, setConfig] = useState<ProductLogisticsConfig>(
    currentConfig || {
      supportedDeliveryMethods: [],
      physicalAttributes: {},
      deliveryRestrictions: {}
    }
  );
  
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // 載入系統配送方式
  useEffect(() => {
    const loadDeliveryMethods = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products/system/delivery-methods');
        if (response.ok) {
          const methods: DeliveryMethodConfig[] = await response.json();
          const options: DeliveryOption[] = methods.map(method => ({
            method: method.method,
            name: method.name,
            description: method.description || '',
            icon: getDeliveryIcon(method.method),
            baseFee: method.baseFee,
            estimatedDays: method.estimatedDays,
            globalLimits: method.globalLimits || {}
          }));
          setDeliveryOptions(options);
        }
      } catch (error) {
        console.error('載入配送方式失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeliveryMethods();
  }, []);

  // 獲取配送方式圖標
  const getDeliveryIcon = (method: DeliveryMethod): string => {
    const iconMap = {
      [DeliveryMethod.HOME_DELIVERY]: '🚚',
      [DeliveryMethod.SEVEN_ELEVEN]: '🏪',
      [DeliveryMethod.FAMILY_MART]: '🏬',
      [DeliveryMethod.HI_LIFE]: '🏪',
      [DeliveryMethod.OK_MART]: '🏬',
    };
    return iconMap[method] || '📦';
  };

  // 處理配送方式選擇
  const handleDeliveryMethodToggle = (method: DeliveryMethod) => {
    const isCurrentlySupported = config.supportedDeliveryMethods.includes(method);
    
    let newSupportedMethods: DeliveryMethod[];
    if (isCurrentlySupported) {
      // 移除支援
      newSupportedMethods = config.supportedDeliveryMethods.filter(m => m !== method);
    } else {
      // 添加支援
      newSupportedMethods = [...config.supportedDeliveryMethods, method];
    }

    const newConfig = {
      ...config,
      supportedDeliveryMethods: newSupportedMethods
    };

    setConfig(newConfig);
    onConfigChange(newConfig);
    
    // 即時驗證
    if (deliveryOptions.length > 0) {
      const validationResult = validateLogisticsConfig(newConfig, deliveryOptions as any);
      setValidation(validationResult);
    }
  };

  // 處理物理屬性變更
  const handlePhysicalAttributeChange = (attribute: string, value: any) => {
    const newConfig = {
      ...config,
      physicalAttributes: {
        ...config.physicalAttributes,
        [attribute]: value
      }
    };

    setConfig(newConfig);
    onConfigChange(newConfig);
    
    // 即時驗證
    if (deliveryOptions.length > 0) {
      const validationResult = validateLogisticsConfig(newConfig, deliveryOptions as any);
      setValidation(validationResult);
    }
  };

  // 處理尺寸變更
  const handleDimensionChange = (dimension: 'length' | 'width' | 'height', value: number) => {
    const newConfig = {
      ...config,
      physicalAttributes: {
        ...config.physicalAttributes,
        dimensions: {
          ...(config.physicalAttributes?.dimensions || { length: 0, width: 0, height: 0 }),
          [dimension]: value
        }
      }
    };

    setConfig(newConfig);
    onConfigChange(newConfig);
    
    // 即時驗證
    if (deliveryOptions.length > 0) {
      const validationResult = validateLogisticsConfig(newConfig, deliveryOptions as any);
      setValidation(validationResult);
    }
  };

  // 檢查配送方式是否與商品屬性衝突
  const checkDeliveryConflicts = (method: DeliveryMethod): string[] => {
    const option = deliveryOptions.find(opt => opt.method === method);
    if (!option || !config.physicalAttributes) return [];

    const conflicts: string[] = [];
    const attrs = config.physicalAttributes;
    const limits = option.globalLimits;

    // 檢查重量限制
    if (limits.maxWeight && attrs.weight && attrs.weight > limits.maxWeight) {
      conflicts.push(`重量超限 (${attrs.weight}kg > ${limits.maxWeight}kg)`);
    }

    // 檢查尺寸限制
    if (limits.maxDimensions && attrs.dimensions) {
      const { length, width, height } = attrs.dimensions;
      const maxDim = limits.maxDimensions;
      
      if (length > maxDim.length || width > maxDim.width || height > maxDim.height) {
        conflicts.push(`尺寸超限 (${length}x${width}x${height}cm)`);
      }
    }

    // 檢查特殊屬性
    if (attrs.isFragile && limits.allowFragile === false) {
      conflicts.push('不支援易碎品');
    }

    if (attrs.isHighValue && limits.allowHighValue === false) {
      conflicts.push('不支援高價值商品');
    }

    if (attrs.requiresRefrigeration && limits.allowRefrigerated === false) {
      conflicts.push('不支援冷藏商品');
    }

    return conflicts;
  };

  if (isLoading) {
    return (
      <Card variant="elevated" padding="large" colorMode={colorMode}>
        <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
          載入配送設定中...
        </Text>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 配送方式選擇 */}
      <Card variant="elevated" padding="large" colorMode={colorMode}>
        <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ marginBottom: '1rem', fontWeight: '600' }}>
          支援的配送方式
        </Text>
        
        <div className="space-y-3">
          {deliveryOptions.map((option) => {
            const isSupported = config.supportedDeliveryMethods.includes(option.method);
            const conflicts = checkDeliveryConflicts(option.method);
            const hasConflicts = conflicts.length > 0;

            return (
              <div 
                key={option.method} 
                className={`p-4 border rounded-lg transition-all duration-200 ${
                  isSupported ? 'border-green-300 bg-green-50 shadow-sm' : 
                  hasConflicts ? 'border-red-300 bg-red-50' : 
                  'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{option.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600' }}>
                          {option.name}
                        </Text>
                        <Text variant="footnote" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
                          NT$ {option.baseFee} • {option.estimatedDays} 天
                        </Text>
                      </div>
                      
                      <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ marginTop: '0.25rem' }}>
                        {option.description}
                      </Text>

                      {/* 顯示系統限制 */}
                      {option.globalLimits && (
                        <div className="mt-2 text-xs text-gray-500">
                          限制: 
                          {option.globalLimits.maxWeight && ` 重量≤${option.globalLimits.maxWeight}kg`}
                          {option.globalLimits.maxDimensions && ` 尺寸≤${option.globalLimits.maxDimensions.length}x${option.globalLimits.maxDimensions.width}x${option.globalLimits.maxDimensions.height}cm`}
                          {option.globalLimits.allowFragile === false && ` 不支援易碎品`}
                          {option.globalLimits.allowHighValue === false && ` 不支援高價值商品`}
                        </div>
                      )}

                      {/* 顯示衝突警告 */}
                      {hasConflicts && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700">
                          ⚠️ 商品屬性與此配送方式衝突: {conflicts.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeliveryMethodToggle(option.method)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isSupported 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : hasConflicts
                        ? 'bg-red-100 text-red-600 cursor-not-allowed opacity-60'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-sm'
                    }`}
                    disabled={hasConflicts}
                    title={hasConflicts ? `不可用: ${conflicts.join(', ')}` : isSupported ? '點擊取消支援' : '點擊啟用支援'}
                  >
                    {isSupported ? '✓ 已支援' : hasConflicts ? '⚠ 衝突' : '+ 啟用'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 商品物理屬性 */}
      <Card variant="elevated" padding="large" colorMode={colorMode}>
        <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ marginBottom: '1rem', fontWeight: '600' }}>
          商品物理屬性
        </Text>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 重量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              重量 (公斤)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={config.physicalAttributes?.weight || ''}
              onChange={(e) => handlePhysicalAttributeChange('weight', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.0"
            />
          </div>

          {/* 尺寸 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              尺寸 (長x寬x高 公分)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                min="0"
                value={config.physicalAttributes?.dimensions?.length || ''}
                onChange={(e) => handleDimensionChange('length', parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="長"
              />
              <input
                type="number"
                min="0"
                value={config.physicalAttributes?.dimensions?.width || ''}
                onChange={(e) => handleDimensionChange('width', parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="寬"
              />
              <input
                type="number"
                min="0"
                value={config.physicalAttributes?.dimensions?.height || ''}
                onChange={(e) => handleDimensionChange('height', parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="高"
              />
            </div>
          </div>
        </div>

        {/* 特殊屬性 */}
        <div className="mt-4 space-y-3">
          <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600' }}>
            特殊屬性
          </Text>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'isFragile', label: '易碎品' },
              { key: 'isOversized', label: '大型商品' },
              { key: 'isHighValue', label: '高價值商品' },
              { key: 'requiresRefrigeration', label: '需要冷藏' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.physicalAttributes?.[key as keyof typeof config.physicalAttributes] || false}
                  onChange={(e) => handlePhysicalAttributeChange(key, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Text variant="footnote" color={colors.neutral.label} colorMode={colorMode}>
                  {label}
                </Text>
              </label>
            ))}
          </div>
        </div>
      </Card>

      {/* 配置摘要和預覽 */}
      <Card variant="default" padding="medium" colorMode={colorMode}>
        <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
          配置摘要
        </Text>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium text-gray-700">支援配送方式: </span>
              <span className={`${config.supportedDeliveryMethods.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {config.supportedDeliveryMethods.length} 種
              </span>
            </div>
            
            {config.physicalAttributes?.weight && (
              <div className="text-sm">
                <span className="font-medium text-gray-700">重量: </span>
                <span className="text-gray-600">{config.physicalAttributes.weight} kg</span>
              </div>
            )}
            
            {config.physicalAttributes?.dimensions && (
              <div className="text-sm">
                <span className="font-medium text-gray-700">尺寸: </span>
                <span className="text-gray-600">
                  {config.physicalAttributes.dimensions.length} × {' '}
                  {config.physicalAttributes.dimensions.width} × {' '}
                  {config.physicalAttributes.dimensions.height} cm
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {/* 特殊屬性摘要 */}
            <div className="text-sm">
              <span className="font-medium text-gray-700">特殊屬性: </span>
              {(() => {
                const attrs = [];
                if (config.physicalAttributes?.isFragile) attrs.push('易碎');
                if (config.physicalAttributes?.isOversized) attrs.push('大型');
                if (config.physicalAttributes?.isHighValue) attrs.push('高價值');
                if (config.physicalAttributes?.requiresRefrigeration) attrs.push('冷藏');
                
                return attrs.length > 0 ? (
                  <span className="text-orange-600">{attrs.join(', ')}</span>
                ) : (
                  <span className="text-gray-500">無</span>
                );
              })()}
            </div>
            
            {/* 配送建議 */}
            {config.supportedDeliveryMethods.length === 0 && (
              <div className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
                ⚠️ 建議至少選擇一種配送方式
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 驗證結果和建議 */}
      {validation && (
        <Card variant="default" padding="medium" colorMode={colorMode}>
          {validation.errors.length > 0 && (
            <div className="mb-4">
              <Text variant="subhead" color={colors.red.primary} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                配置錯誤
              </Text>
              <div className="space-y-1">
                {validation.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                    {formatValidationMessage(error)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="mb-4">
              <Text variant="subhead" color={colors.orange.primary} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                配置警告
              </Text>
              <div className="space-y-1">
                {validation.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
                    {formatValidationMessage(warning)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 智能建議 */}
          {deliveryOptions.length > 0 && (() => {
            const recommendations = getDeliveryRecommendations(config, deliveryOptions as any);
            return recommendations.length > 0 && (
              <div>
                <Text variant="subhead" color={colors.blue.primary} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  配送建議
                </Text>
                <div className="space-y-1">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
                      💡 {rec}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
};

export default ProductLogisticsConfig;