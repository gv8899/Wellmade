import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { CartLogisticsController } from './controllers/cart-logistics.controller';

@Module({
  imports: [ProductsModule], // 導入 ProductsModule 以使用 ProductLogisticsService
  controllers: [CartLogisticsController],
  providers: [],
  exports: [],
})
export class CartsLogisticsModule {}