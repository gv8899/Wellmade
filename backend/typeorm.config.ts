import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Product } from './src/products/product.entity';
import { ProductVariant } from './src/products/product-variant.entity';
import { User } from './src/users/user.entity';
import { Brand } from './src/brands/brand.entity';
import { Category } from './src/categories/category.entity';
import { Cart } from './src/carts/entities/cart.entity';
import { CartItem } from './src/carts/entities/cart-item.entity';
import { Order } from './src/orders/entities/order.entity';
import { OrderItem } from './src/orders/entities/order-item.entity';
import { PaymentRecord } from './src/orders/entities/payment-record.entity';
import { FrontendLog } from './src/logs/frontend-log.entity';
import { Banner } from './src/banners/banner.entity';
import { Article } from './src/articles/entities/article.entity';
import { ArticleCategory } from './src/articles/entities/article-category.entity';
import { Author } from './src/articles/entities/author.entity';

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
  entities: [Product, ProductVariant, User, Brand, Category, Cart, CartItem, Order, OrderItem, PaymentRecord, FrontendLog, Banner, Article, ArticleCategory, Author],
  // 指定遷移存放位置
  migrations: ['migrations/*.ts'],
  // 讓 TypeORM 不自動同步數據庫結構 (我們將使用遷移來管理)
  synchronize: false,
});
