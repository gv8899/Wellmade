import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Product } from './src/products/product.entity';
import { User } from './src/users/user.entity';
import { Brand } from './src/brands/brand.entity';

// 載入環境變數
config();

const configService = new ConfigService();

// 遷移 Data Source 實例
export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [Product, User, Brand],
  // 指定遷移存放位置
  migrations: ['dist/migrations/*.js'],
  // 讓 TypeORM 不自動同步數據庫結構 (我們將使用遷移來管理)
  synchronize: false,
});
