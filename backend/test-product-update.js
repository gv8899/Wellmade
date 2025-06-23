const fetch = require('node-fetch');

async function testProductUpdate() {
  const BASE_URL = 'http://localhost:3003';
  
  try {
    console.log('🔍 測試產品更新功能...\n');

    // 1. 獲取所有產品，找到一個測試產品
    console.log('📦 獲取產品列表...');
    const productsResponse = await fetch(`${BASE_URL}/products`);
    const productsData = await productsResponse.json();
    
    if (!productsData.items || productsData.items.length === 0) {
      console.log('❌ 沒有找到任何產品');
      return;
    }
    
    // 使用第一個產品作為測試
    const testProduct = productsData.items[0];
    if (!testProduct) {
      console.log('❌ 沒有找到任何產品');
      return;
    }
    
    console.log('✅ 找到測試產品:', {
      id: testProduct.id,
      name: testProduct.name,
      categoryId: testProduct.categoryId,
      category: testProduct.category
    });

    // 2. 獲取所有分類
    console.log('\n🏷️  獲取分類列表...');
    const categoriesResponse = await fetch(`${BASE_URL}/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log('分類資料結構:', typeof categoriesData, Array.isArray(categoriesData));
    
    // 處理不同的響應結構
    const categories = categoriesData.categories || [];
    console.log('可用分類:', categories.map(c => ({ name: c.name, slug: c.slug })));
    
    // 使用咖啡分類來測試（當前產品是居家用品，我們改為咖啡）
    const coffeeCategory = categories.find(c => c.slug === 'coffee');
    if (!coffeeCategory) {
      console.log('❌ 沒有找到 coffee 分類');
      return;
    }
    
    console.log('✅ 找到目標分類:', {
      id: coffeeCategory.id,
      name: coffeeCategory.name,
      slug: coffeeCategory.slug
    });

    // 3. 準備更新請求
    const updateData = {
      categoryId: coffeeCategory.id
    };
    
    console.log('\n🔧 準備更新產品...');
    console.log('更新數據:', updateData);
    
    // 4. 發送更新請求 (需要先登入獲取 token，這裡假設我們有 admin 權限)
    // 由於沒有實際的認證 token，我們嘗試直接發送請求看看會發生什麼
    const updateResponse = await fetch(`${BASE_URL}/products/${testProduct.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // 這裡應該要有 Authorization header，但為了測試我們先看看錯誤
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('\n📤 更新請求發送完成');
    console.log('狀態碼:', updateResponse.status);
    console.log('狀態文字:', updateResponse.statusText);
    
    const responseText = await updateResponse.text();
    console.log('響應內容:', responseText);
    
    if (updateResponse.ok) {
      const updatedProduct = JSON.parse(responseText);
      console.log('\n✅ 產品更新成功!');
      console.log('更新後狀態:', {
        id: updatedProduct.id,
        name: updatedProduct.name,
        categoryId: updatedProduct.categoryId,
        category: updatedProduct.category
      });
    } else {
      console.log('\n❌ 產品更新失敗');
      if (updateResponse.status === 401) {
        console.log('原因: 需要認證權限');
      } else if (updateResponse.status === 403) {
        console.log('原因: 需要管理員權限');
      }
    }
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error.message);
  }
}

testProductUpdate().catch(console.error);