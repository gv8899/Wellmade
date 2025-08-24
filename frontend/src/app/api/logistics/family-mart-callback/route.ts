import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    console.log('[全家 Callback] 收到 GET 回調，所有參數:', params);
    console.log('[全家 Callback] URL:', url.toString());

    // 創建回調頁面，與 7-11 類似的處理方式
    const responseHtml = `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="utf-8">
        <title>全家便利商店門市選擇完成</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #00A651, #00C766);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,166,81,0.2);
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
          }
          .logo {
            width: 40px;
            height: 40px;
            background: #00A651;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
            margin-right: 12px;
          }
          .title {
            color: #00A651;
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          .status {
            color: #666;
            margin: 20px 0;
            font-size: 16px;
          }
          .success {
            color: #00A651;
            font-weight: 600;
          }
          .debug {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
            font-size: 12px;
            text-align: left;
            white-space: pre-wrap;
            max-height: 200px;
            overflow-y: auto;
          }
          .store-info {
            background: #f0f9f4;
            border: 2px solid #00A651;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
          }
          .store-name {
            font-size: 18px;
            font-weight: bold;
            color: #00A651;
            margin-bottom: 8px;
          }
          .store-detail {
            color: #333;
            margin: 4px 0;
          }
          .btn {
            background: #00A651;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
            transition: all 0.2s;
          }
          .btn:hover {
            background: #008a44;
            transform: translateY(-1px);
          }
          .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #00A651;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 10px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">FM</div>
            <h1 class="title">全家便利商店</h1>
          </div>
          
          <p class="status" id="status">
            <div class="loading-spinner"></div>
            正在處理門市選擇資料...
          </p>
          
          <div class="debug" id="debug-info"></div>
          <div id="store-display"></div>
        </div>

        <script>
          console.log('🏪 全家便利商店回調頁面載入');
          
          // 記錄收到的所有參數
          const allParams = ${JSON.stringify(params)};
          console.log('全家回調頁面收到的參數:', allParams);
          
          // 顯示調試信息
          const debugElement = document.getElementById('debug-info');
          const statusElement = document.getElementById('status');
          const storeDisplayElement = document.getElementById('store-display');
          
          debugElement.innerHTML = 
            '<strong>🔍 收到的回調參數:</strong>\\n' + 
            JSON.stringify(allParams, null, 2);
            
          // 檢查是否有參數
          if (Object.keys(allParams).length === 0) {
            statusElement.innerHTML = '⚠️ 沒有收到任何參數';
            debugElement.innerHTML += '\\n\\n<strong>⚠️ 警告：</strong>沒有收到任何參數！\\n可能的原因：\\n1. 門市選擇被取消\\n2. 回調機制異常\\n3. 參數格式不符';
            
            setTimeout(() => {
              if (window.opener) {
                window.close();
              }
            }, 3000);
            return;
          }

          // 嘗試解析門市資料 - 全家便利商店可能的參數格式
          let storeData = {
            storeId: 'unknown',
            storeName: '未知門市',
            storeAddress: '地址資訊不完整',
            storePhone: '請洽門市'
          };

          let hasStoreData = false;

          // 方式1: 直接參數格式
          if (allParams.storeId || allParams.CVSStoreID || allParams.id) {
            storeData.storeId = allParams.storeId || allParams.CVSStoreID || allParams.id;
            hasStoreData = true;
          }
          
          if (allParams.storeName || allParams.CVSStoreName || allParams.name) {
            storeData.storeName = allParams.storeName || allParams.CVSStoreName || allParams.name;
            hasStoreData = true;
          }
          
          if (allParams.storeAddress || allParams.CVSAddress || allParams.address) {
            storeData.storeAddress = allParams.storeAddress || allParams.CVSAddress || allParams.address;
            hasStoreData = true;
          }
          
          if (allParams.storePhone || allParams.CVSTelephone || allParams.phone || allParams.tel) {
            storeData.storePhone = allParams.storePhone || allParams.CVSTelephone || allParams.phone || allParams.tel;
          }

          // 方式2: JSON 格式
          if (allParams.data && !hasStoreData) {
            try {
              const jsonData = JSON.parse(decodeURIComponent(allParams.data));
              if (jsonData.storeId) {
                storeData.storeId = jsonData.storeId;
                storeData.storeName = jsonData.storeName || storeData.storeName;
                storeData.storeAddress = jsonData.storeAddress || storeData.storeAddress;
                storeData.storePhone = jsonData.storePhone || storeData.storePhone;
                hasStoreData = true;
              }
            } catch (e) {
              console.log('JSON 解析失敗:', e);
            }
          }

          // 方式3: Base64 編碼格式
          if (allParams.encoded && !hasStoreData) {
            try {
              const decodedData = JSON.parse(atob(allParams.encoded));
              if (decodedData.storeId) {
                storeData.storeId = decodedData.storeId;
                storeData.storeName = decodedData.storeName || storeData.storeName;
                storeData.storeAddress = decodedData.storeAddress || storeData.storeAddress;
                storeData.storePhone = decodedData.storePhone || storeData.storePhone;
                hasStoreData = true;
              }
            } catch (e) {
              console.log('Base64 解析失敗:', e);
            }
          }

          // 方式4: 全家特有格式（需要根據實際回調調整）
          // 如果有其他特殊參數名稱，在這裡處理

          console.log('解析後的門市資料:', storeData);
          console.log('是否有有效門市資料:', hasStoreData);

          if (hasStoreData) {
            statusElement.innerHTML = '<span class="success">✅ 門市選擇成功！</span>';
            
            // 顯示選擇的門市資訊
            storeDisplayElement.innerHTML = \`
              <div class="store-info">
                <div class="store-name">📍 \${storeData.storeName}</div>
                <div class="store-detail"><strong>門市代碼:</strong> \${storeData.storeId}</div>
                <div class="store-detail"><strong>地址:</strong> \${storeData.storeAddress}</div>
                \${storeData.storePhone && storeData.storePhone !== '請洽門市' ? 
                  \`<div class="store-detail"><strong>電話:</strong> \${storeData.storePhone}</div>\` : ''
                }
              </div>
            \`;
            
            debugElement.innerHTML += '\\n\\n<strong>✅ 處理後的門市資料:</strong>\\n' + 
              JSON.stringify(storeData, null, 2);

            // 通知父視窗
            if (window.opener) {
              console.log('向父視窗發送門市選擇訊息');
              window.opener.postMessage({
                type: 'STORE_SELECTED',
                store: {
                  storeId: storeData.storeId,
                  storeName: storeData.storeName,
                  storeAddress: storeData.storeAddress,
                  storePhone: storeData.storePhone
                },
                originalParams: allParams,
                source: 'family-mart'
              }, '*');
              
              setTimeout(() => {
                statusElement.innerHTML = '<span class="success">✅ 門市選擇完成，正在關閉視窗...</span>';
                setTimeout(() => {
                  window.close();
                }, 1500);
              }, 1000);
            } else {
              statusElement.innerHTML = '⚠️ 沒有父視窗，請手動關閉此頁面';
              
              // 提供手動關閉按鈕
              const closeBtn = document.createElement('button');
              closeBtn.className = 'btn';
              closeBtn.textContent = '關閉視窗';
              closeBtn.onclick = () => window.close();
              storeDisplayElement.appendChild(closeBtn);
            }
          } else {
            statusElement.innerHTML = '❌ 沒有收到有效的門市選擇資料';
            debugElement.innerHTML += '\\n\\n<strong>❌ 錯誤：</strong>無法解析門市資料\\n請檢查回調參數格式';
            
            // 提供重試或關閉選項
            setTimeout(() => {
              const retryBtn = document.createElement('button');
              retryBtn.className = 'btn';
              retryBtn.textContent = '重新選擇';
              retryBtn.onclick = () => {
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'STORE_SELECTION_FAILED',
                    error: 'No valid store data received',
                    originalParams: allParams
                  }, '*');
                }
                window.close();
              };
              
              const closeBtn = document.createElement('button');
              closeBtn.className = 'btn';
              closeBtn.textContent = '關閉';
              closeBtn.onclick = () => window.close();
              closeBtn.style.marginLeft = '10px';
              closeBtn.style.background = '#666';
              
              storeDisplayElement.appendChild(retryBtn);
              storeDisplayElement.appendChild(closeBtn);
            }, 2000);
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
    console.error('[全家 Callback] 處理回調失敗:', error);
    return new NextResponse(
      `<html><body><h2>處理全家便利商店回調時發生錯誤</h2><pre>${error}</pre></body></html>`,
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
    
    console.log('[全家 Callback] 收到 POST 請求，Content-Type:', contentType);
    
    if (contentType?.includes('application/json')) {
      body = await request.json();
      console.log('[全家 Callback] JSON 格式 POST 資料:', body);
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }
      console.log('[全家 Callback] Form 格式 POST 資料:', body);
    } else {
      // 嘗試讀取原始內容
      const text = await request.text();
      console.log('[全家 Callback] 原始 POST 內容:', text);
      
      // 嘗試解析為 form data
      try {
        const searchParams = new URLSearchParams(text);
        for (const [key, value] of searchParams.entries()) {
          body[key] = value;
        }
        console.log('[全家 Callback] 解析後的 POST 資料:', body);
      } catch (e) {
        console.log('[全家 Callback] 無法解析 POST 資料');
      }
    }
    
    // 創建包含 POST 資料的回調頁面
    const responseHtml = `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="utf-8">
        <title>全家便利商店門市選擇完成 (POST)</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 20px;
            background: linear-gradient(135deg, #00A651, #00C766);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,166,81,0.2);
            max-width: 600px;
            width: 100%;
          }
          .debug { 
            background: #f8f9fa; 
            border: 1px solid #dee2e6; 
            padding: 15px; 
            margin: 20px 0; 
            font-family: monospace; 
            font-size: 12px; 
            text-align: left;
            border-radius: 8px;
            max-height: 300px;
            overflow-y: auto;
          }
          .title {
            color: #00A651;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="title">🏪 全家便利商店門市選擇完成 (POST 回調)</h2>
          <div class="debug">
            <strong>POST 資料:</strong><br>
            ${JSON.stringify(body, null, 2)}
          </div>

          <script>
            const postData = ${JSON.stringify(body)};
            console.log('全家 POST 回調收到的資料:', postData);
            
            // 使用與 GET 相同的解析邏輯
            let storeData = {
              storeId: 'unknown',
              storeName: '未知門市',
              storeAddress: '地址資訊不完整',
              storePhone: '請洽門市'
            };

            // 解析 POST 資料中的門市信息
            if (postData.storeId || postData.CVSStoreID || postData.id) {
              storeData.storeId = postData.storeId || postData.CVSStoreID || postData.id;
            }
            
            if (postData.storeName || postData.CVSStoreName || postData.name) {
              storeData.storeName = postData.storeName || postData.CVSStoreName || postData.name;
            }
            
            if (postData.storeAddress || postData.CVSAddress || postData.address) {
              storeData.storeAddress = postData.storeAddress || postData.CVSAddress || postData.address;
            }
            
            if (postData.storePhone || postData.CVSTelephone || postData.phone || postData.tel) {
              storeData.storePhone = postData.storePhone || postData.CVSTelephone || postData.phone || postData.tel;
            }

            console.log('POST 解析後的門市資料:', storeData);

            if (window.opener) {
              window.opener.postMessage({
                type: 'STORE_SELECTED',
                store: {
                  storeId: storeData.storeId,
                  storeName: storeData.storeName,
                  storeAddress: storeData.storeAddress,
                  storePhone: storeData.storePhone
                },
                originalParams: postData,
                source: 'family-mart-post'
              }, '*');
              setTimeout(() => window.close(), 1000);
            }
          </script>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(responseHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('[全家 Callback] POST 處理失敗:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}