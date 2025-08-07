import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UploadService } from './upload.service';
import { ScriptExecutorController } from './script-executor.controller';
import { DatabaseAnalysisController } from './database-analysis.controller';
import { DatabaseAnalysisService } from './database-analysis.service';
import { Product } from '../products/product.entity';
import { Brand } from '../brands/brand.entity';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Brand, User, Category]),
    ProductsModule, // 導入 ProductsModule 以使用 ProductVariantsService
  ],
  controllers: [
    AdminController,
    ScriptExecutorController,
    DatabaseAnalysisController,
  ],
  providers: [AdminService, UploadService, DatabaseAnalysisService],
  exports: [AdminService],
})
export class AdminModule {}
