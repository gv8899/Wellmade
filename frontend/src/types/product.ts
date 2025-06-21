// 產品狀態枚舉（與後端一致）
export enum ProductStatus {
  IN_STOCK = 'IN_STOCK',
  PREORDER = 'PREORDER', 
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED'
}

// 庫存類型枚舉（與後端一致）
export enum InventoryType {
  PHYSICAL = 'PHYSICAL',
  PREORDER_LIMITED = 'PREORDER_LIMITED',
  PREORDER_UNLIMITED = 'PREORDER_UNLIMITED'
}

// 產品變體介面
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  variantTitle?: string;
  specs: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  stock: number;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  weight?: number;
  barcode?: string;
  
  // 狀態相關
  status: ProductStatus;
  inventoryType: InventoryType;
  
  // 預購相關
  preorderLimit?: number;
  preorderSold: number;
  preorderStartTime?: string;
  preorderEndTime?: string;
  expectedShipDate?: string;
  preorderPrice?: number;
  preorderDescription?: string;
  
  createdAt: string;
  updatedAt: string;
}

// 價格範圍類型
export type PriceRange = 
  | { price: number }
  | { minPrice: number; maxPrice: number };

// 增強的產品介面（從 API 返回的）
export interface EnhancedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  images: string[];
  isActive: boolean;
  status: ProductStatus;
  brandId?: string;
  brand?: {
    id: string;
    name: string;
    logoUrl: string;
    description: string;
    isActive: boolean;
  };
  categoryRelation?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  variants?: ProductVariant[];
  keyFeatures?: Array<{
    image: string;
    title: string;
    subtitle?: string;
    description: string;
  }>;
  featureDetails?: Array<{
    type: 'image' | 'video';
    src: string;
    title: string;
    description: string;
    direction?: 'left' | 'right';
  }>;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  
  // 計算屬性
  overallStatus: ProductStatus;
  priceRange: PriceRange;
  availableVariantsCount: number;
  
  createdAt?: string;
  updatedAt?: string;
}

// 產品狀態顯示配置
export interface ProductStatusConfig {
  status: ProductStatus;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  description: string;
  canAddToCart: boolean;
}

// 產品狀態顯示映射
export const PRODUCT_STATUS_CONFIG: Record<ProductStatus, ProductStatusConfig> = {
  [ProductStatus.IN_STOCK]: {
    status: ProductStatus.IN_STOCK,
    label: '現貨',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: '✓',
    description: '有庫存，可立即出貨',
    canAddToCart: true,
  },
  [ProductStatus.PREORDER]: {
    status: ProductStatus.PREORDER,
    label: '預購',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: '📅',
    description: '接受預訂，未來出貨',
    canAddToCart: true,
  },
  [ProductStatus.OUT_OF_STOCK]: {
    status: ProductStatus.OUT_OF_STOCK,
    label: '缺貨',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: '⚠️',
    description: '暫時缺貨',
    canAddToCart: false,
  },
  [ProductStatus.DISCONTINUED]: {
    status: ProductStatus.DISCONTINUED,
    label: '停產',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: '✕',
    description: '已停產',
    canAddToCart: false,
  },
};

// 輔助函數：格式化價格範圍
export function formatPriceRange(priceRange: PriceRange): string {
  if ('price' in priceRange) {
    return `$${priceRange.price.toLocaleString()}`;
  } else {
    return `$${priceRange.minPrice.toLocaleString()} - $${priceRange.maxPrice.toLocaleString()}`;
  }
}

// 輔助函數：檢查變體是否可購買
export function canPurchaseVariant(variant: ProductVariant): boolean {
  if (!variant.isActive || variant.status === ProductStatus.DISCONTINUED) {
    return false;
  }

  if (variant.status === ProductStatus.PREORDER) {
    const now = new Date();
    if (variant.preorderStartTime && now < new Date(variant.preorderStartTime)) {
      return false;
    }
    if (variant.preorderEndTime && now > new Date(variant.preorderEndTime)) {
      return false;
    }
  }

  return getAvailableStock(variant) > 0;
}

// 輔助函數：獲取可用庫存
export function getAvailableStock(variant: ProductVariant): number {
  switch (variant.inventoryType) {
    case InventoryType.PHYSICAL:
      return variant.stock;
    case InventoryType.PREORDER_LIMITED:
      return variant.preorderLimit ? variant.preorderLimit - variant.preorderSold : 0;
    case InventoryType.PREORDER_UNLIMITED:
      return Number.MAX_SAFE_INTEGER;
    default:
      return 0;
  }
}

// 輔助函數：獲取當前有效價格
export function getCurrentPrice(variant: ProductVariant): number {
  if (variant.status === ProductStatus.PREORDER && variant.preorderPrice) {
    return variant.preorderPrice;
  }
  return variant.price;
}