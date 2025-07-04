const { Client } = require('pg');
require('dotenv').config();

async function updateImageUrls() {
  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'wellmade_user',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'wellmade',
  });

  try {
    await client.connect();
    console.log('資料庫連接成功');

    // 更新產品主圖 URL (還原為localhost)
    const productUpdateQuery = `
      UPDATE products 
      SET "imageUrl" = REPLACE("imageUrl", 'https://02f0-36-224-76-160.ngrok-free.app/uploads/', 'http://localhost:3003/uploads/')
      WHERE "imageUrl" LIKE '%02f0-36-224-76-160.ngrok-free.app/uploads/%'
    `;
    
    const productResult = await client.query(productUpdateQuery);
    console.log(`✅ 更新了 ${productResult.rowCount} 個產品的主圖 URL`);

    // 更新產品額外圖片 URLs (text[] 類型)
    const productImagesQuery = `
      UPDATE products 
      SET images = ARRAY(
        SELECT REPLACE(unnest(images), 'https://02f0-36-224-76-160.ngrok-free.app/uploads/', 'http://localhost:3003/uploads/')
      )
      WHERE array_to_string(images, ',') LIKE '%02f0-36-224-76-160.ngrok-free.app/uploads/%'
    `;
    
    const imagesResult = await client.query(productImagesQuery);
    console.log(`✅ 更新了 ${imagesResult.rowCount} 個產品的額外圖片 URLs`);

    // 更新產品關鍵特性圖片
    const keyFeaturesQuery = `
      UPDATE products 
      SET "keyFeatures" = REPLACE("keyFeatures"::text, 'https://02f0-36-224-76-160.ngrok-free.app/uploads/', 'http://localhost:3003/uploads/')::jsonb
      WHERE "keyFeatures"::text LIKE '%02f0-36-224-76-160.ngrok-free.app/uploads/%'
    `;
    
    const keyFeaturesResult = await client.query(keyFeaturesQuery);
    console.log(`✅ 更新了 ${keyFeaturesResult.rowCount} 個產品的關鍵特性圖片`);

    // 更新產品特性詳情圖片
    const featureDetailsQuery = `
      UPDATE products 
      SET "featureDetails" = REPLACE("featureDetails"::text, 'https://02f0-36-224-76-160.ngrok-free.app/uploads/', 'http://localhost:3003/uploads/')::jsonb
      WHERE "featureDetails"::text LIKE '%02f0-36-224-76-160.ngrok-free.app/uploads/%'
    `;
    
    const featureDetailsResult = await client.query(featureDetailsQuery);
    console.log(`✅ 更新了 ${featureDetailsResult.rowCount} 個產品的特性詳情圖片`);

    // 更新品牌 Logo URL
    const brandUpdateQuery = `
      UPDATE brands 
      SET "logoUrl" = REPLACE("logoUrl", 'https://02f0-36-224-76-160.ngrok-free.app/uploads/', 'http://localhost:3003/uploads/')
      WHERE "logoUrl" LIKE '%02f0-36-224-76-160.ngrok-free.app/uploads/%'
    `;
    
    const brandResult = await client.query(brandUpdateQuery);
    console.log(`✅ 更新了 ${brandResult.rowCount} 個品牌的 Logo URL`);

    console.log('🎉 所有圖片 URL 更新完成！');

  } catch (error) {
    console.error('更新圖片 URL 時發生錯誤:', error);
  } finally {
    await client.end();
  }
}

updateImageUrls();