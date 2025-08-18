'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface MockStore {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance?: number;
}

export default function TestStoreMapPage() {
  const searchParams = useSearchParams();
  const storeType = searchParams.get('storeType') || '1';
  const merchantOrderNo = searchParams.get('merchantOrderNo') || '';
  const returnUrl = searchParams.get('returnUrl') || '';
  
  const [selectedStore, setSelectedStore] = useState<MockStore | null>(null);

  const getStoreTypeName = (type: string): string => {
    switch (type) {
      case '1': return '7-ELEVEN';
      case '2': return '全家便利商店';
      case '3': return '萊爾富';
      case '4': return 'OK便利商店';
      default: return '便利商店';
    }
  };

  const mockStores: MockStore[] = [
    {
      id: 'TEST001',
      name: `${getStoreTypeName(storeType)} 台北車站門市`,
      address: '台北市中正區北平西路3號',
      phone: '02-2381-1234',
      distance: 0.5
    },
    {
      id: 'TEST002',
      name: `${getStoreTypeName(storeType)} 西門町門市`,
      address: '台北市萬華區漢中街118號',
      phone: '02-2371-5678',
      distance: 1.2
    },
    {
      id: 'TEST003',
      name: `${getStoreTypeName(storeType)} 信義商圈門市`,
      address: '台北市信義區信義路五段7號',
      phone: '02-2722-9999',
      distance: 2.1
    },
    {
      id: 'TEST004',
      name: `${getStoreTypeName(storeType)} 士林夜市門市`,
      address: '台北市士林區大東路100號',
      phone: '02-2881-5566',
      distance: 3.5
    },
    {
      id: 'TEST005',
      name: `${getStoreTypeName(storeType)} 東區門市`,
      address: '台北市大安區忠孝東路四段200號',
      phone: '02-2771-3344',
      distance: 2.8
    }
  ];

  const handleStoreSelect = (store: MockStore) => {
    setSelectedStore(store);
  };

  const handleConfirm = () => {
    if (selectedStore && window.opener) {
      // 通知父視窗門市選擇結果
      window.opener.postMessage({
        type: 'STORE_SELECTED',
        store: {
          storeId: selectedStore.id,
          storeName: selectedStore.name,
          storeAddress: selectedStore.address,
          storePhone: selectedStore.phone
        }
      }, '*');
      
      window.close();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* 標題 */}
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            🗺️ {getStoreTypeName(storeType)} 門市地圖選擇
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            📋 訂單編號: {merchantOrderNo}
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              🧪 <strong>開發測試模式</strong> - 這是模擬的門市選擇頁面，用於開發和測試。
            </p>
          </div>
        </div>

        {/* 門市列表 */}
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            請選擇取貨門市：
          </h2>
          
          {mockStores.map((store) => {
            const isSelected = selectedStore?.id === store.id;
            
            return (
              <div
                key={store.id}
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                onClick={() => handleStoreSelect(store)}
              >
                <div className="flex items-start space-x-3">
                  {/* Radio button */}
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                    }
                  `}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* 門市名稱 */}
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {store.name}
                    </h3>

                    {/* 地址 */}
                    <p className="text-gray-600 mb-2">
                      📍 {store.address}
                    </p>

                    {/* 營業時間和電話 */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>🕒 24小時營業</span>
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

        {/* 確認按鈕 */}
        <div className="border-t pt-4">
          <div className="flex space-x-4">
            <button
              onClick={handleConfirm}
              disabled={!selectedStore}
              className={`
                flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200
                ${selectedStore
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {selectedStore ? '✅ 確認選擇此門市' : '請先選擇門市'}
            </button>
            
            <button
              onClick={() => window.close()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              取消
            </button>
          </div>
          
          {selectedStore && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">
                ✅ 已選擇門市：
              </h4>
              <p className="text-green-700">
                <strong>{selectedStore.name}</strong><br />
                📍 {selectedStore.address}<br />
                📞 {selectedStore.phone}
              </p>
            </div>
          )}
        </div>

        {/* 說明文字 */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">💡 操作說明：</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 點擊選擇您要取貨的門市</li>
            <li>• 確認門市資訊無誤後點擊「確認選擇此門市」</li>
            <li>• 門市資訊將自動回傳到結帳頁面</li>
            <li>• 完成選擇後此視窗會自動關閉</li>
          </ul>
        </div>
      </div>
    </div>
  );
}