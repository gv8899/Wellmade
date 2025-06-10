import { DataSource } from 'typeorm';
import { Brand } from '../brands/brand.entity';

export const seedBrands = async (dataSource: DataSource) => {
  const brandRepository = dataSource.getRepository(Brand);
  
  // 先檢查資料庫是否已有品牌資料
  const count = await brandRepository.count();
  if (count > 0) {
    console.log('品牌資料已存在，跳過填充');
    return [];
  }
  
  // 預設的品牌資料
  const brandNames = ['IKEA', 'MUJI', 'Herman Miller', 'Dyson', 'Apple', 'Samsung', 'LG', 'KitchenAid', 'Bosch', 'Philips'];
  
  console.log('開始建立品牌資料...');
  
  const brandEntities: Brand[] = [];
  
  for (const name of brandNames) {
    const brand = new Brand();
    brand.name = name;
    brand.description = `${name} 是一個知名的品牌，提供高品質的產品和服務。`;
    brand.logoUrl = `https://picsum.photos/seed/${name}/200/200`; // 使用隨機圖片作為示例
    brand.isActive = true;
    
    const savedBrand = await brandRepository.save(brand);
    brandEntities.push(savedBrand);
  }
  
  console.log(`已建立 ${brandEntities.length} 個品牌資料`);
  return brandEntities;
};
