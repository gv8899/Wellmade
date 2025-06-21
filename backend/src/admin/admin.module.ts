import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UploadService } from './upload.service';
import { Product } from '../products/product.entity';
import { Brand } from '../brands/brand.entity';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Brand, User, Category])],
  controllers: [AdminController],
  providers: [AdminService, UploadService],
  exports: [AdminService],
})
export class AdminModule {}
