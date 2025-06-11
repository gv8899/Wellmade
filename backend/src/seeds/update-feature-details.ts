import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Product } from '../products/product.entity';

// 載入環境變數
config();

// 建立資料源連接
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
});

// 更新產品的 featureDetails
const updateFeatureDetails = async () => {
  try {
    // 初始化資料庫連接
    await AppDataSource.initialize();
    console.log('資料庫連接已建立');
    
    const productRepository = AppDataSource.getRepository(Product);
    
    // 獲取所有產品
    const products = await productRepository.find();
    
    if (products.length === 0) {
      console.log('沒有找到產品資料');
      return;
    }
    
    console.log(`找到 ${products.length} 個產品，開始更新 featureDetails...`);
    
    // 為每個產品更新 featureDetails
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // 跳過已經有 featureDetails 的產品
      if (product.featureDetails && product.featureDetails.length > 0) {
        console.log(`產品 ${product.id} 已有 featureDetails，跳過`);
        continue;
      }
      
      // 為產品生成 featureDetails
      product.featureDetails = [
        {
          type: "image",
          src: `https://picsum.photos/seed/product-${product.id}-detail1/600/400`,
          title: `${product.name} 特色功能 1`,
          description: `這是 ${product.name} 的第一個詳細特性描述，詳細說明了產品的設計理念和使用方式。`,
          direction: i % 2 === 0 ? "left" : "right"
        },
        {
          type: "image",
          src: `https://picsum.photos/seed/product-${product.id}-detail2/600/400`,
          title: `${product.name} 特色功能 2`,
          description: `這是 ${product.name} 的第二個詳細特性描述，展示了產品的獨特優勢和創新之處。`,
          direction: i % 2 === 0 ? "right" : "left"
        },
        {
          type: "image",
          src: `https://picsum.photos/seed/product-${product.id}-detail3/600/400`,
          title: `${product.name} 特色功能 3`,
          description: `這是 ${product.name} 的第三個詳細特性描述，強調了產品的實用性和耐用性。`,
          direction: i % 2 === 0 ? "left" : "right"
        }
      ];
      
      // 儲存更新後的產品
      await productRepository.save(product);
      console.log(`已更新產品 ${product.id} 的 featureDetails`);
    }
    
    console.log('所有產品的 featureDetails 更新完成');
  } catch (error) {
    console.error('更新 featureDetails 時出錯:', error);
  } finally {
    // 關閉資料庫連接
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('資料庫連接已關閉');
    }
  }
};

// 執行更新
updateFeatureDetails();
