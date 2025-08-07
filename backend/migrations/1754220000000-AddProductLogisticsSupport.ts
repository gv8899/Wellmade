import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductLogisticsSupport1754220000000 implements MigrationInterface {
  name = 'AddProductLogisticsSupport1754220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 為 products 表添加物流支援相關欄位
    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD COLUMN "logisticsConfig" jsonb DEFAULT '{
        "supportedDeliveryMethods": ["home_delivery", "seven_eleven", "family_mart", "hi_life", "ok_mart"],
        "physicalAttributes": {}
      }'::jsonb
    `);

    // 為 product_variants 表添加物流支援相關欄位
    await queryRunner.query(`
      ALTER TABLE "product_variants" 
      ADD COLUMN "logisticsConfig" jsonb DEFAULT '{
        "supportedDeliveryMethods": ["home_delivery", "seven_eleven", "family_mart", "hi_life", "ok_mart"],
        "physicalAttributes": {}
      }'::jsonb
    `);

    // 添加索引以提升查詢效能
    await queryRunner.query(`
      CREATE INDEX "IDX_products_logistics_delivery_methods" 
      ON "products" USING GIN (("logisticsConfig"->'supportedDeliveryMethods'))
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_product_variants_logistics_delivery_methods" 
      ON "product_variants" USING GIN (("logisticsConfig"->'supportedDeliveryMethods'))
    `);

    // 創建配送方式配置表（系統層級設定）
    await queryRunner.query(`
      CREATE TABLE "delivery_method_configs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "method" varchar NOT NULL UNIQUE,
        "name" varchar NOT NULL,
        "description" text,
        "baseFee" decimal(10,2) NOT NULL DEFAULT 0,
        "estimatedDays" integer NOT NULL DEFAULT 1,
        "isActive" boolean NOT NULL DEFAULT true,
        "globalLimits" jsonb DEFAULT '{}'::jsonb,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // 插入預設配送方式配置
    await queryRunner.query(`
      INSERT INTO "delivery_method_configs" ("method", "name", "description", "baseFee", "estimatedDays", "globalLimits") VALUES
      ('home_delivery', '宅配到府', '專人配送到指定地址，安全便利', 100, 3, '{
        "maxWeight": 30,
        "maxDimensions": {"length": 100, "width": 100, "height": 100},
        "allowFragile": true,
        "allowHighValue": true,
        "allowRefrigerated": true
      }'),
      ('seven_eleven', '7-ELEVEN 取貨', '全台門市24小時取貨，超商代收', 65, 2, '{
        "maxWeight": 5,
        "maxDimensions": {"length": 45, "width": 30, "height": 30},
        "allowFragile": false,
        "allowHighValue": false,
        "allowRefrigerated": false
      }'),
      ('family_mart', '全家便利商店', '便利取貨，全台門市服務', 65, 2, '{
        "maxWeight": 5,
        "maxDimensions": {"length": 45, "width": 30, "height": 30},
        "allowFragile": false,
        "allowHighValue": false,
        "allowRefrigerated": false
      }'),
      ('hi_life', '萊爾富', '24小時便利取貨服務', 55, 2, '{
        "maxWeight": 5,
        "maxDimensions": {"length": 45, "width": 30, "height": 30},
        "allowFragile": false,
        "allowHighValue": false,
        "allowRefrigerated": false
      }'),
      ('ok_mart', 'OK便利商店', '快速便利的取貨體驗', 55, 2, '{
        "maxWeight": 5,
        "maxDimensions": {"length": 45, "width": 30, "height": 30},
        "allowFragile": false,
        "allowHighValue": false,
        "allowRefrigerated": false
      }')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 移除索引
    await queryRunner.query(`DROP INDEX "IDX_products_logistics_delivery_methods"`);
    await queryRunner.query(`DROP INDEX "IDX_product_variants_logistics_delivery_methods"`);

    // 移除欄位
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "logisticsConfig"`);
    await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "logisticsConfig"`);

    // 移除配送方式配置表
    await queryRunner.query(`DROP TABLE "delivery_method_configs"`);
  }
}