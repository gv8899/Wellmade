import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { Brand } from '../brands/brand.entity';
import { Category } from '../categories/category.entity';
import { DeliveryMethodConfig } from './entities/delivery-method-config.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductVariantsController } from './product-variants.controller';
import { ProductVariantsService } from './product-variants.service';
import { SkuGenerationService } from './services/sku-generation.service';
import { ProductLogisticsService } from './services/product-logistics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, Brand, Category, DeliveryMethodConfig]),
  ],
  controllers: [ProductsController, ProductVariantsController],
  providers: [ProductsService, ProductVariantsService, SkuGenerationService, ProductLogisticsService],
  exports: [
    TypeOrmModule,
    ProductsService,
    ProductVariantsService,
    SkuGenerationService,
    ProductLogisticsService,
  ], // 導出服務以便其他模組可以使用
})
export class ProductsModule {}
