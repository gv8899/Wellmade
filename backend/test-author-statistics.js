const axios = require('axios');

const BASE_URL = 'http://localhost:3003';

async function testAuthorStatistics() {
  console.log('🧪 測試作者統計功能...\n');

  try {
    // 1. 獲取所有作者
    console.log('1️⃣ 獲取現有作者...');
    const authorsResponse = await axios.get(`${BASE_URL}/authors`);
    const authors = authorsResponse.data;
    console.log('✅ 找到', authors.length, '位作者');

    if (authors.length === 0) {
      console.log('⚠️  沒有找到作者，測試結束');
      return;
    }

    // 2. 測試第一個作者的統計
    const firstAuthor = authors[0];
    console.log(`\n2️⃣ 測試作者統計功能 - ${firstAuthor.name}...`);
    
    try {
      const statsResponse = await axios.get(`${BASE_URL}/authors/${firstAuthor.id}/statistics`);
      console.log('✅ 獲取作者統計成功');
      console.log('📊 統計資料:');
      console.log('   作者名稱:', statsResponse.data.author.name);
      console.log('   總文章數:', statsResponse.data.statistics.totalArticles);
      console.log('   已發布文章:', statsResponse.data.statistics.publishedArticles);
      console.log('   草稿文章:', statsResponse.data.statistics.draftArticles);
      console.log('   總瀏覽次數:', statsResponse.data.statistics.totalViews);
      console.log('   平均閱讀時間:', statsResponse.data.statistics.averageReadingTime, '分鐘');
      console.log('   平均瀏覽次數:', statsResponse.data.statistics.averageViewsPerArticle);
      console.log('   熱門文章數量:', statsResponse.data.popularArticles.length);
      console.log('   最近文章數量:', statsResponse.data.recentArticles.length);
      console.log('   月度統計筆數:', statsResponse.data.monthlyStats.length);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('⚠️  需要管理員權限才能查看統計');
      } else {
        throw error;
      }
    }

    // 3. 測試所有作者的基本資料
    console.log('\n3️⃣ 測試所有作者的基本資料...');
    for (const author of authors) {
      const authorResponse = await axios.get(`${BASE_URL}/authors/${author.id}`);
      console.log(`✅ ${author.name} - ID: ${author.id.substring(0, 8)}...`);
    }

    // 4. 測試作者的文章
    console.log('\n4️⃣ 測試作者的文章...');
    const articlesResponse = await axios.get(`${BASE_URL}/authors/${firstAuthor.id}/articles`);
    console.log('✅ 獲取作者文章成功');
    console.log('   文章總數:', articlesResponse.data.meta.total);
    if (articlesResponse.data.data.length > 0) {
      console.log('   第一篇文章:', articlesResponse.data.data[0].title);
    }

    console.log('\n🎉 基本功能測試通過！');

  } catch (error) {
    console.error('❌ 測試失敗:', error.response?.data || error.message);
  }
}

// 測試錯誤處理
async function testErrorHandling() {
  console.log('\n🔧 測試錯誤處理...\n');

  try {
    // 測試獲取不存在的作者
    console.log('1️⃣ 測試獲取不存在的作者...');
    try {
      await axios.get(`${BASE_URL}/authors/00000000-0000-0000-0000-000000000000`);
      console.log('❌ 應該返回錯誤');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ 正確返回 404 錯誤');
      } else {
        throw error;
      }
    }

    // 測試獲取不存在作者的統計
    console.log('\n2️⃣ 測試獲取不存在作者的統計...');
    try {
      await axios.get(`${BASE_URL}/authors/00000000-0000-0000-0000-000000000000/statistics`);
      console.log('❌ 應該返回錯誤');
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 401)) {
        console.log('✅ 正確返回錯誤狀態碼:', error.response.status);
      } else {
        throw error;
      }
    }

    console.log('\n🎯 錯誤處理測試通過！');

  } catch (error) {
    console.error('❌ 錯誤處理測試失敗:', error.response?.data || error.message);
  }
}

// 執行測試
async function runTests() {
  console.log('===== 作者管理 API 測試（無需認證部分）=====\n');
  
  // 檢查後端是否運行
  try {
    await axios.get(`${BASE_URL}/authors`);
    console.log('✅ 後端服務運行正常\n');
  } catch (error) {
    console.error('❌ 無法連接到後端服務');
    console.error('   錯誤詳情:', error.code || error.message);
    return;
  }

  await testAuthorStatistics();
  await testErrorHandling();
  
  console.log('\n===== 測試完成 =====');
  console.log('\n💡 提示：需要管理員權限的功能（創建、更新、刪除作者）需要認證後才能測試');
}

// 執行測試
runTests();