/**
 * 產品物流配置遷移腳本
 * 
 * 此腳本用於將現有產品遷移到新的物流支援系統：
 * 1. 為所有現有產品設定預設的物流配置
 * 2. 根據產品特性智能分配配送方式支援
 * 3. 處理產品變體的物流配置
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ProductsService } from '../products/products.service';
import { ProductLogisticsService } from '../products/services/product-logistics.service';
import { Product } from '../products/product.entity';
import { ProductVariant } from '../products/product-variant.entity';
import { 
  DeliveryMethod, 
  ProductLogisticsConfig 
} from '../products/interfaces/product-logistics.interface';

async function migrateProductLogistics() {
  console.log('🚀 開始產品物流配置遷移...');
  
  // 建立 NestJS 應用實例
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const productsService = app.get(ProductsService);
    const logisticsService = app.get(ProductLogisticsService);
    
    // 獲取所有產品
    console.log('📦 載入所有產品...');
    const allProducts = await productsService.findAllForMigration();
    console.log(`找到 ${allProducts.length} 個產品需要遷移`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of allProducts) {
      try {
        console.log(`\n處理產品: ${product.name} (ID: ${product.id})`);
        
        // 檢查是否已有物流配置
        if (product.logisticsConfig && 
            product.logisticsConfig.supportedDeliveryMethods && 
            product.logisticsConfig.supportedDeliveryMethods.length > 0) {
          console.log('  ⏭️  已有物流配置，跳過');
          skippedCount++;
          continue;
        }

        // 生成物流配置
        const logisticsConfig = generateLogisticsConfigForProduct(product);
        
        // 更新產品
        await logisticsService.updateProductLogisticsConfig(product.id, logisticsConfig);
        
        console.log(`  ✅ 已更新物流配置 - 支援 ${logisticsConfig.supportedDeliveryMethods.length} 種配送方式`);
        migratedCount++;

        // 處理產品變體
        if (product.variants && product.variants.length > 0) {
          console.log(`  🔄 處理 ${product.variants.length} 個變體...`);
          
          for (const variant of product.variants) {
            try {
              // 檢查變體是否已有物流配置
              if (variant.logisticsConfig && 
                  variant.logisticsConfig.supportedDeliveryMethods &&
                  variant.logisticsConfig.supportedDeliveryMethods.length > 0) {
                console.log(`    ⏭️  變體 ${variant.id} 已有物流配置，跳過`);
                continue;
              }

              // 為變體生成配置（可能與主產品不同）
              const variantLogisticsConfig = generateLogisticsConfigForVariant(variant, product);
              
              await logisticsService.updateVariantLogisticsConfig(variant.id, variantLogisticsConfig);
              console.log(`    ✅ 已更新變體 ${variant.id} 物流配置`);
              
            } catch (variantError) {
              console.error(`    ❌ 變體 ${variant.id} 更新失敗:`, variantError);
            }
          }
        }

      } catch (error) {
        console.error(`❌ 產品 ${product.id} 遷移失敗:`, error);
        errorCount++;
      }
    }

    // 遷移摘要
    console.log('\n📊 遷移摘要:');
    console.log(`✅ 成功遷移: ${migratedCount} 個產品`);
    console.log(`⏭️  跳過: ${skippedCount} 個產品`);
    console.log(`❌ 失敗: ${errorCount} 個產品`);
    console.log(`📦 總計: ${allProducts.length} 個產品`);

  } catch (error) {
    console.error('❌ 遷移過程中發生錯誤:', error);
  } finally {
    await app.close();
  }
}

/**
 * 根據產品特性生成物流配置
 */
function generateLogisticsConfigForProduct(product: Product): ProductLogisticsConfig {
  const config: ProductLogisticsConfig = {
    supportedDeliveryMethods: [],
    physicalAttributes: {},
    deliveryRestrictions: {}
  };

  // 基於產品名稱和描述判斷特性
  const productName = product.name.toLowerCase();
  const productDesc = product.description?.toLowerCase() || '';
  const productText = `${productName} ${productDesc}`;

  // 判斷是否為大型商品
  const isOversized = /大型|大件|家具|家電|冰箱|洗衣機|電視|沙發/.test(productText);
  
  // 判斷是否為易碎品
  const isFragile = /玻璃|陶瓷|易碎|精品|藝術品|花瓶/.test(productText);
  
  // 判斷是否為高價值商品（基於價格）
  const isHighValue = product.price && product.price > 10000;
  
  // 判斷是否需要冷藏
  const requiresRefrigeration = /冷藏|冰品|生鮮|冷凍/.test(productText);

  // 設定物理屬性
  config.physicalAttributes = {
    isOversized,
    isFragile,
    isHighValue,
    requiresRefrigeration,
    // 預設重量和尺寸（實際使用時應由商家設定）
    weight: isOversized ? 10 : 1,
    dimensions: isOversized 
      ? { length: 80, width: 60, height: 40 }
      : { length: 30, width: 20, height: 10 }
  };

  // 根據特性決定支援的配送方式
  const supportedMethods: DeliveryMethod[] = [];

  // 宅配到府 - 大部分商品都支援
  supportedMethods.push(DeliveryMethod.HOME_DELIVERY);

  // 超商取貨的條件：不能是大型、易碎、高價值或冷藏商品
  if (!isOversized && !isFragile && !isHighValue && !requiresRefrigeration) {
    supportedMethods.push(DeliveryMethod.SEVEN_ELEVEN);
    supportedMethods.push(DeliveryMethod.FAMILY_MART);
    supportedMethods.push(DeliveryMethod.HI_LIFE);
    supportedMethods.push(DeliveryMethod.OK_MART);
  } else {
    // 設定限制原因
    const restrictions: any = {};
    
    if (isOversized) {
      [DeliveryMethod.SEVEN_ELEVEN, DeliveryMethod.FAMILY_MART, DeliveryMethod.HI_LIFE, DeliveryMethod.OK_MART]
        .forEach(method => {
          restrictions[method] = { restricted: true, reason: '商品尺寸過大，不適合超商取貨' };
        });
    }
    
    if (isFragile) {
      [DeliveryMethod.SEVEN_ELEVEN, DeliveryMethod.FAMILY_MART, DeliveryMethod.HI_LIFE, DeliveryMethod.OK_MART]
        .forEach(method => {
          restrictions[method] = { restricted: true, reason: '易碎商品，不適合超商取貨' };
        });
    }
    
    if (isHighValue) {
      [DeliveryMethod.SEVEN_ELEVEN, DeliveryMethod.FAMILY_MART, DeliveryMethod.HI_LIFE, DeliveryMethod.OK_MART]
        .forEach(method => {
          restrictions[method] = { restricted: true, reason: '高價值商品，需要較安全的配送方式' };
        });
    }
    
    if (requiresRefrigeration) {
      [DeliveryMethod.SEVEN_ELEVEN, DeliveryMethod.FAMILY_MART, DeliveryMethod.HI_LIFE, DeliveryMethod.OK_MART]
        .forEach(method => {
          restrictions[method] = { restricted: true, reason: '冷藏商品，超商無法提供冷鏈服務' };
        });
    }

    config.deliveryRestrictions = restrictions;
  }

  config.supportedDeliveryMethods = supportedMethods;

  return config;
}

/**
 * 根據變體特性生成物流配置
 */
function generateLogisticsConfigForVariant(
  variant: ProductVariant, 
  product: Product
): ProductLogisticsConfig {
  // 變體繼承產品的基本配置
  const baseConfig = generateLogisticsConfigForProduct(product);
  
  // 變體可能有不同的重量和尺寸
  if (baseConfig.physicalAttributes) {
    // 根據變體規格調整物理屬性
    const specs = variant.specs || {};
    
    // 如果有尺寸相關的規格，調整重量和尺寸
    if (specs['尺寸'] || specs['size'] || specs['Size']) {
      const sizeValue = specs['尺寸'] || specs['size'] || specs['Size'];
      
      if (typeof sizeValue === 'string') {
        const sizeStr = sizeValue.toLowerCase();
        
        if (sizeStr.includes('xl') || sizeStr.includes('大') || sizeStr.includes('l')) {
          baseConfig.physicalAttributes.weight = (baseConfig.physicalAttributes.weight || 1) * 1.2;
        } else if (sizeStr.includes('xs') || sizeStr.includes('小') || sizeStr.includes('s')) {
          baseConfig.physicalAttributes.weight = (baseConfig.physicalAttributes.weight || 1) * 0.8;
        }
      }
    }
  }

  return baseConfig;
}

// 擴展 ProductsService 以支援遷移所需的方法
declare module '../products/products.service' {
  interface ProductsService {
    findAllForMigration(): Promise<Product[]>;
  }
}

// 執行遷移
if (require.main === module) {
  migrateProductLogistics()
    .then(() => {
      console.log('🎉 物流配置遷移完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 遷移失敗:', error);
      process.exit(1);
    });
}

export { migrateProductLogistics };