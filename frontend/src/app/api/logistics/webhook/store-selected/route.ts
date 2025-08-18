import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    let body: any = {};
    
    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }
    }
    
    console.log('[Webhook] Store selected (POST):', body);

    // 處理不同格式的門市資訊回調
    let storeData = {};
    
    if (body.CVSStoreID) {
      // 7-11 格式
      storeData = {
        storeId: body.CVSStoreID,
        storeName: body.CVSStoreName,
        storeAddress: body.CVSAddress,
        storePhone: body.CVSTelephone || ''
      };
    } else if (body.StoreID) {
      // 其他格式
      storeData = {
        storeId: body.StoreID,
        storeName: body.StoreName,
        storeAddress: body.StoreAddr,
        storePhone: body.StoreTel || ''
      };
    } else {
      // 測試格式
      storeData = {
        storeId: body.storeId || 'unknown',
        storeName: body.storeName || 'unknown',
        storeAddress: body.storeAddress || 'unknown',
        storePhone: body.storePhone || ''
      };
    }
    
    // 回傳 JavaScript 代碼通知父視窗
    const responseScript = `
      <script>
        if (window.opener) {
          window.opener.postMessage({
            type: 'STORE_SELECTED',
            store: ${JSON.stringify(storeData)}
          }, '*');
          window.close();
        }
      </script>
    `;

    return new NextResponse(responseScript, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('[Webhook] Store selection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    console.log('[Webhook] Store selected (GET) - All params:', params);
    console.log('[Webhook] Store selected (GET) - URL:', url.toString());

    // 處理不同格式的 7-11 門市回調參數
    let storeData = {
      storeId: 'unknown',
      storeName: 'unknown', 
      storeAddress: 'unknown',
      storePhone: ''
    };

    // 嘗試所有可能的參數組合
    const allPossibleParams = Object.keys(params);
    console.log('[Webhook] 所有收到的參數鍵:', allPossibleParams);
    
    // 尋找門市 ID
    const idKeys = ['storeId', 'storeid', 'STOREID', 'StoreID', 'CVSStoreID', 'id', 'ID', 'POIId', 'poiid'];
    for (const key of idKeys) {
      if (params[key]) {
        storeData.storeId = params[key];
        break;
      }
    }
    
    // 尋找門市名稱
    const nameKeys = ['storeName', 'storename', 'STORENAME', 'StoreName', 'CVSStoreName', 'name', 'NAME', 'POIName', 'poiname'];
    for (const key of nameKeys) {
      if (params[key]) {
        storeData.storeName = params[key];
        break;
      }
    }
    
    // 尋找門市地址
    const addrKeys = ['storeAddr', 'storeAddress', 'address', 'ADDRESS', 'StoreAddr', 'CVSAddress', 'addr', 'ADDR', 'Address'];
    for (const key of addrKeys) {
      if (params[key]) {
        storeData.storeAddress = params[key];
        break;
      }
    }
    
    // 尋找門市電話
    const phoneKeys = ['storePhone', 'storeTel', 'tel', 'phone', 'PHONE', 'StoreTel', 'CVSTelephone', 'telephone', 'TEL', 'Telephone'];
    for (const key of phoneKeys) {
      if (params[key]) {
        storeData.storePhone = params[key];
        break;
      }
    }

    console.log('[Webhook] Parsed store data:', storeData);

    const responseScript = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>門市選擇完成</title>
      </head>
      <body>
        <script>
          console.log('門市回調頁面載入，參數：', ${JSON.stringify(params)});
          console.log('處理後的門市資料：', ${JSON.stringify(storeData)});
          
          if (window.opener) {
            window.opener.postMessage({
              type: 'STORE_SELECTED',
              store: ${JSON.stringify(storeData)}
            }, '*');
            setTimeout(() => window.close(), 1000);
          } else {
            document.body.innerHTML = '<h2>門市選擇完成，請關閉此視窗</h2><pre>' + JSON.stringify(${JSON.stringify(params)}, null, 2) + '</pre>';
          }
        </script>
      </body>
      </html>
    `;

    return new NextResponse(responseScript, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('[Webhook] Store selection error (GET):', error);
    return new NextResponse(
      '<html><body><h2>發生錯誤，請關閉此視窗</h2></body></html>',
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        status: 500
      }
    );
  }
}