import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Brand } from '../brands/brand.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Brand])],
  // providers: [], // We will add ProductService here later
  // controllers: [], // We will add ProductController here later
  exports: [TypeOrmModule],
  controllers: [ProductsController],
  providers: [ProductsService] // Useful if ProductRepository needs to be injected elsewhere
})
export class ProductsModule {}
