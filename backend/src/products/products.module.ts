import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  // providers: [], // We will add ProductService here later
  // controllers: [], // We will add ProductController here later
  exports: [TypeOrmModule] // Useful if ProductRepository needs to be injected elsewhere
})
export class ProductsModule {}
