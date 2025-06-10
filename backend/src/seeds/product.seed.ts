import { DataSource } from 'typeorm';
import { Product } from '../products/product.entity';
import { Brand } from '../brands/brand.entity';
import { v4 as uuidv4 } from 'uuid';

export const seedProducts = async (dataSource: DataSource, brands: any[] = []) => {
  const productRepository = dataSource.getRepository(Product);
  const brandRepository = dataSource.getRepository(Brand);
  
  // 先檢查資料庫是否已有資料
  const productCount = await productRepository.count();
  
  if (productCount > 0) {
    console.log('產品資料已存在，跳過填充');
    return;
  }
  
  // 確保有品牌資料
  let brandEntities = brands;
  if (!brandEntities || brandEntities.length === 0) {
    brandEntities = await brandRepository.find();
    if (brandEntities.length === 0) {
      console.log('無品牌資料，無法建立產品關聯');
      return;
    }
  }
  
  // 預設的產品分類
  const categories = ['廚房用品', '浴室用品', '臥室用品', '客廳用品', '辦公用品'];
  
  // 預設的產品分類
  
  // 建立測試資料
  const products: Partial<Product>[] = [];
  
  // 生成15個測試產品
  for (let i = 1; i <= 15; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const randomBrand = brandEntities[Math.floor(Math.random() * brandEntities.length)];
    const price = Math.floor(Math.random() * 1000) + 100; // 100-1100 之間的價格
    const stock = Math.floor(Math.random() * 100) + 10; // 10-110 之間的庫存

    const product: Partial<Product> = {
      name: `測試產品 ${i}`,
      description: `這是一個測試產品的詳細描述，屬於${category}類別，提供多種功能和特性。`,
      price: price,
      stock: stock,
      category: category,
      brandId: randomBrand.id,
      imageUrl: `https://picsum.photos/seed/${i}/500/500`, // 使用隨機圖片
      images: [
        `https://picsum.photos/seed/${i}a/500/500`,
        `https://picsum.photos/seed/${i}b/500/500`,
        `https://picsum.photos/seed/${i}c/500/500`
      ],
      isActive: true,
    };
    
    products.push(product);
  }
  
  // 特定產品範例 (可以添加更多特色產品)
  const specialProducts: Partial<Product>[] = [
    {
      name: '多功能不銹鋼料理刀',
      description: '高級不銹鋼材質，鋒利耐用，適合各種食材切割，符合人體工學設計的手柄，使用舒適。',
      price: 1299,
      stock: 50,
      category: '廚房用品',
      brandId: brandEntities.find(b => b.name === 'KitchenAid')?.id,
      imageUrl: 'https://picsum.photos/seed/knife/500/500',
      images: [
        'https://picsum.photos/seed/knife1/500/500',
        'https://picsum.photos/seed/knife2/500/500',
        'https://picsum.photos/seed/knife3/500/500'
      ],
      isActive: true,
    },
    {
      name: '北歐風簡約書架',
      description: '採用環保木材製成，極簡設計風格，可調節層板高度，適合各種空間擺放。',
      price: 3499,
      stock: 30,
      category: '客廳用品',
      brandId: brandEntities.find(b => b.name === 'IKEA')?.id,
      imageUrl: 'https://picsum.photos/seed/shelf/500/500',
      images: [
        'https://picsum.photos/seed/shelf1/500/500',
        'https://picsum.photos/seed/shelf2/500/500',
        'https://picsum.photos/seed/shelf3/500/500'
      ],
      isActive: true,
    },
    {
      name: '智能溫控馬克杯',
      description: '內建智能溫控系統，可保持飲品在最佳溫度，杯身採用醫療級矽膠隔熱層，安全舒適。',
      price: 890,
      stock: 100,
      category: '廚房用品',
      brandId: brandEntities.find(b => b.name === 'Philips')?.id,
      imageUrl: 'https://picsum.photos/seed/mug/500/500',
      images: [
        'https://picsum.photos/seed/mug1/500/500',
        'https://picsum.photos/seed/mug2/500/500',
        'https://picsum.photos/seed/mug3/500/500'
      ],
      isActive: true,
    }
  ];
  
  // 合併所有產品
  const allProducts = [...products, ...specialProducts];
  
  try {
    // 插入產品資料
    await productRepository.save(allProducts);
    console.log(`成功填充 ${allProducts.length} 個產品資料`);
  } catch (error) {
    console.error('填充產品資料時發生錯誤：', error);
  }
};
