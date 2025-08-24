import { NextRequest, NextResponse } from 'next/server';

// 全家門市查詢 API 端點
const FAMILY_API_URL = 'http://api.map.com.tw/net/familyShop.aspx';
const FAMILY_API_KEY = '6F30E8BF706D653965BDE302661D1241F8BE9EBC';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    // 正確處理 URL 解碼
    const rawCity = url.searchParams.get('city') || '台北市';
    const rawArea = url.searchParams.get('area') || '';
    const rawRoad = url.searchParams.get('road') || '';
    
    // 正確處理 URL 參數中的中文字符
    let city = rawCity || '台北市';
    let area = rawArea || '';
    let road = rawRoad || '';
    
    // 如果參數看起來被雙重編碼了，嘗試再次解碼
    try {
      if (city.includes('%')) {
        city = decodeURIComponent(city);
      }
      if (area.includes('%')) {
        area = decodeURIComponent(area);
      }
      if (road.includes('%')) {
        road = decodeURIComponent(road);
      }
    } catch (e) {
      console.log('[全家門市查詢] 解碼錯誤，使用原始值:', e);
    }
    
    console.log('[全家門市查詢] 查詢參數:', { city, area, road });

    // 構建查詢 URL - 手動編碼避免問題
    const params = [
      'searchType=ShopList',
      'type=',
      `city=${encodeURIComponent(city)}`,
      `area=${encodeURIComponent(area)}`,
      `road=${encodeURIComponent(road)}`,
      'fun=showStoreList',
      `key=${FAMILY_API_KEY}`
    ].join('&');

    const apiUrl = `${FAMILY_API_URL}?${params}`;
    console.log('[全家門市查詢] API URL:', apiUrl);

    // 調用全家 API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Referer': 'http://www.family.com.tw/marketing/inquiry.aspx',
        'User-Agent': 'Mozilla/5.0 (compatible; Wellmade-Store-Locator/1.0)'
      }
    });

    if (!response.ok) {
      console.log('[全家門市查詢] API 回應錯誤:', response.status, response.statusText);
      
      // 如果是 500 錯誤，返回空結果而不是拋出錯誤
      if (response.status === 500) {
        console.log('[全家門市查詢] 伺服器錯誤，返回空結果');
        return NextResponse.json({
          success: true,
          stores: [],
          total: 0,
          query: { city, area, road },
          message: '暫時無法取得門市資料，請稍後再試',
          apiError: true
        });
      }
      
      throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log('[全家門市查詢] 原始響應長度:', responseText.length);

    // 解析 JSONP 響應
    // 格式：showStoreList([{...}, {...}])
    console.log('[全家門市查詢] 響應開頭:', responseText.substring(0, 100));
    console.log('[全家門市查詢] 響應結尾:', responseText.substring(responseText.length - 20));
    
    const jsonpMatch = responseText.match(/showStoreList\((.*)\)$/s);
    if (!jsonpMatch) {
      console.log('[全家門市查詢] 無法匹配 JSONP 格式，原始響應:', responseText);
      throw new Error('無法解析 JSONP 響應格式');
    }

    let storesData;
    try {
      storesData = JSON.parse(jsonpMatch[1]);
    } catch (parseError) {
      console.log('[全家門市查詢] JSON 解析失敗，匹配內容:', jsonpMatch[1]);
      throw new Error('JSON 解析失敗: ' + parseError.message);
    }
    console.log('[全家門市查詢] 找到門市數量:', storesData.length);

    // 轉換為標準格式，並從地址中提取區域資訊
    const stores = storesData.map((store: any) => {
      // 從地址中提取區域（假設格式為：縣市 + 區域 + 其他）
      let extractedArea = area;
      
      if (store.addr && !area) {
        // 嘗試從地址中提取區域
        const addressMatch = store.addr.match(/^([^市縣]+[市縣])([^區鄉鎮]+[區鄉鎮])/);
        if (addressMatch) {
          extractedArea = addressMatch[2]; // 提取區域部分
        } else {
          // 如果從地址提取失敗，嘗試從門市名稱提取
          const nameMatch = store.NAME.match(/全家([^店]+)店/);
          if (nameMatch) {
            const nameArea = nameMatch[1];
            // 常見區域後綴
            if (nameArea.includes('區') || nameArea.includes('鄉') || nameArea.includes('鎮')) {
              // 如果門市名稱包含區域資訊，提取它
              const areaMatch = nameArea.match(/([^區鄉鎮]*[區鄉鎮])/);
              if (areaMatch) {
                extractedArea = areaMatch[1];
              }
            }
          }
        }
      }
      
      return {
        storeId: store.pkey,
        storeName: store.NAME,
        storeAddress: store.addr,
        storePhone: store.TEL,
        latitude: store.py,
        longitude: store.px,
        services: store.all ? store.all.split(',') : [],
        area: extractedArea,
        city: city,
        road: store.road
      };
    });

    return NextResponse.json({
      success: true,
      stores: stores,
      total: stores.length,
      query: { city, area, road },
      message: `找到 ${stores.length} 間全家便利商店`
    });

  } catch (error) {
    console.error('[全家門市查詢] 錯誤:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      stores: [],
      total: 0
    }, { status: 500 });
  }
}

// 支援 POST 請求
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, area, road } = body;
    
    // 創建一個新的 GET 請求
    const url = new URL(request.url);
    if (city) url.searchParams.set('city', city);
    if (area) url.searchParams.set('area', area);
    if (road) url.searchParams.set('road', road);
    
    const newRequest = new Request(url.toString(), {
      method: 'GET',
      headers: request.headers
    });
    
    return GET(newRequest as NextRequest);
  } catch (error) {
    console.error('[全家門市查詢] POST 請求錯誤:', error);
    return NextResponse.json({
      success: false,
      error: 'POST 請求格式錯誤',
      stores: [],
      total: 0
    }, { status: 400 });
  }
}