import { DataSource } from 'typeorm';
import { Product } from '../products/product.entity';
import { Brand } from '../brands/brand.entity';

// 資料庫連接配置
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Product, Brand],
  synchronize: false,
  ssl: process.env.NODE_ENV === 'production',
});

/**
 * 更新圖片 URL 從前端代理格式轉換為後端直接 URL 格式
 * 從: https://wellmade.select/api/uploads/filename.ext
 * 到: https://api.wellmade.select/uploads/filename.ext
 */
async function updateImageUrls() {
  try {
    await dataSource.initialize();
    console.log('資料庫連接成功');

    const productRepo = dataSource.getRepository(Product);
    const brandRepo = dataSource.getRepository(Brand);

    // 更新產品圖片 URL
    console.log('開始更新產品圖片 URL...');
    
    const products = await productRepo.find();
    let productUpdated = 0;
    
    for (const product of products) {
      let needUpdate = false;
      
      // 更新主圖 URL
      if (product.imageUrl && product.imageUrl.includes('wellmade.select/api/uploads/')) {
        product.imageUrl = product.imageUrl.replace(
          'https://wellmade.select/api/uploads/',
          'https://api.wellmade.select/uploads/'
        );
        needUpdate = true;
      }
      
      // 更新額外圖片 URLs
      if (product.images && Array.isArray(product.images)) {
        const updatedImages = product.images.map(url => {
          if (url && url.includes('wellmade.select/api/uploads/')) {
            return url.replace(
              'https://wellmade.select/api/uploads/',
              'https://api.wellmade.select/uploads/'
            );
          }
          return url;
        });
        
        if (JSON.stringify(updatedImages) !== JSON.stringify(product.images)) {
          product.images = updatedImages;
          needUpdate = true;
        }
      }
      
      // 更新關鍵特性中的圖片
      if (product.keyFeatures && Array.isArray(product.keyFeatures)) {
        const updatedKeyFeatures = product.keyFeatures.map(feature => {
          if (feature.image && feature.image.includes('wellmade.select/api/uploads/')) {
            return {
              ...feature,
              image: feature.image.replace(
                'https://wellmade.select/api/uploads/',
                'https://api.wellmade.select/uploads/'
              )
            };
          }
          return feature;
        });
        
        if (JSON.stringify(updatedKeyFeatures) !== JSON.stringify(product.keyFeatures)) {
          product.keyFeatures = updatedKeyFeatures;
          needUpdate = true;
        }
      }
      
      // 更新特性詳情中的圖片
      if (product.featureDetails && Array.isArray(product.featureDetails)) {
        const updatedFeatureDetails = product.featureDetails.map(detail => {
          if (detail.src && detail.src.includes('wellmade.select/api/uploads/')) {
            return {
              ...detail,
              src: detail.src.replace(
                'https://wellmade.select/api/uploads/',
                'https://api.wellmade.select/uploads/'
              )
            };
          }
          return detail;
        });
        
        if (JSON.stringify(updatedFeatureDetails) !== JSON.stringify(product.featureDetails)) {
          product.featureDetails = updatedFeatureDetails;
          needUpdate = true;
        }
      }
      
      if (needUpdate) {
        await productRepo.save(product);
        productUpdated++;
        console.log(`✅ 更新產品: ${product.name}`);
      }
    }
    
    console.log(`產品圖片 URL 更新完成，共更新 ${productUpdated} 個產品`);

    // 更新品牌 Logo URL
    console.log('開始更新品牌 Logo URL...');
    
    const brands = await brandRepo.find();
    let brandUpdated = 0;
    
    for (const brand of brands) {
      if (brand.logoUrl && brand.logoUrl.includes('wellmade.select/api/uploads/')) {
        brand.logoUrl = brand.logoUrl.replace(
          'https://wellmade.select/api/uploads/',
          'https://api.wellmade.select/uploads/'
        );
        
        await brandRepo.save(brand);
        brandUpdated++;
        console.log(`✅ 更新品牌: ${brand.name}`);
      }
    }
    
    console.log(`品牌 Logo URL 更新完成，共更新 ${brandUpdated} 個品牌`);
    console.log(`🎉 所有圖片 URL 更新完成！`);

  } catch (error) {
    console.error('更新圖片 URL 時發生錯誤:', error);
  } finally {
    await dataSource.destroy();
  }
}

// 執行更新
updateImageUrls();