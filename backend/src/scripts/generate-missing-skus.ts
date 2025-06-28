import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ProductVariantsService } from '../products/product-variants.service';
import { SkuGenerationService } from '../products/services/sku-generation.service';
import { Repository } from 'typeorm';
import { ProductVariant } from '../products/product-variant.entity';
import { Product } from '../products/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function generateMissingSkus() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const variantRepository = app.get<Repository<ProductVariant>>(
      getRepositoryToken(ProductVariant),
    );
    const productRepository = app.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    const skuGenerationService = app.get(SkuGenerationService);

    // 查找所有沒有 SKU 的變體
    const variantsWithoutSku = await variantRepository
      .createQueryBuilder('variant')
      .leftJoinAndSelect('variant.product', 'product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.categoryRelation', 'category')
      .where('variant.sku IS NULL OR variant.sku = :empty', { empty: '' })
      .getMany();

    console.log(`找到 ${variantsWithoutSku.length} 個沒有 SKU 的變體`);

    let successCount = 0;
    let errorCount = 0;

    for (const variant of variantsWithoutSku) {
      try {
        const generatedSku = await skuGenerationService.generateSku(
          variant.product,
          variant.specs,
        );

        await variantRepository.update(variant.id, { sku: generatedSku });

        console.log(`✓ 變體 ${variant.id} 生成 SKU: ${generatedSku}`);
        successCount++;
      } catch (error) {
        console.error(`✗ 變體 ${variant.id} 生成 SKU 失敗:`, error.message);
        errorCount++;
      }
    }

    console.log('\n生成完成！');
    console.log(`成功: ${successCount} 個`);
    console.log(`失敗: ${errorCount} 個`);
  } catch (error) {
    console.error('執行腳本時發生錯誤:', error);
  } finally {
    await app.close();
  }
}

// 執行腳本
generateMissingSkus()
  .then(() => {
    console.log('腳本執行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('腳本執行失敗:', error);
    process.exit(1);
  });
