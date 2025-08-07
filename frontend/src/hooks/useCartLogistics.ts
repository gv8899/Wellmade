'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CartDeliveryAvailability, 
  DeliveryMethodConfig,
  DeliveryMethod 
} from '@/types/logistics';
import { logisticsService } from '@/services/logistics';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
  price: number;
}

interface UseCartLogisticsResult {
  // 配送可用性資料
  deliveryAvailability: CartDeliveryAvailability[];
  deliveryMethods: DeliveryMethodConfig[];
  
  // 載入狀態
  isLoading: boolean;
  error: string | null;
  
  // 計算屬性
  availableMethodsCount: number;
  hasAnyAvailableMethod: boolean;
  recommendedMethod: DeliveryMethod | null;
  
  // 操作方法
  checkAvailability: (items: CartItem[]) => Promise<void>;
  refreshAvailability: () => Promise<void>;
  clearError: () => void;
}

/**
 * 購物車物流檢查 Hook
 * 提供購物車配送可用性檢查、配送方式管理等功能
 */
export function useCartLogistics(cartItems: CartItem[] = []): UseCartLogisticsResult {
  const [deliveryAvailability, setDeliveryAvailability] = useState<CartDeliveryAvailability[]>([]);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 檢查配送可用性
  const checkAvailability = useCallback(async (items: CartItem[]) => {
    if (!items || items.length === 0) {
      setDeliveryAvailability([]);
      setDeliveryMethods([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[LOGISTICS_HOOK] 檢查配送可用性:', {
        itemCount: items.length,
        items: items.map(item => ({ id: item.id, name: item.name }))
      });

      // 並行請求配送可用性和配送方式配置
      const [availability, methods] = await Promise.all([
        logisticsService.checkCartDeliveryAvailability(
          items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
          }))
        ),
        logisticsService.getAvailableDeliveryMethods()
      ]);

      console.log('[LOGISTICS_HOOK] 配送檢查完成:', {
        availabilityCount: availability.length,
        methodsCount: methods.length,
        availableMethods: availability.filter(a => a.available).map(a => a.method)
      });

      setDeliveryAvailability(availability);
      setDeliveryMethods(methods);

    } catch (err: any) {
      console.error('[LOGISTICS_HOOK] 配送檢查失敗:', err);
      
      const errorMessage = err.message || '檢查配送可用性失敗';
      setError(errorMessage);
      
      // 設定回退資料
      setFallbackData();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 重新檢查配送可用性
  const refreshAvailability = useCallback(async () => {
    await checkAvailability(cartItems);
  }, [cartItems, checkAvailability]);

  // 清除錯誤
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 設定回退資料
  const setFallbackData = useCallback(() => {
    const methods = [
      DeliveryMethod.HOME_DELIVERY,
      DeliveryMethod.SEVEN_ELEVEN,
      DeliveryMethod.FAMILY_MART
    ];

    const fallbackAvailability: CartDeliveryAvailability[] = methods.map(method => ({
      method,
      available: true,
      restrictions: []
    }));

    const fallbackMethods: DeliveryMethodConfig[] = [
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
          allowFragile: false,
          allowHighValue: false,
          allowRefrigerated: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    setDeliveryAvailability(fallbackAvailability);
    setDeliveryMethods(fallbackMethods);
  }, []);

  // 當購物車項目變更時自動檢查
  useEffect(() => {
    checkAvailability(cartItems);
  }, [cartItems, checkAvailability]);

  // 計算屬性
  const availableMethodsCount = deliveryAvailability.filter(a => a.available).length;
  const hasAnyAvailableMethod = availableMethodsCount > 0;
  
  const recommendedMethod = logisticsService.getRecommendedDeliveryMethod(
    deliveryAvailability,
    deliveryMethods
  );

  return {
    // 資料
    deliveryAvailability,
    deliveryMethods,
    
    // 狀態
    isLoading,
    error,
    
    // 計算屬性
    availableMethodsCount,
    hasAnyAvailableMethod,
    recommendedMethod,
    
    // 方法
    checkAvailability,
    refreshAvailability,
    clearError
  };
}

/**
 * 快速檢查購物車是否有配送限制
 */
export function useQuickDeliveryCheck(cartItems: CartItem[]) {
  const [hasRestrictions, setHasRestrictions] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const quickCheck = async () => {
      if (!cartItems || cartItems.length === 0) {
        setHasRestrictions(false);
        return;
      }

      setIsChecking(true);
      
      try {
        const availability = await logisticsService.checkCartDeliveryAvailability(
          cartItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
          }))
        );

        const hasAnyRestrictions = availability.some(a => 
          !a.available || a.restrictions.length > 0
        );
        
        setHasRestrictions(hasAnyRestrictions);
      } catch (error) {
        console.warn('[QUICK_CHECK] 快速檢查失敗，假設無限制:', error);
        setHasRestrictions(false);
      } finally {
        setIsChecking(false);
      }
    };

    quickCheck();
  }, [cartItems]);

  return { hasRestrictions, isChecking };
}