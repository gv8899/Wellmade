/**
 * 物流 API 測試腳本
 * 測試藍新金流物流整合功能
 */

const axios = require('axios');

const API_BASE_URL = 'http://127.0.0.1:3003';

// 測試用的 JWT Token (需要管理員權限)
// 注意：在實際測試時需要替換為有效的 JWT token
const TEST_JWT_TOKEN = 'your_jwt_token_here';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${TEST_JWT_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

/**
 * 測試物流健康檢查端點
 */
async function testHealthCheck() {
  try {
    console.log('🔍 測試物流健康檢查...');
    const response = await axios.get(`${API_BASE_URL}/api/logistics/health`);
    console.log('✅ 健康檢查成功:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 健康檢查失敗:', error.response?.data || error.message);
    return false;
  }
}

/**
 * 測試門市地圖選取 API
 */
async function testStoreMap() {
  try {
    console.log('\n🔍 測試門市地圖選取...');
    const response = await api.get('/api/logistics/store-map', {
      params: {
        cvsType: '1', // 7-ELEVEN
        returnUrl: 'http://localhost:3000/store-callback',
        cvsOutSide: '1'
      }
    });
    console.log('✅ 門市地圖 URL 生成成功:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 門市地圖測試失敗:', error.response?.data || error.message);
    return false;
  }
}

/**
 * 測試建立物流配送單 API
 */
async function testCreateShipment() {
  try {
    console.log('\n🔍 測試建立物流配送單...');
    
    const shipmentData = {
      orderId: 'test-order-123',
      merchantOrderNo: `TEST-${Date.now()}`,
      logisticsSubType: '1', // 7-ELEVEN
      isCollection: false,
      goodsName: '測試商品',
      goodsAmount: 100,
      senderName: '測試商家',
      senderPhone: '02-12345678',
      senderCellPhone: '0912345678',
      receiverName: '測試收件人',
      receiverCellPhone: '0987654321',
      receiverEmail: 'test@example.com',
      cvsStoreId: '123456',
      cvsStoreName: '測試門市',
      cvsAddress: '台北市信義區測試路123號',
      cvsTelephone: '02-87654321',
      tradeDesc: '測試交易',
      remark: '這是一個測試訂單'
    };

    const response = await api.post('/api/logistics/shipment', shipmentData);
    console.log('✅ 物流配送單建立成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 建立物流配送單失敗:', error.response?.data || error.message);
    return null;
  }
}

/**
 * 測試查詢物流配送單 API
 */
async function testQueryShipment(merchantOrderNo) {
  try {
    console.log('\n🔍 測試查詢物流配送單...');
    const response = await api.get(`/api/logistics/shipment/${merchantOrderNo}`);
    console.log('✅ 物流配送單查詢成功:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 查詢物流配送單失敗:', error.response?.data || error.message);
    return false;
  }
}

/**
 * 測試取得物流訂單列表 API
 */
async function testGetLogisticsOrders() {
  try {
    console.log('\n🔍 測試取得物流訂單列表...');
    const response = await api.get('/api/logistics/orders', {
      params: {
        page: 1,
        limit: 10
      }
    });
    console.log('✅ 物流訂單列表取得成功:', {
      total: response.data.total,
      ordersCount: response.data.orders.length,
      page: response.data.page,
      totalPages: response.data.totalPages
    });
    return true;
  } catch (error) {
    console.error('❌ 取得物流訂單列表失敗:', error.response?.data || error.message);
    return false;
  }
}

/**
 * 測試物流統計 API
 */
async function testLogisticsStatistics() {
  try {
    console.log('\n🔍 測試物流統計...');
    const response = await api.get('/api/logistics/statistics');
    console.log('✅ 物流統計取得成功:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 物流統計測試失敗:', error.response?.data || error.message);
    return false;
  }
}

/**
 * 主要測試函式
 */
async function runTests() {
  console.log('🚀 開始物流 API 測試\n');
  
  const results = {
    healthCheck: false,
    storeMap: false,
    createShipment: false,
    queryShipment: false,
    logisticsOrders: false,
    statistics: false
  };

  // 1. 健康檢查測試
  results.healthCheck = await testHealthCheck();

  // 如果健康檢查失敗，跳過其他需要認證的測試
  if (!results.healthCheck) {
    console.log('\n❌ 基本健康檢查失敗，跳過其他測試');
    return results;
  }

  // 檢查是否有有效的 JWT token
  if (TEST_JWT_TOKEN === 'your_jwt_token_here') {
    console.log('\n⚠️  未設定有效的 JWT token，跳過需要認證的測試');
    console.log('請更新 TEST_JWT_TOKEN 變數以進行完整測試');
    return results;
  }

  // 2. 門市地圖測試
  results.storeMap = await testStoreMap();

  // 3. 建立物流配送單測試
  const shipmentOrder = await testCreateShipment();
  results.createShipment = !!shipmentOrder;

  // 4. 查詢物流配送單測試（如果建立成功）
  if (shipmentOrder) {
    results.queryShipment = await testQueryShipment(shipmentOrder.merchantOrderNo);
  }

  // 5. 物流訂單列表測試
  results.logisticsOrders = await testGetLogisticsOrders();

  // 6. 物流統計測試
  results.statistics = await testLogisticsStatistics();

  // 輸出測試結果摘要
  console.log('\n📊 測試結果摘要:');
  console.log('='.repeat(50));
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ 通過' : '❌ 失敗';
    console.log(`${test.padEnd(20)} ${status}`);
  });

  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  console.log('='.repeat(50));
  console.log(`總計: ${passedCount}/${totalCount} 個測試通過`);

  return results;
}

/**
 * 顯示使用說明
 */
function showUsage() {
  console.log(`
🧪 物流 API 測試腳本使用說明

前置要求:
1. 確保後端服務運行在 http://localhost:3003
2. 物流模組已正確載入
3. 如需測試需要認證的 API，請先取得有效的 JWT token

使用方式:
node test-logistics-api.js

環境變數 (可選):
- API_BASE_URL: API 基礎 URL (預設: http://localhost:3003)
- JWT_TOKEN: 用於認證的 JWT token

測試項目:
✓ 健康檢查
✓ 門市地圖選取
✓ 建立物流配送單
✓ 查詢物流配送單
✓ 物流訂單列表
✓ 物流統計資料

注意事項:
- 某些測試會在資料庫中建立測試資料
- 藍新金流 API 需要正確的環境變數配置
- 實際的物流 API 呼叫需要正式的商家帳號
`);
}

// 執行測試
if (require.main === module) {
  // 檢查命令列參數
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage();
    process.exit(0);
  }

  runTests()
    .then(() => {
      console.log('\n🏁 測試完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 測試過程發生錯誤:', error);
      process.exit(1);
    });
}

module.exports = {
  runTests,
  testHealthCheck,
  testStoreMap,
  testCreateShipment,
  testQueryShipment,
  testGetLogisticsOrders,
  testLogisticsStatistics
};