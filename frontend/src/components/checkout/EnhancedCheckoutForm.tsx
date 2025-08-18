'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/CartContext';
import { useOrder } from '@/contexts/OrderContext';
import { PaymentMethod, DeliveryMethod } from '@/types/order';
import { DeliveryOption, Store, CartDeliveryAvailability } from '@/types/logistics';
import Image from 'next/image';
import { formatTWD } from '@/utils/format';

// 導入新組件
import EnhancedDeliverySelector from './EnhancedDeliverySelector';
import StoreSelector from './StoreSelector';
import NewebpayStoreSelector from './NewebpayStoreSelector';
import ShippingCalculator from './ShippingCalculator';

// 導入物流服務
import { logisticsService } from '@/services/logistics';

// 導入設計系統
import { Text, Button, FormField } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod | null;
  selectedStore: Store | null;
  notes: string;
}

const EnhancedCheckoutForm: React.FC = () => {
  const router = useRouter();
  const { cartItems, selectedItems, selectedTotalAmount, totalAmount, clearCart, isLoading: cartLoading, error: cartError, refreshCart } = useCart();
  const { createOrder, isLoading: orderLoading, error: orderError } = useOrder();
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  
  // 調試信息：監控購物車狀態
  useEffect(() => {
    console.log('[CHECKOUT] 🔄 購物車狀態更新:', {
      cartItemsCount: cartItems?.length || 0,
      selectedItemsCount: selectedItems?.length || 0,
      totalAmount,
      selectedTotalAmount,
      cartLoading,
      cartError,
      hasSelectedItems: selectedItems && selectedItems.length > 0,
      selectedItems: selectedItems?.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price }))
    });
  }, [cartItems, selectedItems, totalAmount, selectedTotalAmount, cartLoading, cartError]);
  
  // 表單資料
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: PaymentMethod.CREDIT_CARD,
    deliveryMethod: null,
    selectedStore: null,
    notes: ''
  });

  // UI 狀態
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  
  // 物流檢查狀態
  const [deliveryAvailability, setDeliveryAvailability] = useState<CartDeliveryAvailability[]>([]);
  const [logisticsLoading, setLogisticsLoading] = useState(false);
  const [logisticsError, setLogisticsError] = useState<string | null>(null);

  // 檢查購物車配送可用性
  useEffect(() => {
    const checkLogistics = async () => {
      if (!selectedItems || selectedItems.length === 0) {
        setDeliveryAvailability([]);
        return;
      }

      setLogisticsLoading(true);
      setLogisticsError(null);

      try {
        console.log('[LOGISTICS] 開始檢查選中商品配送可用性:', {
          itemCount: selectedItems.length,
          items: selectedItems.map(item => ({ id: item.id, name: item.name }))
        });

        // 轉換選中項目格式
        const selectedItemsForCheck = selectedItems.map(item => ({
          productId: item.productId || item.id,
          variantId: item.variantId,
          quantity: item.quantity
        }));

        const availability = await logisticsService.checkCartDeliveryAvailability(selectedItemsForCheck);
        
        console.log('[LOGISTICS] 配送可用性檢查結果:', availability);
        setDeliveryAvailability(availability);

        // 如果當前選中的配送方式不可用，自動選擇第一個可用的方式
        if (formData.deliveryMethod) {
          const currentMethodAvailability = availability.find(a => a.method === formData.deliveryMethod);
          if (currentMethodAvailability && !currentMethodAvailability.available) {
            const firstAvailable = availability.find(a => a.available);
            if (firstAvailable) {
              console.log('[LOGISTICS] 當前配送方式不可用，自動切換至:', firstAvailable.method);
              setFormData(prev => ({
                ...prev,
                deliveryMethod: firstAvailable.method,
                selectedStore: null
              }));
            } else {
              console.warn('[LOGISTICS] 沒有可用的配送方式');
              setFormData(prev => ({
                ...prev,
                deliveryMethod: null,
                selectedStore: null
              }));
            }
          }
        }

        // 同時載入配送方式配置
        const deliveryMethods = await logisticsService.getAvailableDeliveryMethods();
        
        // 將配送方式配置轉換為 DeliveryOption 格式
        const options: DeliveryOption[] = deliveryMethods.map(method => ({
          method: method.method,
          name: method.name,
          description: method.description,
          icon: getDeliveryIcon(method.method),
          baseFee: method.baseFee,
          estimatedDays: method.estimatedDays,
          available: method.isActive && availability.some(a => a.method === method.method && a.available),
          features: getDeliveryFeatures(method.method)
        }));
        
        setDeliveryOptions(options);

      } catch (error: any) {
        console.error('[LOGISTICS] 檢查配送可用性失敗:', error);
        setLogisticsError(error.message || '檢查配送可用性失敗');
        
        // 回退機制：設定預設配送選項
        setFallbackDeliveryOptions();
      } finally {
        setLogisticsLoading(false);
      }
    };

    checkLogistics();
  }, [selectedItems, formData.deliveryMethod]);

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

  // 獲取配送方式特色
  const getDeliveryFeatures = (method: DeliveryMethod): string[] => {
    const featuresMap = {
      [DeliveryMethod.HOME_DELIVERY]: ['貨到付款', '指定時段', '追蹤包裹'],
      [DeliveryMethod.SEVEN_ELEVEN]: ['24小時營業', '超商代收', '簡訊通知'],
      [DeliveryMethod.FAMILY_MART]: ['門市眾多', '超商代收', '便利取貨'],
      [DeliveryMethod.HI_LIFE]: ['24小時服務', '超商代收'],
      [DeliveryMethod.OK_MART]: ['快速取貨', '超商代收']
    };
    return featuresMap[method] || [];
  };

  // 設定回退配送選項
  const setFallbackDeliveryOptions = () => {
    const fallbackOptions: DeliveryOption[] = [
      {
        method: DeliveryMethod.HOME_DELIVERY,
        name: '宅配到府',
        description: '專人配送到指定地址，安全便利',
        icon: '🚚',
        baseFee: 100,
        estimatedDays: 3,
        available: true,
        features: ['貨到付款', '指定時段', '追蹤包裹']
      },
      {
        method: DeliveryMethod.SEVEN_ELEVEN,
        name: '7-ELEVEN 取貨',
        description: '全台門市24小時取貨，超商代收',
        icon: '🏪',
        baseFee: 65,
        estimatedDays: 2,
        available: true,
        features: ['24小時營業', '超商代收', '簡訊通知']
      }
    ];
    setDeliveryOptions(fallbackOptions);
    setDeliveryAvailability(fallbackOptions.map(option => ({
      method: option.method,
      available: true,
      restrictions: []
    })));
  };

  // 計算配送資訊
  const deliveryInfo = React.useMemo(() => {
    if (!formData.deliveryMethod) return null;
    
    const option = deliveryOptions.find(opt => opt.method === formData.deliveryMethod);
    if (!option) return null;

    return {
      method: formData.deliveryMethod,
      fee: option.baseFee,
      estimatedDays: option.estimatedDays,
      description: option.description,
      store: formData.selectedStore
    };
  }, [formData.deliveryMethod, formData.selectedStore, deliveryOptions]);

  // 表單輸入處理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // 清除錯誤訊息（當用戶開始輸入時）
    if (error) {
      setError(null);
    }
  };

  // 即時驗證函式
  const getFieldError = (fieldName: string, value: string): string | null => {
    switch (fieldName) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return '請輸入有效的電子郵件格式';
        }
        break;
      case 'phone':
        if (value && !/^09\d{8}$/.test(value)) {
          return '請輸入有效的手機號碼格式（如：0912345678）';
        }
        break;
    }
    return null;
  };

  // 配送方式變更
  const handleDeliveryMethodChange = (method: DeliveryMethod) => {
    setFormData(prev => ({
      ...prev,
      deliveryMethod: method,
      selectedStore: null // 重置門市選擇
    }));
    setShowStoreSelector(false);
  };

  // 門市選擇
  const handleStoreSelect = (store: Store) => {
    setFormData(prev => ({
      ...prev,
      selectedStore: store
    }));
  };

  // 檢查是否為超商取貨
  const isStorePickup = formData.deliveryMethod && [
    DeliveryMethod.SEVEN_ELEVEN,
    DeliveryMethod.FAMILY_MART,
    DeliveryMethod.HI_LIFE,
    DeliveryMethod.OK_MART
  ].includes(formData.deliveryMethod);

  // 表單驗證
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('請輸入收件人姓名');
      return false;
    }
    if (!formData.email.trim()) {
      setError('請輸入電子郵件');
      return false;
    }
    // 電子郵件格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('請輸入有效的電子郵件格式');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('請輸入手機號碼');
      return false;
    }
    // 台灣手機號碼格式驗證（09開頭，共10位數字）
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('請輸入有效的手機號碼格式（如：0912345678）');
      return false;
    }
    if (!formData.deliveryMethod) {
      setError('請選擇配送方式');
      return false;
    }
    if (isStorePickup && !formData.selectedStore) {
      setError('請選擇取貨門市');
      return false;
    }
    if (formData.deliveryMethod === DeliveryMethod.HOME_DELIVERY && !formData.address.trim()) {
      setError('請輸入完整送貨地址');
      return false;
    }
    return true;
  };

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('[CHECKOUT] 🚀 開始訂單提交流程:', {
        selectedItemsCount: selectedItems?.length || 0,
        selectedTotalAmount,
        deliveryMethod: formData.deliveryMethod
      });
      
      // 驗證選中的商品
      if (!selectedItems || selectedItems.length === 0) {
        console.error('[CHECKOUT] ⚠️  沒有選中的商品，無法提交訂單');
        setError('請先選擇要結帳的商品');
        return;
      }

      if (!deliveryInfo) {
        setError('配送資訊不完整');
        return;
      }

      console.log('[CHECKOUT] 📝 構建訂單資料:', {
        customerName: formData.name,
        itemCount: selectedItems.length,
        selectedTotalAmount,
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod
      });
      
      // 構建訂單資料
      const orderData = {
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: isStorePickup ? formData.selectedStore!.address : formData.address,
        },
        paymentMethod: formData.paymentMethod,
        deliveryInfo: {
          method: formData.deliveryMethod!,
          fee: deliveryInfo.fee,
          estimatedDays: deliveryInfo.estimatedDays,
          storeId: formData.selectedStore?.id,
          storeName: formData.selectedStore?.name,
          storeAddress: formData.selectedStore?.address,
          storePhone: formData.selectedStore?.phone,
        },
        items: selectedItems.map(item => ({
          productId: item.productId || item.id,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        notes: formData.notes,
        sessionId: !localStorage.getItem('auth-token') ? 'guest-session' : undefined,
      };

      // 創建訂單
      console.log('[CHECKOUT] 💰 呼叫訂單創建 API');
      const order = await createOrder(orderData);
      
      if (order) {
        console.log('[CHECKOUT] ✅ 訂單創建成功:', {
          orderId: order.id,
          orderNumber: order.orderNumber
        });
        
        // 清空購物車
        console.log('[CHECKOUT] 🖾 清空購物車');
        await clearCart();
        
        // 根據付款方式決定下一步
        if (formData.paymentMethod === PaymentMethod.CREDIT_CARD || formData.paymentMethod === PaymentMethod.LINE_PAY) {
          console.log('[CHECKOUT] 💳 轉向付款頁面');
          router.push(`/checkout/payment?orderId=${order.id}&method=${formData.paymentMethod}`);
        } else {
          console.log('[CHECKOUT] ✅ 轉向成功頁面');
          router.push(`/checkout/success?orderNumber=${order.orderNumber}`);
        }
      } else {
        console.error('[CHECKOUT] ⚠️  訂單創建失敗：沒有返回訂單資料');
        setError('訂單創建失敗，請稍後再試。');
      }
    } catch (err: any) {
      console.error('[CHECKOUT] ❌ 訂單創建失敗:', {
        error: err,
        message: err.message,
        response: err.response?.data,
        selectedItemsCount: selectedItems?.length || 0
      });
      setError(err.response?.data?.message || err.message || '訂單創建失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const finalError = error || orderError;

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <Text variant="title1" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', marginBottom: '2rem' }}>
          結帳
        </Text>

        {(!selectedItems || selectedItems.length === 0) ? (
          <div className="text-center py-12">
            <Text variant="headline" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ marginBottom: '1rem' }}>
              {cartLoading ? '載入購物車中...' : cartError ? `載入購物車失敗: ${cartError}` : cartItems && cartItems.length > 0 ? '請先在購物車頁面選擇要結帳的商品' : '購物車是空的'}
            </Text>
            {cartError && (
              <Button
                variant="primary"
                size="medium"
                colorMode={colorMode}
                onClick={() => {
                  console.log('[CHECKOUT] 🔄 手動重新載入購物車');
                  refreshCart();
                }}
                style={{ marginBottom: '1rem' }}
              >
                重新載入購物車
              </Button>
            )}
            <Button
              variant="secondary"
              size="medium"
              colorMode={colorMode}
              onClick={() => router.push('/')}
            >
              返回首頁
            </Button>
          </div>
        ) : (
          <div className="w-full">
            {/* 表單區域 */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-12">
                {/* 基本資訊 */}
                <div className="space-y-6">
                  <Text variant="title2" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600', fontSize: '22px', marginBottom: '3.5rem' }}>
                    收件資訊
                  </Text>
                  
                  <div style={{ marginTop: '1rem' }}>
                    <FormField
                      label="收件人姓名"
                      name="name"
                      type="text"
                      placeholder="請輸入收件人姓名"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      colorMode={colorMode}
                    />
                  </div>

                  <FormField
                    label="電子郵件"
                    name="email"
                    type="email"
                    placeholder="hi@wellmade.select"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    colorMode={colorMode}
                    errorMessage={getFieldError('email', formData.email)}
                  />

                  <FormField
                    label="手機號碼"
                    name="phone"
                    type="tel"
                    placeholder="0912345678"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    colorMode={colorMode}
                    errorMessage={getFieldError('phone', formData.phone)}
                  />
                </div>

                {/* 配送方式選擇 */}
                <div className="space-y-6">
                  {logisticsError && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Text variant="subhead" color={colors.warning} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                        配送檢查提醒
                      </Text>
                      <Text variant="footnote" color={colors.warning} colorMode={colorMode}>
                        {logisticsError}。系統將使用預設配送選項，實際配送限制以結帳時為準。
                      </Text>
                    </div>
                  )}
                  
                  <EnhancedDeliverySelector
                    selectedMethod={formData.deliveryMethod}
                    onMethodChange={handleDeliveryMethodChange}
                    cartItems={selectedItems.map(item => ({
                      id: item.id,
                      productId: item.productId || item.id,
                      variantId: item.variantId,
                      name: item.name,
                      quantity: item.quantity,
                      price: item.price
                    }))}
                    colorMode={colorMode}
                  />

                  {/* 條件渲染：宅配地址或門市選擇 */}
                  {formData.deliveryMethod === DeliveryMethod.HOME_DELIVERY && (
                    <div>
                      <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ display: 'block', fontWeight: 'medium', marginBottom: '0.25rem' }}>
                        送貨地址 *
                      </Text>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-3"
                        placeholder="請輸入完整送貨地址"
                      />
                    </div>
                  )}

                  {isStorePickup && (
                    <div>
                      {formData.selectedStore ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                已選擇門市
                              </Text>
                              <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ marginBottom: '0.25rem' }}>
                                {formData.selectedStore.name}
                              </Text>
                              <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
                                {formData.selectedStore.address}
                              </Text>
                            </div>
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => setShowStoreSelector(true)}
                              colorMode={colorMode}
                            >
                              更換門市
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="medium"
                          onClick={() => setShowStoreSelector(true)}
                          colorMode={colorMode}
                          style={{ width: '100%' }}
                        >
                          選擇取貨門市
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* 付款方式 */}
                <div>
                  <Text variant="title3" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'medium', marginBottom: '1rem' }}>
                    付款方式
                  </Text>
                  <div className="space-y-4">
                    <div className="relative flex items-start" data-testid="payment-option-credit-card">
                      <div className="flex items-center h-5">
                        <input
                          id="credit_card"
                          name="paymentMethod"
                          type="radio"
                          value={PaymentMethod.CREDIT_CARD}
                          checked={formData.paymentMethod === PaymentMethod.CREDIT_CARD}
                          onChange={handleInputChange}
                          className="focus:ring-gray-500 h-4 w-4 text-gray-600 border-gray-300"
                          data-testid="credit-card"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="credit_card" className="font-medium text-gray-700">
                          信用卡付款
                        </label>
                        <p className="text-gray-500">支援 Visa、MasterCard、JCB</p>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start" data-testid="payment-option-line-pay">
                      <div className="flex items-center h-5">
                        <input
                          id="line_pay"
                          name="paymentMethod"
                          type="radio"
                          value={PaymentMethod.LINE_PAY}
                          checked={formData.paymentMethod === PaymentMethod.LINE_PAY}
                          onChange={handleInputChange}
                          className="focus:ring-gray-500 h-4 w-4 text-gray-600 border-gray-300"
                          data-testid="line-pay"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="line_pay" className="font-medium text-gray-700">
                          LINE Pay
                        </label>
                        <p className="text-gray-500">使用 LINE 進行安全付款</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 備註 */}
                <div>
                  <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ display: 'block', fontWeight: 'medium', marginBottom: '0.25rem' }}>
                    訂單備註
                  </Text>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-3"
                    placeholder="如有特殊需求請在此說明（選填）"
                  />
                </div>

                {/* 選中的商品列表 */}
                <div className="mb-8">
                  <div className="divide-y divide-gray-200">
                    {selectedItems.map((item, index) => (
                      <div key={`${item.id}_${index}`} className="py-4 flex gap-4 relative">
                        {/* 商品圖片 */}
                        <div className="w-20 h-20 relative flex-shrink-0 bg-gray-100 rounded">
                          {item.cover && item.cover.trim() !== '' ? (
                            <Image
                              src={item.cover}
                              alt={item.name}
                              fill
                              className="object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                              <Text variant="footnote" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
                                無圖
                              </Text>
                            </div>
                          )}
                        </div>
                        
                        {/* 商品資訊 */}
                        <div className="flex-1">
                          {/* 商品名稱 x 數量 */}
                          <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600' }}>
                            {item.name.split(' x ')[0]} x {item.quantity}
                          </Text>
                          
                          {/* 變體規格顯示 - 換行 */}
                          {item.specs && Object.keys(item.specs).length > 0 && (
                            <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ display: 'block', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                              {Object.entries(item.specs).map(([key, value]) => `${key}: ${value}`).join(' • ')}
                            </Text>
                          )}
                          
                          {/* 預購狀態顯示 */}
                          {item.isPreorder && (
                            <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                              📅 預購商品
                            </div>
                          )}
                          
                          {/* 預購信息顯示 */}
                          {item.isPreorder && item.preorderInfo && (
                            <div className="text-xs space-y-1">
                              {item.preorderInfo.expectedShipDate && (
                                <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
                                  預計出貨: {new Date(item.preorderInfo.expectedShipDate).toLocaleDateString('zh-TW')}
                                </Text>
                              )}
                              {item.preorderInfo.preorderDescription && (
                                <Text variant="footnote" color={colors.info} colorMode={colorMode}>
                                  {item.preorderInfo.preorderDescription}
                                </Text>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* 價格顯示 - 固定右下角，對齊圖片底部 */}
                        <div className="absolute right-0 bottom-4">
                          <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600' }}>
                            $ {(item.price * item.quantity).toLocaleString()}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 費用明細區塊 - 從底部移到這裡 */}
                  <div className="mt-6">
                    <ShippingCalculator
                      cartItems={selectedItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        weight: 0.5, // 預設重量
                        isPreorder: item.isPreorder
                      }))}
                      deliveryInfo={deliveryInfo}
                      colorMode={colorMode}
                    />
                  </div>
                </div>

                {/* 錯誤訊息 */}
                {finalError && (
                  <div className="rounded-md p-4" style={{ backgroundColor: `${colors.danger.light}10` }}>
                    <Text variant="subhead" color={colors.danger} colorMode={colorMode} style={{ fontWeight: 'medium', marginBottom: '0.5rem' }}>
                      發生錯誤
                    </Text>
                    <Text variant="subhead" color={colors.danger} colorMode={colorMode}>
                      {finalError}
                    </Text>
                  </div>
                )}

                {/* 提交按鈕 */}
                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    colorMode={colorMode}
                    disabled={isLoading || orderLoading || !formData.deliveryMethod}
                    style={{ width: '100%' }}
                  >
                    {isLoading || orderLoading ? '處理中...' : '確認訂單'}
                  </Button>
                  
                  <Text variant="footnote" color={colors.neutral.tertiaryLabel} colorMode={colorMode} style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                    點擊「確認訂單」即表示您同意我們的服務條款
                  </Text>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 門市選擇彈窗 - 使用藍新金流門市地圖 */}
        {showStoreSelector && isStorePickup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 max-h-[90vh] overflow-y-auto">
                <NewebpayStoreSelector
                  storeType={formData.deliveryMethod!}
                  selectedStore={formData.selectedStore}
                  onStoreSelect={handleStoreSelect}
                  onClose={() => setShowStoreSelector(false)}
                  colorMode={colorMode}
                  merchantOrderNo={`TEMP_${Date.now()}`} // 暫時訂單編號，實際應該在建立訂單後使用真實訂單號
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCheckoutForm;