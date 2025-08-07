// 物流服務 - 處理配送可用性檢查和相關業務邏輯

import { 
  DeliveryMethod, 
  CartDeliveryAvailability, 
  DeliveryMethodConfig,
  ProductLogisticsConfig 
} from '@/types/logistics';

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  name?: string;
}

class LogisticsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
  }

  /**
   * 檢查購物車商品的配送可用性
   */
  async checkCartDeliveryAvailability(cartItems: CartItem[]): Promise<CartDeliveryAvailability[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cart/logistics/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ cartItems })
      });

      if (!response.ok) {
        throw new Error(`檢查配送可用性失敗: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('檢查配送可用性錯誤:', error);
      
      // 回退機制：返回所有配送方式為可用
      return this.getFallbackDeliveryAvailability();
    }
  }

  /**
   * 獲取所有可用的配送方式配置
   */
  async getAvailableDeliveryMethods(): Promise<DeliveryMethodConfig[]> {
    try {
      const response = await fetch('/api/products/system/delivery-methods', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`獲取配送方式失敗: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('獲取配送方式錯誤:', error);
      
      // 回退機制：返回預設配送方式
      return this.getFallbackDeliveryMethods();
    }
  }

  /**
   * 獲取產品的物流配置
   */
  async getProductLogistics(productId: string): Promise<ProductLogisticsConfig | null> {
    try {
      const response = await fetch(`/api/products/${productId}/logistics`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`獲取產品物流配置失敗: ${response.status}`);
      }

      const result = await response.json();
      return result.logisticsConfig;
    } catch (error) {
      console.error('獲取產品物流配置錯誤:', error);
      return null;
    }
  }

  /**
   * 更新產品的物流配置（管理員功能）
   */
  async updateProductLogistics(
    productId: string, 
    config: ProductLogisticsConfig,
    authToken?: string
  ): Promise<boolean> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`/api/products/${productId}/logistics`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify(config)
      });

      return response.ok;
    } catch (error) {
      console.error('更新產品物流配置錯誤:', error);
      return false;
    }
  }

  /**
   * 過濾可用的配送方式
   */
  filterAvailableDeliveryMethods(
    availability: CartDeliveryAvailability[]
  ): DeliveryMethod[] {
    return availability
      .filter(item => item.available)
      .map(item => item.method);
  }

  /**
   * 獲取配送限制的摘要資訊
   */
  getDeliveryRestrictionsSummary(
    availability: CartDeliveryAvailability[]
  ): {
    totalMethods: number;
    availableMethods: number;
    restrictedMethods: { method: DeliveryMethod; reasonCount: number }[];
  } {
    const restrictedMethods = availability
      .filter(item => !item.available)
      .map(item => ({
        method: item.method,
        reasonCount: item.restrictions.length
      }));

    return {
      totalMethods: availability.length,
      availableMethods: availability.filter(item => item.available).length,
      restrictedMethods
    };
  }

  /**
   * 檢查是否有任何配送方式可用
   */
  hasAnyAvailableDeliveryMethod(availability: CartDeliveryAvailability[]): boolean {
    return availability.some(item => item.available);
  }

  /**
   * 獲取最推薦的配送方式（基於費用和限制）
   */
  getRecommendedDeliveryMethod(
    availability: CartDeliveryAvailability[],
    deliveryConfigs: DeliveryMethodConfig[]
  ): DeliveryMethod | null {
    const availableMethods = availability.filter(item => item.available);
    
    if (availableMethods.length === 0) return null;

    // 優先選擇費用最低的方式
    const methodsWithConfig = availableMethods
      .map(item => {
        const config = deliveryConfigs.find(config => config.method === item.method);
        return { method: item.method, config };
      })
      .filter(item => item.config)
      .sort((a, b) => (a.config!.baseFee - b.config!.baseFee));

    return methodsWithConfig.length > 0 ? methodsWithConfig[0].method : availableMethods[0].method;
  }

  /**
   * 回退機制：當 API 不可用時返回預設的配送可用性
   */
  private getFallbackDeliveryAvailability(): CartDeliveryAvailability[] {
    const methods = [
      DeliveryMethod.HOME_DELIVERY,
      DeliveryMethod.SEVEN_ELEVEN,
      DeliveryMethod.FAMILY_MART,
      DeliveryMethod.HI_LIFE,
      DeliveryMethod.OK_MART
    ];

    return methods.map(method => ({
      method,
      available: true,
      restrictions: []
    }));
  }

  /**
   * 回退機制：當 API 不可用時返回預設的配送方式配置
   */
  private getFallbackDeliveryMethods(): DeliveryMethodConfig[] {
    return [
      {
        id: 'fallback-home',
        method: DeliveryMethod.HOME_DELIVERY,
        name: '宅配到府',
        description: '專人配送到指定地址，安全便利',
        baseFee: 100,
        estimatedDays: 3,
        isActive: true,
        globalLimits: {
          maxWeight: 30,
          maxDimensions: { length: 100, width: 100, height: 100 },
          allowFragile: true,
          allowHighValue: true,
          allowRefrigerated: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'fallback-711',
        method: DeliveryMethod.SEVEN_ELEVEN,
        name: '7-ELEVEN 取貨',
        description: '全台門市24小時取貨，超商代收',
        baseFee: 65,
        estimatedDays: 2,
        isActive: true,
        globalLimits: {
          maxWeight: 5,
          maxDimensions: { length: 45, width: 30, height: 30 },
          allowFragile: false,
          allowHighValue: false,
          allowRefrigerated: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'fallback-family',
        method: DeliveryMethod.FAMILY_MART,
        name: '全家便利商店',
        description: '便利取貨，全台門市服務',
        baseFee: 65,
        estimatedDays: 2,
        isActive: true,
        globalLimits: {
          maxWeight: 5,
          maxDimensions: { length: 45, width: 30, height: 30 },
          allowFragile: false,
          allowHighValue: false,
          allowRefrigerated: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

// 導出單例實例
export const logisticsService = new LogisticsService();

// 導出類別供測試使用
export { LogisticsService };