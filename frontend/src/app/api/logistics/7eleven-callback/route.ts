import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    console.log('[7-11 Callback] 收到 GET 回調，所有參數:', params);
    console.log('[7-11 Callback] URL:', url.toString());

    // 創建回調頁面，直接與父視窗通訊
    const responseHtml = `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="utf-8">
        <title>7-11 門市選擇完成</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .loading {
            color: #666;
            margin: 20px 0;
          }
          .debug {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 10px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 12px;
            text-align: left;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🏪 7-11 門市選擇完成</h2>
          <p class="loading">正在處理門市資料...</p>
          <div class="debug" id="debug-info"></div>
        </div>

        <script>
          // 記錄收到的所有參數
          const allParams = ${JSON.stringify(params)};
          console.log('7-11 回調頁面收到的參數:', allParams);
          
          // 顯示調試信息
          const debugElement = document.getElementById('debug-info');
          debugElement.innerHTML = 
            '<strong>收到的參數:</strong><br>' + 
            JSON.stringify(allParams, null, 2).replace(/\\n/g, '<br>').replace(/ /g, '&nbsp;');
            
          // 如果沒有參數，顯示額外信息
          if (Object.keys(allParams).length === 0) {
            debugElement.innerHTML += '<br><br><strong>警告：沒有收到任何參數！</strong><br>可能需要檢查 7-11 回調機制。';
          }

          // 嘗試解析門市資料
          let storeData = {
            storeId: 'unknown',
            storeName: 'unknown',
            storeAddress: 'unknown',
            storePhone: ''
          };

          // 檢查所有可能的參數名稱
          const possibleIds = ['storeId', 'storeid', 'STOREID', 'StoreID', 'CVSStoreID', 'id', 'ID', 'POIId', 'poiid'];
          const possibleNames = ['storeName', 'storename', 'STORENAME', 'StoreName', 'CVSStoreName', 'name', 'NAME', 'POIName', 'poiname'];
          const possibleAddrs = ['storeAddr', 'storeAddress', 'address', 'ADDRESS', 'StoreAddr', 'CVSAddress', 'addr', 'ADDR', 'Address'];
          const possiblePhones = ['storePhone', 'storeTel', 'tel', 'phone', 'PHONE', 'StoreTel', 'CVSTelephone', 'telephone', 'TEL', 'Telephone'];

          // 使用 7-11 實際的參數格式進行精確映射
          if (allParams.storeid) storeData.storeId = allParams.storeid;
          if (allParams.storename) storeData.storeName = allParams.storename;
          if (allParams.storeaddress) storeData.storeAddress = allParams.storeaddress;
          if (allParams.storephone || allParams.phone || allParams.tel) {
            storeData.storePhone = allParams.storephone || allParams.phone || allParams.tel || '';
          }

          console.log('解析後的門市資料:', storeData);

          // 通知父視窗
          if (window.opener) {
            console.log('向父視窗發送門市選擇訊息');
            window.opener.postMessage({
              type: 'STORE_SELECTED',
              store: storeData,
              originalParams: allParams
            }, '*');
            
            // 延遲關閉視窗，讓用戶看到結果
            setTimeout(() => {
              window.close();
            }, 2000);
          } else {
            console.log('沒有父視窗，無法發送訊息');
            document.querySelector('.loading').textContent = '沒有父視窗，請手動關閉此頁面';
          }

          // 如果 2 秒後視窗還沒關閉，提供手動關閉按鈕
          setTimeout(() => {
            if (!window.closed) {
              const button = document.createElement('button');
              button.textContent = '關閉視窗';
              button.onclick = () => window.close();
              button.style.cssText = 'padding: 10px 20px; font-size: 16px; margin-top: 20px; cursor: pointer;';
              document.querySelector('.container').appendChild(button);
            }
          }, 2000);
        </script>
      </body>
      </html>
    `;

    return new NextResponse(responseHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('[7-11 Callback] 處理回調失敗:', error);
    return new NextResponse(
      `<html><body><h2>處理 7-11 回調時發生錯誤</h2><pre>${error}</pre></body></html>`,
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        status: 500
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    let body: any = {};
    
    console.log('[7-11 Callback] 收到 POST 請求，Content-Type:', contentType);
    
    if (contentType?.includes('application/json')) {
      body = await request.json();
      console.log('[7-11 Callback] JSON 格式 POST 資料:', body);
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }
      console.log('[7-11 Callback] Form 格式 POST 資料:', body);
    } else {
      // 嘗試讀取原始內容
      const text = await request.text();
      console.log('[7-11 Callback] 原始 POST 內容:', text);
      
      // 嘗試解析為 form data
      try {
        const searchParams = new URLSearchParams(text);
        for (const [key, value] of searchParams.entries()) {
          body[key] = value;
        }
        console.log('[7-11 Callback] 解析後的 POST 資料:', body);
      } catch (e) {
        console.log('[7-11 Callback] 無法解析 POST 資料');
      }
    }
    
    // 創建包含 POST 資料的回調頁面
    const responseHtml = `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="utf-8">
        <title>7-11 門市選擇完成 (POST)</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
          .debug { background: #f8f9fa; border: 1px solid #dee2e6; padding: 10px; margin: 20px; font-family: monospace; font-size: 12px; text-align: left; }
        </style>
      </head>
      <body>
        <h2>🏪 7-11 門市選擇完成 (POST 回調)</h2>
        <div class="debug">
          <strong>POST 資料:</strong><br>
          ${JSON.stringify(body, null, 2)}
        </div>

        <script>
          const postData = ${JSON.stringify(body)};
          console.log('7-11 POST 回調收到的資料:', postData);
          
          // 解析門市資料
          let storeData = {
            storeId: 'unknown',
            storeName: 'unknown',
            storeAddress: 'unknown',
            storePhone: ''
          };

          // 檢查 POST 資料中的門市信息 - 使用精確的鍵名匹配
          if (postData.storeid) storeData.storeId = postData.storeid;
          if (postData.storename) storeData.storeName = postData.storename;
          if (postData.storeaddress) storeData.storeAddress = postData.storeaddress;
          if (postData.storephone || postData.phone || postData.tel) {
            storeData.storePhone = postData.storephone || postData.phone || postData.tel || '';
          }

          console.log('解析後的門市資料:', storeData);

          if (window.opener) {
            window.opener.postMessage({
              type: 'STORE_SELECTED',
              store: storeData,
              originalParams: postData
            }, '*');
            setTimeout(() => window.close(), 1000);
          }
        </script>
      </body>
      </html>
    `;

    return new NextResponse(responseHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('[7-11 Callback] POST 處理失敗:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}