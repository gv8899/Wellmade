const axios = require('axios');

const BASE_URL = 'http://localhost:3003';

// 測試數據
const testAuthor = {
  name: '測試作者',
  bio: '這是一個測試作者的簡介',
  email: 'test@example.com',
  socialLinks: {
    website: 'https://example.com',
    instagram: '@testauthor'
  }
};

const updateData = {
  name: '更新後的作者',
  bio: '更新後的簡介',
  socialLinks: {
    website: 'https://updated-example.com',
    twitter: '@updatedauthor'
  }
};

// 用於存儲創建的作者ID
let createdAuthorId = null;

async function testAuthorManagement() {
  console.log('🧪 開始測試作者管理 API...\n');

  try {
    // 1. 測試創建作者
    console.log('1️⃣ 測試創建作者...');
    const createResponse = await axios.post(`${BASE_URL}/authors`, testAuthor);
    createdAuthorId = createResponse.data.id;
    console.log('✅ 創建作者成功:', createResponse.data.name);
    console.log('   作者ID:', createdAuthorId);

    // 2. 測試獲取所有作者
    console.log('\n2️⃣ 測試獲取所有作者...');
    const getAllResponse = await axios.get(`${BASE_URL}/authors`);
    console.log('✅ 獲取作者列表成功，共', getAllResponse.data.length, '位作者');

    // 3. 測試獲取單個作者
    console.log('\n3️⃣ 測試獲取單個作者...');
    const getOneResponse = await axios.get(`${BASE_URL}/authors/${createdAuthorId}`);
    console.log('✅ 獲取作者詳情成功:', getOneResponse.data.name);

    // 4. 測試更新作者
    console.log('\n4️⃣ 測試更新作者...');
    const updateResponse = await axios.patch(`${BASE_URL}/authors/${createdAuthorId}`, updateData);
    console.log('✅ 更新作者成功:', updateResponse.data.name);

    // 5. 測試獲取作者統計
    console.log('\n5️⃣ 測試獲取作者統計...');
    const statsResponse = await axios.get(`${BASE_URL}/authors/${createdAuthorId}/statistics`);
    console.log('✅ 獲取作者統計成功');
    console.log('   總文章數:', statsResponse.data.statistics.totalArticles);
    console.log('   已發布文章:', statsResponse.data.statistics.publishedArticles);
    console.log('   總瀏覽次數:', statsResponse.data.statistics.totalViews);

    // 6. 測試獲取作者的文章
    console.log('\n6️⃣ 測試獲取作者的文章...');
    const articlesResponse = await axios.get(`${BASE_URL}/authors/${createdAuthorId}/articles`);
    console.log('✅ 獲取作者文章成功，共', articlesResponse.data.meta.total, '篇文章');

    // 7. 測試刪除作者（應該成功，因為沒有關聯文章）
    console.log('\n7️⃣ 測試刪除作者...');
    await axios.delete(`${BASE_URL}/authors/${createdAuthorId}`);
    console.log('✅ 刪除作者成功');

    // 8. 確認作者已被刪除
    console.log('\n8️⃣ 確認作者已被刪除...');
    try {
      await axios.get(`${BASE_URL}/authors/${createdAuthorId}`);
      console.log('❌ 錯誤：作者應該已被刪除');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ 確認作者已被刪除');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 所有測試通過！');

  } catch (error) {
    console.error('❌ 測試失敗:', error.response?.data || error.message);
    
    // 清理：如果測試失敗且作者已創建，嘗試刪除
    if (createdAuthorId) {
      try {
        await axios.delete(`${BASE_URL}/authors/${createdAuthorId}`);
        console.log('🧹 清理：已刪除測試作者');
      } catch (cleanupError) {
        console.log('⚠️  清理失敗：無法刪除測試作者', createdAuthorId);
      }
    }
  }
}

// 錯誤處理測試
async function testErrorHandling() {
  console.log('\n🔧 測試錯誤處理...\n');

  try {
    // 測試創建無效作者
    console.log('1️⃣ 測試創建無效作者（缺少姓名）...');
    try {
      await axios.post(`${BASE_URL}/authors`, { bio: '沒有姓名的作者' });
      console.log('❌ 應該返回錯誤');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ 正確返回 400 錯誤');
      } else {
        throw error;
      }
    }

    // 測試獲取不存在的作者
    console.log('\n2️⃣ 測試獲取不存在的作者...');
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

    // 測試刪除不存在的作者
    console.log('\n3️⃣ 測試刪除不存在的作者...');
    try {
      await axios.delete(`${BASE_URL}/authors/00000000-0000-0000-0000-000000000000`);
      console.log('❌ 應該返回錯誤');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ 正確返回 404 錯誤');
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
async function runAllTests() {
  console.log('===== 作者管理 API 測試 =====\n');
  
  // 檢查後端是否運行
  try {
    const response = await axios.get(`${BASE_URL}/authors`);
    console.log('✅ 後端服務運行正常\n');
  } catch (error) {
    console.error('❌ 無法連接到後端服務，請確保後端在 port 3003 運行');
    console.error('   錯誤詳情:', error.code || error.message);
    console.error('   請執行: cd backend && npm run start:dev');
    return;
  }

  await testAuthorManagement();
  await testErrorHandling();
  
  console.log('\n===== 測試完成 =====');
}

// 執行測試
runAllTests();