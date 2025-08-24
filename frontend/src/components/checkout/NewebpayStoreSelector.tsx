'use client';
import React, { useState, useEffect } from 'react';
import { DeliveryMethod, Store } from '@/types/logistics';
import { Text, Button } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

interface NewebpayStoreSelectorProps {
  storeType: DeliveryMethod;
  selectedStore: Store | null;
  onStoreSelect: (store: Store) => void;
  onClose?: () => void;
  colorMode?: ColorMode;
  merchantOrderNo: string; // 訂單編號，藍新金流要求
}

const NewebpayStoreSelector: React.FC<NewebpayStoreSelectorProps> = ({
  storeType,
  selectedStore,
  onStoreSelect,
  onClose,
  colorMode = 'light',
  merchantOrderNo
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);

  const getStoreTypeName = (type: DeliveryMethod): string => {
    switch (type) {
      case DeliveryMethod.SEVEN_ELEVEN:
        return '7-ELEVEN';
      case DeliveryMethod.FAMILY_MART:
        return '全家便利商店';
      case DeliveryMethod.HI_LIFE:
        return '萊爾富';
      case DeliveryMethod.OK_MART:
        return 'OK便利商店';
      default:
        return '便利商店';
    }
  };

  const getShipType = (type: DeliveryMethod): number => {
    switch (type) {
      case DeliveryMethod.SEVEN_ELEVEN:
        return 1;
      case DeliveryMethod.FAMILY_MART:
        return 2;
      case DeliveryMethod.HI_LIFE:
        return 3;
      case DeliveryMethod.OK_MART:
        return 4;
      default:
        return 1;
    }
  };

  // 開啟藍新金流門市地圖
  const openStoreMap = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[StoreSelector] 開啟藍新金流門市地圖，配送方式:', storeType);

      const returnUrl = `${window.location.origin}/api/logistics/webhook/store-selected`;

      // 透過前端代理呼叫藍新金流 storeMap
      const response = await fetch('/api/logistics/store-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ShipType: getShipType(storeType),
          MerchantOrderNo: merchantOrderNo,
          ReturnURL: returnUrl
        })
      });

      if (!response.ok) {
        throw new Error(`門市地圖請求失敗: ${response.status}`);
      }

      const data = await response.json();
      console.log('[StoreSelector] 門市地圖代理回應:', data);

      let storeMapUrl = '';
      
      if (data.success && data.mapUrl) {
        // 使用代理回傳的門市地圖 URL（可能是藍新 API 或官方門市選擇頁面）
        storeMapUrl = data.mapUrl;
      } else {
        throw new Error(data.message || '無法取得門市地圖 URL');
      }

      console.log('[StoreSelector] 門市地圖 URL:', storeMapUrl);
      setMapUrl(storeMapUrl);
      
      // 開啟新視窗顯示門市地圖
      const mapWindow = window.open(
        storeMapUrl, 
        'officialStoreMap', 
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      if (!mapWindow) {
        throw new Error('無法開啟門市地圖視窗，請檢查瀏覽器的彈出視窗設定');
      }

      // 監聽門市選擇結果
      const handleMessage = (event: MessageEvent) => {
        console.log('[StoreSelector] 收到訊息詳細資料:', {
          origin: event.origin,
          data: event.data,
          type: typeof event.data,
          keys: event.data && typeof event.data === 'object' ? Object.keys(event.data) : 'N/A'
        });
        
        // 檢查是否為門市選擇結果
        if (event.data && event.data.type === 'STORE_SELECTED') {
          console.log('[StoreSelector] 確認為門市選擇訊息:', event.data);
          
          // 記錄原始參數
          if (event.data.originalParams) {
            console.log('[StoreSelector] 7-11 原始參數:', event.data.originalParams);
            console.log('[StoreSelector] 原始參數的鍵:', Object.keys(event.data.originalParams));
          }
          
          if (event.data.store) {
            console.log('[StoreSelector] 門市資料:', event.data.store);
            console.log('[StoreSelector] 門市資料的鍵:', Object.keys(event.data.store));
            
            const selectedStoreData: Store = {
              id: event.data.store.storeId || event.data.store.CVSStoreID || 'unknown',
              name: event.data.store.storeName || event.data.store.CVSStoreName || 'unknown',
              address: event.data.store.storeAddress || event.data.store.CVSAddress || 'unknown',
              phone: event.data.store.storePhone || event.data.store.CVSTelephone || '',
              businessHours: '請洽門市',
              storeType: storeType,
              district: '',
              city: '',
              postalCode: ''
            };

            console.log('[StoreSelector] 處理後的門市資料:', selectedStoreData);
            onStoreSelect(selectedStoreData);
            
            if (mapWindow) {
              mapWindow.close();
            }
            
            window.removeEventListener('message', handleMessage);
            setIsLoading(false);
          } else {
            console.log('[StoreSelector] 警告：收到門市選擇訊息但沒有門市資料');
          }
        } else {
          console.log('[StoreSelector] 非門市選擇訊息，忽略');
        }
      };

      window.addEventListener('message', handleMessage);

      // 清理事件監聽器
      const checkClosed = setInterval(() => {
        if (mapWindow?.closed) {
          window.removeEventListener('message', handleMessage);
          clearInterval(checkClosed);
          setIsLoading(false);
        }
      }, 1000);

    } catch (err: any) {
      console.error('[StoreSelector] 開啟門市地圖錯誤:', err);
      setError(err.message || '開啟門市地圖失敗，請稍後再試');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 標題 */}
      <div className="flex items-center justify-between">
        <Text variant="title3" color={colors.neutral.label} colorMode={colorMode}>
          選擇 {getStoreTypeName(storeType)} 門市
        </Text>
        {onClose && (
          <Button
            variant="secondary"
            size="small"
            onClick={onClose}
            colorMode={colorMode}
          >
            ✕
          </Button>
        )}
      </div>

      {/* 說明文字 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Text variant="subhead" color={colors.info} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          📍 門市地圖選擇
        </Text>
        <Text variant="footnote" color={colors.info} colorMode={colorMode}>
          點擊下方按鈕將開啟藍新金流 {getStoreTypeName(storeType)} 門市選擇頁面，請選擇您要取貨的門市。
          <br />
          🔗 使用藍新金流統一門市選擇服務，支援全台 {getStoreTypeName(storeType)} 門市
        </Text>
      </div>

      {/* 實作狀態提示 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Text variant="subhead" color={colors.info} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          📋 門市選擇機制說明
        </Text>
        <Text variant="footnote" color={colors.info} colorMode={colorMode}>
          優先使用藍新金流統一門市選擇，如不可用則使用官方門市選擇頁面：
          <br />
          • 7-ELEVEN → 統一超商電子地圖系統 ✅
          <br />
          • 全家便利商店 → 自建門市選擇服務（基於 taiwan-cvs-map）✅
          <br />
          • 其他超商 → 測試模式 ⚠️
          <br />
          • 選擇完成後會自動回傳門市資訊到結帳頁面
        </Text>
      </div>

      {/* 已選擇的門市 */}
      {selectedStore && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <Text variant="subhead" color={colors.success} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            ✅ 已選擇門市
          </Text>
          <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
            {selectedStore.name}
          </Text>
          <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
            📍 {selectedStore.address}
          </Text>
          {selectedStore.phone && (
            <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ marginTop: '0.25rem' }}>
              📞 {selectedStore.phone}
            </Text>
          )}
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <Text variant="subhead" color={colors.danger} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            ❌ 發生錯誤
          </Text>
          <Text variant="footnote" color={colors.danger} colorMode={colorMode}>
            {error}
          </Text>
        </div>
      )}

      {/* 開啟門市地圖按鈕 */}
      <div className="space-y-3">
        <Button
          variant="primary"
          size="large"
          onClick={openStoreMap}
          disabled={isLoading}
          colorMode={colorMode}
          style={{ width: '100%' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              開啟門市地圖中...
            </div>
          ) : (
            `🗺️ 開啟藍新金流 ${getStoreTypeName(storeType)} 門市地圖`
          )}
        </Button>

        {selectedStore && (
          <Button
            variant="secondary"
            size="large"
            onClick={openStoreMap}
            disabled={isLoading}
            colorMode={colorMode}
            style={{ width: '100%' }}
          >
            重新選擇門市
          </Button>
        )}

        {/* 測試用模擬選擇按鈕 */}
        <Button
          variant="tertiary"
          size="medium"
          onClick={() => {
            const mockStore: Store = {
              id: 'test_001',
              name: `${getStoreTypeName(storeType)} 測試門市`,
              address: '台北市中正區測試路123號',
              phone: '02-1234-5678',
              businessHours: '24小時營業',
              storeType: storeType,
              district: '中正區',
              city: '台北市',
              postalCode: '100'
            };
            console.log('[StoreSelector] 使用測試門市:', mockStore);
            onStoreSelect(mockStore);
          }}
          disabled={isLoading}
          colorMode={colorMode}
          style={{ width: '100%' }}
        >
          🧪 使用測試門市 (開發用)
        </Button>
      </div>

      {/* 確認按鈕 */}
      {selectedStore && onClose && (
        <div className="pt-4 border-t">
          <Button
            variant="primary"
            size="large"
            onClick={onClose}
            colorMode={colorMode}
            style={{ width: '100%' }}
          >
            確認選擇此門市
          </Button>
        </div>
      )}

      {/* 操作說明 */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          📝 操作說明：
        </Text>
        <ul className="space-y-1">
          <li>
            <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              • 點擊開啟門市地圖按鈕
            </Text>
          </li>
          <li>
            <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              • 在地圖上選擇您要取貨的門市
            </Text>
          </li>
          <li>
            <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              • 確認門市資訊後關閉地圖視窗
            </Text>
          </li>
          <li>
            <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              • 選擇完成後即可繼續結帳流程
            </Text>
          </li>
        </ul>
      </div>

      {/* 藍新金流統一服務說明 */}
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <Text variant="footnote" color={colors.success} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          💳 藍新金流統一服務架構：
        </Text>
        <Text variant="footnote" color={colors.success} colorMode={colorMode}>
          • 金流與物流整合在同一平台 ✅<br />
          • 支援四大超商門市選擇 (7-11、全家、萊爾富、OK) ✅<br />
          • 官方門市選擇頁面整合 (7-11、全家) ✅<br />
          • 統一的訂單管理和客戶服務 ✅<br />
          • 簡化技術整合和維護成本 ✅<br />
          • 🔑 需要申請正式物流認證資訊啟用完整功能
        </Text>
      </div>

      {/* 申請指引 */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          📋 申請藍新物流認證步驟：
        </Text>
        <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
          1. 聯繫藍新金流客服申請物流服務<br />
          2. 取得物流商店代號 (UID_)、加密金鑰 (KEY)、加密向量 (IV)<br />
          3. 更新後端 .env 環境變數<br />
          4. 重啟服務即可使用真實門市選擇功能
        </Text>
      </div>
    </div>
  );
};

export default NewebpayStoreSelector;