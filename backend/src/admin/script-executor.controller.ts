import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { Brand } from '../brands/brand.entity';

@Controller('admin/scripts')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(UserRole.ADMIN)
export class ScriptExecutorController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Post('update-image-urls')
  async updateImageUrls() {
    try {
      console.log('開始執行圖片 URL 更新...');

      const productRepo = this.dataSource.getRepository(Product);
      const brandRepo = this.dataSource.getRepository(Brand);

      // 更新產品圖片 URL
      console.log('開始更新產品圖片 URL...');
      
      const products = await productRepo.find();
      let productUpdated = 0;
      
      for (const product of products) {
        let needUpdate = false;
        
        // 更新主圖 URL
        if (product.imageUrl && product.imageUrl.includes('wellmade.select/api/uploads/')) {
          product.imageUrl = product.imageUrl.replace(
            'https://wellmade.select/api/uploads/',
            'https://api.wellmade.select/uploads/'
          );
          needUpdate = true;
        }
        
        // 更新額外圖片 URLs
        if (product.images && Array.isArray(product.images)) {
          const updatedImages = product.images.map(url => {
            if (url && url.includes('wellmade.select/api/uploads/')) {
              return url.replace(
                'https://wellmade.select/api/uploads/',
                'https://api.wellmade.select/uploads/'
              );
            }
            return url;
          });
          
          if (JSON.stringify(updatedImages) !== JSON.stringify(product.images)) {
            product.images = updatedImages;
            needUpdate = true;
          }
        }
        
        // 更新關鍵特性中的圖片
        if (product.keyFeatures && Array.isArray(product.keyFeatures)) {
          const updatedKeyFeatures = product.keyFeatures.map(feature => {
            if (feature.image && feature.image.includes('wellmade.select/api/uploads/')) {
              return {
                ...feature,
                image: feature.image.replace(
                  'https://wellmade.select/api/uploads/',
                  'https://api.wellmade.select/uploads/'
                )
              };
            }
            return feature;
          });
          
          if (JSON.stringify(updatedKeyFeatures) !== JSON.stringify(product.keyFeatures)) {
            product.keyFeatures = updatedKeyFeatures;
            needUpdate = true;
          }
        }
        
        // 更新特性詳情中的圖片
        if (product.featureDetails && Array.isArray(product.featureDetails)) {
          const updatedFeatureDetails = product.featureDetails.map(detail => {
            if (detail.src && detail.src.includes('wellmade.select/api/uploads/')) {
              return {
                ...detail,
                src: detail.src.replace(
                  'https://wellmade.select/api/uploads/',
                  'https://api.wellmade.select/uploads/'
                )
              };
            }
            return detail;
          });
          
          if (JSON.stringify(updatedFeatureDetails) !== JSON.stringify(product.featureDetails)) {
            product.featureDetails = updatedFeatureDetails;
            needUpdate = true;
          }
        }
        
        if (needUpdate) {
          await productRepo.save(product);
          productUpdated++;
          console.log(`✅ 更新產品: ${product.name}`);
        }
      }
      
      console.log(`產品圖片 URL 更新完成，共更新 ${productUpdated} 個產品`);

      // 更新品牌 Logo URL
      console.log('開始更新品牌 Logo URL...');
      
      const brands = await brandRepo.find();
      let brandUpdated = 0;
      
      for (const brand of brands) {
        if (brand.logoUrl && brand.logoUrl.includes('wellmade.select/api/uploads/')) {
          brand.logoUrl = brand.logoUrl.replace(
            'https://wellmade.select/api/uploads/',
            'https://api.wellmade.select/uploads/'
          );
          
          await brandRepo.save(brand);
          brandUpdated++;
          console.log(`✅ 更新品牌: ${brand.name}`);
        }
      }
      
      console.log(`品牌 Logo URL 更新完成，共更新 ${brandUpdated} 個品牌`);

      return {
        success: true,
        message: '圖片 URL 更新完成',
        summary: {
          productsUpdated: productUpdated,
          brandsUpdated: brandUpdated,
          totalUpdated: productUpdated + brandUpdated
        }
      };

    } catch (error) {
      console.error('更新圖片 URL 時發生錯誤:', error);
      throw error;
    }
  }
}