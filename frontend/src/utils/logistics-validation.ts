// 物流配置驗證工具
import { 
  ProductLogisticsConfig, 
  DeliveryMethodConfig, 
  DeliveryMethod 
} from '@/types/logistics';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * 驗證產品物流配置
 */
export function validateLogisticsConfig(
  config: ProductLogisticsConfig,
  availableDeliveryMethods: DeliveryMethodConfig[] = []
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // 檢查是否選擇了配送方式
  if (!config.supportedDeliveryMethods || config.supportedDeliveryMethods.length === 0) {
    warnings.push({
      field: 'supportedDeliveryMethods',
      message: '建議至少選擇一種配送方式，否則用戶無法購買此商品',
      severity: 'warning'
    });
  }

  // 檢查物理屬性
  if (config.physicalAttributes) {
    const attrs = config.physicalAttributes;

    // 重量驗證
    if (attrs.weight !== undefined) {
      if (attrs.weight < 0) {
        errors.push({
          field: 'physicalAttributes.weight',
          message: '重量不能為負數',
          severity: 'error'
        });
      } else if (attrs.weight > 50) {
        warnings.push({
          field: 'physicalAttributes.weight',
          message: '重量超過 50kg，可能限制某些配送方式',
          severity: 'warning'
        });
      }
    }

    // 尺寸驗證
    if (attrs.dimensions) {
      const { length, width, height } = attrs.dimensions;
      
      if (length < 0 || width < 0 || height < 0) {
        errors.push({
          field: 'physicalAttributes.dimensions',
          message: '尺寸不能為負數',
          severity: 'error'
        });
      }

      if (length > 200 || width > 200 || height > 200) {
        warnings.push({
          field: 'physicalAttributes.dimensions',
          message: '尺寸超過 200cm，可能限制超商取貨',
          severity: 'warning'
        });
      }

      // 檢查是否設定為大型商品但尺寸不大
      if (attrs.isOversized && length <= 45 && width <= 30 && height <= 30) {
        warnings.push({
          field: 'physicalAttributes.isOversized',
          message: '商品尺寸不大但標記為大型商品，可能不必要',
          severity: 'info'
        });
      }
    }

    // 特殊屬性邏輯檢查
    if (attrs.requiresRefrigeration && attrs.isFragile) {
      warnings.push({
        field: 'physicalAttributes',
        message: '冷藏商品通常不適合標記為易碎品',
        severity: 'info'
      });
    }
  }

  // 檢查配送方式與物理屬性的衝突
  if (availableDeliveryMethods.length > 0 && config.supportedDeliveryMethods.length > 0) {
    config.supportedDeliveryMethods.forEach(method => {
      const methodConfig = availableDeliveryMethods.find(m => m.method === method);
      if (!methodConfig) return;

      const conflicts = checkDeliveryMethodConflicts(config, methodConfig);
      conflicts.forEach(conflict => {
        errors.push({
          field: `supportedDeliveryMethods.${method}`,
          message: conflict,
          severity: 'error'
        });
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 檢查配送方式與商品屬性衝突
 */
function checkDeliveryMethodConflicts(
  config: ProductLogisticsConfig,
  methodConfig: DeliveryMethodConfig
): string[] {
  const conflicts: string[] = [];
  const attrs = config.physicalAttributes;
  const limits = methodConfig.globalLimits;

  if (!attrs || !limits) return conflicts;

  // 重量限制
  if (limits.maxWeight && attrs.weight && attrs.weight > limits.maxWeight) {
    conflicts.push(`${methodConfig.name}: 重量超限 (${attrs.weight}kg > ${limits.maxWeight}kg)`);
  }

  // 尺寸限制
  if (limits.maxDimensions && attrs.dimensions) {
    const { length, width, height } = attrs.dimensions;
    const maxDim = limits.maxDimensions;
    
    if (length > maxDim.length || width > maxDim.width || height > maxDim.height) {
      conflicts.push(`${methodConfig.name}: 尺寸超限 (${length}×${width}×${height}cm)`);
    }
  }

  // 特殊屬性限制
  if (attrs.isFragile && limits.allowFragile === false) {
    conflicts.push(`${methodConfig.name}: 不支援易碎品`);
  }

  if (attrs.isHighValue && limits.allowHighValue === false) {
    conflicts.push(`${methodConfig.name}: 不支援高價值商品`);
  }

  if (attrs.requiresRefrigeration && limits.allowRefrigerated === false) {
    conflicts.push(`${methodConfig.name}: 不支援冷藏商品`);
  }

  return conflicts;
}

/**
 * 獲取配送建議
 */
export function getDeliveryRecommendations(
  config: ProductLogisticsConfig,
  availableDeliveryMethods: DeliveryMethodConfig[]
): string[] {
  const recommendations: string[] = [];
  const attrs = config.physicalAttributes;

  if (!attrs) {
    recommendations.push('建議填寫商品物理屬性，以便系統自動檢查配送限制');
    return recommendations;
  }

  // 根據商品屬性推薦配送方式
  if (attrs.weight && attrs.weight <= 5 && attrs.dimensions) {
    const { length, width, height } = attrs.dimensions;
    if (length <= 45 && width <= 30 && height <= 30 && !attrs.isFragile && !attrs.isHighValue) {
      recommendations.push('此商品適合超商取貨，可考慮啟用超商配送方式');
    }
  }

  if (attrs.isFragile || attrs.isHighValue || attrs.requiresRefrigeration) {
    recommendations.push('建議啟用宅配到府，以確保商品安全配送');
  }

  if (attrs.weight && attrs.weight > 30) {
    recommendations.push('重量較重的商品建議僅使用宅配到府');
  }

  return recommendations;
}

/**
 * 簡化版驗證 - 用於即時檢查
 */
export function quickValidate(config: ProductLogisticsConfig): boolean {
  // 最基本的驗證
  return config.supportedDeliveryMethods.length > 0;
}

/**
 * 格式化驗證錯誤訊息
 */
export function formatValidationMessage(error: ValidationError): string {
  const prefix = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return `${prefix[error.severity]} ${error.message}`;
}