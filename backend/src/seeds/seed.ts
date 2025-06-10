import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedBrands } from './brand.seed';
import { seedProducts } from './product.seed';

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

// 執行填充腳本
const runSeeds = async () => {
  try {
    // 初始化資料庫連接
    await AppDataSource.initialize();
    console.log('資料庫連接已建立');
    
    // 執行各項填充腳本
    // 先填充品牌資料
    const brands = await seedBrands(AppDataSource);
    
    // 再填充產品資料
    await seedProducts(AppDataSource, brands);
    
    console.log('所有填充腳本已執行完畢');
    process.exit(0);
  } catch (error) {
    console.error('執行填充腳本時發生錯誤：', error);
    process.exit(1);
  }
};

runSeeds();
