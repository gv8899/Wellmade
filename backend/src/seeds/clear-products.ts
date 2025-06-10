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

// 清空產品表
const clearProducts = async () => {
  try {
    // 初始化資料庫連接
    await AppDataSource.initialize();
    console.log('資料庫連接已建立');
    
    // 清空產品表
    const productRepository = AppDataSource.getRepository(Product);
    await productRepository.clear();
    console.log('產品表已清空');
    
    process.exit(0);
  } catch (error) {
    console.error('清空產品表時發生錯誤：', error);
    process.exit(1);
  }
};

clearProducts();
