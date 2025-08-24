import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

// Base64 編碼函數（Node.js 環境可用）
function base64Encode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64');
  }
  // 前端環境的備援方案
  return btoa(unescape(encodeURIComponent(str)));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[API Proxy] Newebpay store map request:', body);

    // 從請求中取得認證 token
    const authToken = request.headers.get('authorization');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // 如果有認證 token 就加入 headers
    if (authToken) {
      headers['authorization'] = authToken;
    }

    // 呼叫後端的藍新金流物流服務
    const response = await fetch(`${BACKEND_URL}/api/logistics/newebpay/store-map`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Proxy] Newebpay store map request failed:', response.status, response.statusText, errorText);
      
      // 如果後端不可用或認證失敗，使用官方門市選擇頁面
      console.log('[API Proxy] 後端藍新 API 不可用，使用官方門市選擇頁面');
      const frontendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://wellmade.select' 
        : 'http://localhost:3000';
      
      let officialMapUrl = '';
      const shipType = parseInt(body.ShipType || body.shipType || '1');
      const returnUrl = body.ReturnURL || body.returnUrl || `${frontendUrl}/api/logistics/webhook/store-selected`;
      
      console.log('[API Proxy] Store map fallback - ShipType:', shipType, 'ReturnURL:', returnUrl);
      
      switch (shipType) {
        case 1: // 7-ELEVEN
          // 創建一個本地的中介頁面來處理 7-11 回調
          const intermediateUrl = `${frontendUrl}/api/logistics/7eleven-callback`;
          officialMapUrl = `https://emap.presco.com.tw/c2cemap.ashx?eshopid=870&servicetype=1&url=${encodeURIComponent(intermediateUrl)}`;
          break;
        case 2: // 全家便利商店
          // 🎉 使用全家門市查詢 API 的自建門市選擇器
          console.log('[Store Map] 使用全家門市查詢 API 自建門市選擇器');
          
          // 直接使用我們的門市選擇器，不再依賴有問題的官方回調機制
          officialMapUrl = `${frontendUrl}/family-mart-selector.html`;
          console.log('[Store Map] 全家便利商店門市選擇器:', officialMapUrl);
          break;
        case 3: // 萊爾富  
        case 4: // OK便利商店
        default:
          // 其他超商暫時使用測試模式
          const storeNames = { 3: 'HiLife', 4: 'OKMart' };
          const storeName = storeNames[shipType as keyof typeof storeNames] || 'ConvenienceStore';
          officialMapUrl = `${frontendUrl}/test/store-map?${new URLSearchParams({
            storeType: shipType.toString(),
            merchantOrderNo: body.MerchantOrderNo || `TEST_${Date.now()}`,
            returnUrl: returnUrl,
            storeName: storeName
          }).toString()}`;
      }
      
      return NextResponse.json({
        success: true,
        mapUrl: officialMapUrl,
        message: shipType === 1 ? '使用 7-11 官方門市選擇頁面' : 
                shipType === 2 ? '使用全家便利商店官方門市選擇 API' :
                '使用測試模式 - 該超商官方 API 尚未整合',
        isTestMode: shipType > 2,
        service: shipType === 1 ? '7-11 官方 API' : 
                shipType === 2 ? '全家便利商店官方 API' : 'Test Mode',
        note: shipType === 2 ? '使用 mfme.map.com.tw 官方門市選擇服務' : undefined
      });
    }

    const data = await response.json();
    console.log('[API Proxy] Newebpay store map response:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Proxy] Newebpay store map error:', error);
    
    // 發生錯誤時使用官方門市選擇頁面（預設 7-11）
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://wellmade.select' 
      : 'http://localhost:3000';
      
    const returnUrl = `${frontendUrl}/api/logistics/webhook/store-selected`;
    const officialMapUrl = `https://emap.presco.com.tw/c2cemap.ashx?eshopid=870&servicetype=1&url=${encodeURIComponent(returnUrl)}`;
    
    return NextResponse.json({
      success: true,
      mapUrl: officialMapUrl,
      message: '發生錯誤，使用 7-11 官方門市選擇頁面',
      isTestMode: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}