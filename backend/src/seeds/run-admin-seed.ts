import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Brand } from '../brands/brand.entity';
import { Product } from '../products/product.entity';
import { ProductVariant } from '../products/product-variant.entity';
import { Cart } from '../carts/entities/cart.entity';
import { CartItem } from '../carts/entities/cart-item.entity';
import { Category } from '../categories/category.entity';
import { seedAdminUser } from './admin-user.seed';

// 使用環境變數或預設值
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'wellmade_user',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'wellmade',
  entities: [User, Brand, Product, ProductVariant, Cart, CartItem, Category],
  synchronize: false, // 不要自動同步，使用遷移
});

async function main() {
  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Database connected successfully');

    console.log('Creating admin user...');
    await seedAdminUser(dataSource);
    console.log('Admin user seed completed');

    await dataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error running admin seed:', error);
    process.exit(1);
  }
}

main();