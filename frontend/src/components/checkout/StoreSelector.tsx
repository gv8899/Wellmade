'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { DeliveryMethod, Store, StoreSearchParams } from '@/types/logistics';
import { Text, Button, FormField } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

interface StoreSelectorProps {
  storeType: DeliveryMethod;
  selectedStore: Store | null;
  onStoreSelect: (store: Store) => void;
  onClose?: () => void;
  colorMode?: ColorMode;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({
  storeType,
  selectedStore,
  onStoreSelect,
  onClose,
  colorMode = 'light'
}) => {
  const [searchParams, setSearchParams] = useState<StoreSearchParams>({
    keyword: '',
    city: '',
    district: '',
    storeType,
    limit: 20
  });
  
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(selectedStore?.id || '');

  // 城市和區域選項
  const cities = [
    '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市', 
    '基隆市', '新竹市', '嘉義市', '新竹縣', '苗栗縣', '彰化縣',
    '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣',
    '台東縣', '澎湖縣', '金門縣', '連江縣'
  ];

  const getDistrictsByCity = (city: string): string[] => {
    // 這裡應該根據城市回傳對應的區域
    // 為了演示，我只列出幾個主要城市的區域
    const districtMap: Record<string, string[]> = {
      '台北市': ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'],
      '新北市': ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '樹林區', '鶯歌區', '三峽區', '淡水區'],
      '桃園市': ['桃園區', '中壢區', '大溪區', '楊梅區', '蘆竹區', '大園區', '龜山區', '八德區', '龍潭區', '平鎮區'],
      '台中市': ['中區', '東區', '南區', '西區', '北區', '北屯區', '西屯區', '南屯區', '太平區', '大里區'],
      '台南市': ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '歸仁區', '新化區', '左鎮區'],
      '高雄市': ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '楠梓區', '小港區']
    };
    
    return districtMap[city] || [];
  };

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

  // 搜尋門市
  const searchStores = useCallback(async () => {
    if (!searchParams.keyword && !searchParams.city) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 這裡應該呼叫實際的 API
      // const response = await fetch('/api/logistics/stores/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(searchParams)
      // });
      // const data = await response.json();
      
      // 模擬 API 回應
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStores: Store[] = [
        {
          id: '001',
          name: `${getStoreTypeName(storeType)} 台北車站門市`,
          address: '台北市中正區北平西路3號',
          phone: '02-2381-1234',
          businessHours: '24小時營業',
          storeType,
          district: '中正區',
          city: '台北市',
          postalCode: '100',
          distance: 0.5
        },
        {
          id: '002',
          name: `${getStoreTypeName(storeType)} 西門町門市`,
          address: '台北市萬華區漢中街118號',
          phone: '02-2371-5678',
          businessHours: '06:00-24:00',
          storeType,
          district: '萬華區',
          city: '台北市',
          postalCode: '108',
          distance: 1.2
        },
        {
          id: '003',
          name: `${getStoreTypeName(storeType)} 信義商圈門市`,
          address: '台北市信義區信義路五段7號',
          phone: '02-2722-9999',
          businessHours: '24小時營業',
          storeType,
          district: '信義區',
          city: '台北市',
          postalCode: '110',
          distance: 2.1
        }
      ];

      setStores(mockStores);
    } catch (err) {
      setError('搜尋門市失敗，請稍後再試');
      console.error('Store search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, storeType]);

  // 當搜尋參數改變時自動搜尋
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStores();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchStores]);

  const handleStoreSelect = (store: Store) => {
    setSelectedStoreId(store.id);
    onStoreSelect(store);
  };

  const handleConfirm = () => {
    if (onClose) {
      onClose();
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

      {/* 搜尋表單 */}
      <div className="space-y-4">
        {/* 關鍵字搜尋 */}
        <FormField
          label="門市名稱或地址"
          name="keyword"
          type="text"
          placeholder="請輸入門市名稱或地址關鍵字"
          value={searchParams.keyword}
          onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
          colorMode={colorMode}
        />

        {/* 城市和區域選擇 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ display: 'block', fontWeight: 'medium', marginBottom: '0.25rem' }}>
              城市
            </Text>
            <select
              value={searchParams.city}
              onChange={(e) => setSearchParams(prev => ({ 
                ...prev, 
                city: e.target.value,
                district: '' // 重置區域選擇
              }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-3"
            >
              <option value="">請選擇城市</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ display: 'block', fontWeight: 'medium', marginBottom: '0.25rem' }}>
              區域
            </Text>
            <select
              value={searchParams.district}
              onChange={(e) => setSearchParams(prev => ({ ...prev, district: e.target.value }))}
              disabled={!searchParams.city}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-3 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">請選擇區域</option>
              {searchParams.city && getDistrictsByCity(searchParams.city).map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 搜尋結果 */}
      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <Text variant="subhead" color={colors.danger} colorMode={colorMode}>
              {error}
            </Text>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ marginLeft: '0.5rem' }}>
              搜尋門市中...
            </Text>
          </div>
        )}

        {!isLoading && stores.length === 0 && (searchParams.keyword || searchParams.city) && (
          <div className="text-center py-8">
            <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              找不到符合條件的門市
            </Text>
          </div>
        )}

        {!isLoading && stores.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stores.map((store) => {
              const isSelected = selectedStoreId === store.id;
              
              return (
                <div
                  key={store.id}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? 'border-gray-800 bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-25'
                    }
                  `}
                  onClick={() => handleStoreSelect(store)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Radio button */}
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0
                      ${isSelected 
                        ? 'border-gray-800 bg-gray-800' 
                        : 'border-gray-300'
                      }
                    `}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* 門市名稱 */}
                      <Text 
                        variant="headline" 
                        color={colors.neutral.label} 
                        colorMode={colorMode}
                        style={{ fontWeight: '600', marginBottom: '0.25rem' }}
                      >
                        {store.name}
                      </Text>

                      {/* 地址 */}
                      <Text 
                        variant="subhead" 
                        color={colors.neutral.secondaryLabel} 
                        colorMode={colorMode}
                        style={{ marginBottom: '0.25rem' }}
                      >
                        📍 {store.address}
                      </Text>

                      {/* 營業時間和電話 */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>🕒 {store.businessHours}</span>
                        <span>📞 {store.phone}</span>
                        {store.distance && (
                          <span>📏 距離 {store.distance} 公里</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 確認按鈕 */}
      {selectedStoreId && (
        <div className="pt-4 border-t">
          <Button
            variant="primary"
            size="large"
            onClick={handleConfirm}
            colorMode={colorMode}
            style={{ width: '100%' }}
          >
            確認選擇此門市
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoreSelector;