import { NextRequest, NextResponse } from 'next/server';

// 全家 retrieve.aspx 端點的處理器
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    console.log('[全家 Retrieve] 收到 retrieve.aspx 回調，所有參數:', params);
    console.log('[全家 Retrieve] URL:', url.toString());

    // 創建一個成功的回調頁面，用於觸發父視窗的門市選擇完成事件
    const responseHtml = `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="utf-8">
        <title>全家便利商店門市選擇 - 處理中</title>
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
            margin: 0;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,166,81,0.2);
            max-width: 500px;
            width: 90%;
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
            font-size: 20px;
            font-weight: bold;
            margin: 0;
          }
          .status {
            color: #666;
            margin: 20px 0;
            font-size: 16px;
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
          .debug {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 11px;
            text-align: left;
            white-space: pre-wrap;
            max-height: 200px;
            overflow-y: auto;
          }
          .success {
            color: #00A651;
            font-weight: 600;
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
            font-size: 16px;
            font-weight: bold;
            color: #00A651;
            margin-bottom: 8px;
          }
          .store-detail {
            color: #333;
            margin: 4px 0;
            font-size: 14px;
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
          console.log('🏪 全家便利商店 retrieve.aspx 頁面載入');
          
          // 記錄收到的所有參數
          const allParams = ${JSON.stringify(params)};
          console.log('全家 retrieve.aspx 收到的參數:', allParams);
          
          // 顯示調試信息
          const debugElement = document.getElementById('debug-info');
          const statusElement = document.getElementById('status');
          const storeDisplayElement = document.getElementById('store-display');
          
          debugElement.innerHTML = 
            '<strong>🔍 Retrieve.aspx 收到的參數:</strong>\\n' + 
            JSON.stringify(allParams, null, 2);

          // 解析門市資料 - 全家 retrieve.aspx 可能的參數格式
          let storeData = {
            storeId: allParams.pkey || allParams.storeId || allParams.CVSStoreID || 'unknown',
            storeName: allParams.storeName || allParams.CVSStoreName || allParams.name || '全家便利商店',
            storeAddress: allParams.address || allParams.storeAddress || allParams.CVSAddress || '地址資訊不完整',
            storePhone: allParams.phone || allParams.tel || allParams.storePhone || allParams.CVSTelephone || '請洽門市'
          };

          // 如果有地區資訊，組合地址
          if (allParams.city && allParams.area) {
            const cityArea = allParams.city + allParams.area;
            if (!storeData.storeAddress.includes(cityArea)) {
              storeData.storeAddress = cityArea + storeData.storeAddress;
            }
          }

          // 檢查是否有有效的門市 ID
          let hasValidStore = false;
          if (allParams.pkey || allParams.storeId || allParams.CVSStoreID) {
            hasValidStore = true;
          }

          console.log('解析後的門市資料:', storeData);
          console.log('是否有有效門市資料:', hasValidStore);

          if (hasValidStore) {
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

            // 通知父視窗門市選擇完成
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
                source: 'family-mart-retrieve'
              }, '*');
              
              setTimeout(() => {
                statusElement.innerHTML = '<span class="success">✅ 門市選擇完成，正在關閉視窗...</span>';
                setTimeout(() => {
                  window.close();
                }, 1500);
              }, 1000);
            } else {
              statusElement.innerHTML = '⚠️ 沒有父視窗，請手動關閉此頁面';
            }
          } else {
            statusElement.innerHTML = '❌ 沒有收到有效的門市選擇資料';
            debugElement.innerHTML += '\\n\\n<strong>❌ 錯誤:</strong>無法解析門市資料\\n請檢查回調參數格式';
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
    console.error('[全家 Retrieve] 處理失敗:', error);
    return new NextResponse(
      `<html><body><h2>處理全家便利商店 retrieve.aspx 時發生錯誤</h2><pre>${error}</pre></body></html>`,
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
  // POST 請求也使用相同邏輯處理
  return GET(request);
}