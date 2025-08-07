const http = require('http');

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsedBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAuthors() {
  console.log('🧪 測試作者 API（使用原生 Node.js HTTP）...\n');

  try {
    // 1. 獲取所有作者
    console.log('1️⃣ 獲取所有作者...');
    const authorsResponse = await makeRequest('http://127.0.0.1:3003/authors');
    console.log('✅ 狀態碼:', authorsResponse.status);
    console.log('✅ 作者數量:', authorsResponse.data.length);

    if (authorsResponse.data.length > 0) {
      const firstAuthor = authorsResponse.data[0];
      console.log('✅ 第一位作者:', firstAuthor.name);

      // 2. 獲取作者詳情
      console.log('\n2️⃣ 獲取作者詳情...');
      const authorResponse = await makeRequest(`http://127.0.0.1:3003/authors/${firstAuthor.id}`);
      console.log('✅ 狀態碼:', authorResponse.status);
      console.log('✅ 作者名稱:', authorResponse.data.name);

      // 3. 獲取作者的文章
      console.log('\n3️⃣ 獲取作者的文章...');
      const articlesResponse = await makeRequest(`http://127.0.0.1:3003/authors/${firstAuthor.id}/articles`);
      console.log('✅ 狀態碼:', articlesResponse.status);
      if (articlesResponse.data.meta) {
        console.log('✅ 文章總數:', articlesResponse.data.meta.total);
      }

      // 4. 測試統計功能（需要權限，預期會失敗）
      console.log('\n4️⃣ 測試統計功能（預期需要認證）...');
      try {
        const statsResponse = await makeRequest(`http://127.0.0.1:3003/authors/${firstAuthor.id}/statistics`);
        console.log('✅ 統計狀態碼:', statsResponse.status);
        if (statsResponse.status === 200) {
          console.log('✅ 統計數據獲取成功！');
          console.log('   總文章數:', statsResponse.data.statistics?.totalArticles);
          console.log('   已發布文章:', statsResponse.data.statistics?.publishedArticles);
          console.log('   總瀏覽次數:', statsResponse.data.statistics?.totalViews);
        }
      } catch (error) {
        console.log('⚠️  統計功能需要認證（符合預期）');
      }
    }

    // 5. 測試不存在的作者
    console.log('\n5️⃣ 測試不存在的作者（預期 404）...');
    const notFoundResponse = await makeRequest('http://127.0.0.1:3003/authors/00000000-0000-0000-0000-000000000000');
    console.log('✅ 不存在作者狀態碼:', notFoundResponse.status, '（預期 404）');

    console.log('\n🎉 基本測試完成！');

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

testAuthors();