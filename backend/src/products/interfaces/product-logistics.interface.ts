// 產品物流支援配置介面
export interface ProductLogisticsConfig {
  // 支援的配送方式
  supportedDeliveryMethods: DeliveryMethod[];
  
  // 物流限制原因
  deliveryRestrictions?: {
    [key in DeliveryMethod]?: {
      restricted: boolean;
      reason?: string;
    };
  };
  
  // 商品物理特性（影響物流選擇）
  physicalAttributes?: {
    weight?: number;           // 重量（公斤）
    dimensions?: {             // 尺寸（公分）
      length: number;
      width: number;
      height: number;
    };
    isFragile?: boolean;       // 是否易碎
    isOversized?: boolean;     // 是否大型商品
    requiresRefrigeration?: boolean; // 是否需要冷藏
    isDangerous?: boolean;     // 是否為危險品
    isHighValue?: boolean;     // 是否為高價值商品
  };
  
  // 特殊配送要求
  specialRequirements?: {
    signatureRequired?: boolean;      // 是否需要簽收
    insuranceRequired?: boolean;      // 是否需要保險
    appointmentDelivery?: boolean;    // 是否需要預約配送
    fragileHandling?: boolean;        // 是否需要特殊包裝
  };
}

// 配送方式枚舉（與前端保持一致）
export enum DeliveryMethod {
  HOME_DELIVERY = 'home_delivery',     // 宅配到府
  SEVEN_ELEVEN = 'seven_eleven',       // 7-11取貨
  FAMILY_MART = 'family_mart',         // 全家取貨
  HI_LIFE = 'hi_life',                 // 萊爾富取貨
  OK_MART = 'ok_mart'                  // OK便利商店取貨
}

// 配送限制類型
export enum DeliveryRestrictionType {
  SIZE_LIMIT = 'size_limit',           // 尺寸限制
  WEIGHT_LIMIT = 'weight_limit',       // 重量限制
  FRAGILE_ITEM = 'fragile_item',       // 易碎品限制
  HIGH_VALUE = 'high_value',           // 高價值商品限制
  REFRIGERATED = 'refrigerated',       // 冷藏商品限制
  DANGEROUS_GOODS = 'dangerous_goods', // 危險品限制
  STORE_CAPACITY = 'store_capacity',   // 門市容量限制
  CUSTOM = 'custom'                    // 自訂限制
}

// 購物車配送可用性檢查結果
export interface CartDeliveryAvailability {
  method: DeliveryMethod;
  available: boolean;
  restrictions: {
    productId: string;
    productName: string;
    restrictionType: DeliveryRestrictionType;
    reason: string;
  }[];
}

// 配送方式配置（系統層級設定）
export interface DeliveryMethodConfig {
  method: DeliveryMethod;
  name: string;
  description: string;
  baseFee: number;
  estimatedDays: number;
  
  // 系統層級限制
  globalLimits: {
    maxWeight?: number;        // 最大重量限制
    maxDimensions?: {          // 最大尺寸限制
      length: number;
      width: number;
      height: number;
    };
    allowFragile?: boolean;    // 是否允許易碎品
    allowHighValue?: boolean;  // 是否允許高價值商品
    allowRefrigerated?: boolean; // 是否允許冷藏品
  };
}