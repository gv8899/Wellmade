import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    ProductsModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
