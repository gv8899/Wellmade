import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ProductsService } from '../products/products.service';
import { SkuGenerationService } from '../products/services/sku-generation.service';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function generateMissingMasterSkus() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const productRepository = app.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    const skuGenerationService = app.get(SkuGenerationService);

    // 查找所有沒有主 SKU 且沒有變體的產品
    const productsWithoutSku = await productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.categoryRelation', 'category')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.masterSku IS NULL')
      .getMany();

    // 過濾出沒有變體的產品（簡單產品）
    const simpleProducts = productsWithoutSku.filter(
      (product) => !product.variants || product.variants.length === 0,
    );

    console.log(`找到 ${simpleProducts.length} 個需要生成主 SKU 的簡單產品`);

    let successCount = 0;
    let errorCount = 0;

    for (const product of simpleProducts) {
      try {
        const generatedSku = await skuGenerationService.generateSku(
          product,
          {}, // 沒有規格
        );

        await productRepository.update(product.id, { masterSku: generatedSku });

        console.log(
          `✓ 產品 "${product.name}" (${product.id}) 生成主 SKU: ${generatedSku}`,
        );
        successCount++;
      } catch (error) {
        console.error(
          `✗ 產品 "${product.name}" (${product.id}) 生成主 SKU 失敗:`,
          error.message,
        );
        errorCount++;
      }
    }

    console.log('\n生成完成！');
    console.log(`成功: ${successCount} 個`);
    console.log(`失敗: ${errorCount} 個`);

    // 顯示有變體但沒有 SKU 的產品資訊
    const complexProducts = productsWithoutSku.filter(
      (product) => product.variants && product.variants.length > 0,
    );

    if (complexProducts.length > 0) {
      console.log(
        `\n注意：有 ${complexProducts.length} 個產品有變體，請檢查變體的 SKU 設定`,
      );
      complexProducts.forEach((product) => {
        const variantsWithoutSku = product.variants.filter((v) => !v.sku);
        if (variantsWithoutSku.length > 0) {
          console.log(
            `- "${product.name}": ${variantsWithoutSku.length}/${product.variants.length} 個變體缺少 SKU`,
          );
        }
      });
    }
  } catch (error) {
    console.error('執行腳本時發生錯誤:', error);
  } finally {
    await app.close();
  }
}

// 執行腳本
generateMissingMasterSkus()
  .then(() => {
    console.log('腳本執行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('腳本執行失敗:', error);
    process.exit(1);
  });
