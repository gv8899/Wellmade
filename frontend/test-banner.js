// 測試 Banner API 的簡單腳本
const API_BASE_URL = 'http://localhost:3003';

// 模擬創建一個測試 Banner
async function createTestBanner() {
  const bannerData = {
    title: '歡迎來到 Wellmade',
    description: '探索精選商品，享受優質生活',
    imageUrl: '/forest-banner.jpg', // 使用現有圖片作為測試
    linkType: 'none',
    position: 'homepage',
    sortOrder: 1,
    isActive: true
  };

  try {
    const response = await fetch(`${API_BASE_URL}/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 注意：這裡需要 JWT token，實際使用時需要先登入獲取 token
      },
      body: JSON.stringify(bannerData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('測試 Banner 創建成功:', result);
    } else {
      console.log('創建失敗，狀態碼:', response.status);
      console.log('錯誤訊息:', await response.text());
    }
  } catch (error) {
    console.error('請求失敗:', error);
  }
}

// 測試獲取 Banner
async function getPublicBanners() {
  try {
    const response = await fetch(`${API_BASE_URL}/banners`);
    const banners = await response.json();
    console.log('目前的 Banner:', banners);
  } catch (error) {
    console.error('獲取 Banner 失敗:', error);
  }
}

// 執行測試
console.log('測試 Banner API...');
getPublicBanners();
// createTestBanner(); // 需要認證，暫時註解