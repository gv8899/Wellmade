// 配送方式枚舉
export enum DeliveryMethod {
  HOME_DELIVERY = 'home_delivery',     // 宅配到府
  SEVEN_ELEVEN = 'seven_eleven',       // 7-11取貨
  FAMILY_MART = 'family_mart',         // 全家取貨
  HI_LIFE = 'hi_life',                 // 萊爾富取貨
  OK_MART = 'ok_mart'                  // OK便利商店取貨
}

// 門市資訊
export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  businessHours: string;
  storeType: DeliveryMethod;
  district: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // 距離（公里）
}

// 配送資訊
export interface DeliveryInfo {
  method: DeliveryMethod;
  fee: number;
  estimatedDays: number;
  description: string;
  store?: Store;
}

// 門市搜尋參數
export interface StoreSearchParams {
  keyword?: string;      // 關鍵字搜尋
  city?: string;         // 城市
  district?: string;     // 區域
  storeType: DeliveryMethod;
  latitude?: number;     // 使用者位置
  longitude?: number;
  limit?: number;        // 回傳筆數限制
}

// 運費計算參數
export interface ShippingFeeParams {
  deliveryMethod: DeliveryMethod;
  items: Array<{
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    quantity: number;
  }>;
  destination?: {
    city: string;
    district: string;
    postalCode: string;
  };
}

// 配送選項配置
export interface DeliveryOption {
  method: DeliveryMethod;
  name: string;
  description: string;
  icon: string;
  baseFee: number;
  estimatedDays: number;
  available: boolean;
  features: string[];
}

// === 新增：產品物流支援系統 ===

// 產品物流配置介面
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
  id: string;
  method: DeliveryMethod;
  name: string;
  description: string;
  baseFee: number;
  estimatedDays: number;
  isActive: boolean;
  
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
  
  createdAt: string;
  updatedAt: string;
}