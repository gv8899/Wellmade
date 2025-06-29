import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductStatusAndPreorderFields1750502483853 implements MigrationInterface {
    name = 'AddProductStatusAndPreorderFields1750502483853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 檢查枚舉類型是否存在
        const productStatusEnum = await queryRunner.query(`
            SELECT typname FROM pg_type WHERE typname = 'product_status_enum'
        `);
        
        const inventoryTypeEnum = await queryRunner.query(`
            SELECT typname FROM pg_type WHERE typname = 'inventory_type_enum'
        `);
        
        // 創建產品狀態枚舉（如果不存在）
        if (!productStatusEnum || productStatusEnum.length === 0) {
            await queryRunner.query(`
                CREATE TYPE "product_status_enum" AS ENUM('IN_STOCK', 'PREORDER', 'OUT_OF_STOCK', 'DISCONTINUED')
            `);
        }
        
        // 創建庫存類型枚舉（如果不存在）
        if (!inventoryTypeEnum || inventoryTypeEnum.length === 0) {
            await queryRunner.query(`
                CREATE TYPE "inventory_type_enum" AS ENUM('PHYSICAL', 'PREORDER_LIMITED', 'PREORDER_UNLIMITED')
            `);
        }

        // 檢查 product_variants 表是否存在
        const productVariantsTable = await queryRunner.query(`
            SELECT table_name FROM information_schema.tables WHERE table_name = 'product_variants'
        `);
        
        // 如果 product_variants 表不存在，創建它
        if (!productVariantsTable || productVariantsTable.length === 0) {
            await queryRunner.query(`
                CREATE TABLE "product_variants" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "productId" uuid NOT NULL,
                    "sku" character varying NOT NULL,
                    "variantTitle" character varying,
                    "specs" jsonb NOT NULL,
                    "price" numeric(10,2) NOT NULL,
                    "compareAtPrice" numeric(10,2),
                    "stock" integer NOT NULL DEFAULT '0',
                    "imageUrl" character varying,
                    "sortOrder" integer NOT NULL DEFAULT '0',
                    "isActive" boolean NOT NULL DEFAULT true,
                    "weight" numeric(10,2),
                    "barcode" character varying,
                    "status" "product_status_enum" NOT NULL DEFAULT 'IN_STOCK',
                    "inventoryType" "inventory_type_enum" NOT NULL DEFAULT 'PHYSICAL',
                    "preorderLimit" integer,
                    "preorderSold" integer NOT NULL DEFAULT '0',
                    "preorderStartTime" TIMESTAMP,
                    "preorderEndTime" TIMESTAMP,
                    "expectedShipDate" DATE,
                    "preorderPrice" numeric(10,2),
                    "preorderDescription" text,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_product_variants" PRIMARY KEY ("id")
                )
            `);
    
            // 創建索引
            await queryRunner.query(`
                CREATE INDEX "IDX_product_variants_sku" ON "product_variants" ("sku")
            `);
            
            await queryRunner.query(`
                CREATE UNIQUE INDEX "IDX_product_variants_product_sku" ON "product_variants" ("productId", "sku")
            `);
    
            // 添加外鍵約束
            await queryRunner.query(`
                ALTER TABLE "product_variants" ADD CONSTRAINT "FK_product_variants_productId" 
                FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
            `);
        }

        // 檢查 products 表是否有 status 欄位
        const productStatusColumn = await queryRunner.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'status'
        `);
        
        // 如果 products 表沒有 status 欄位，添加它
        if (!productStatusColumn || productStatusColumn.length === 0) {
            await queryRunner.query(`
                ALTER TABLE "products" ADD "status" "product_status_enum" NOT NULL DEFAULT 'IN_STOCK'
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 移除 products 表的 status 欄位
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "status"`);
        
        // 移除外鍵約束
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_product_variants_productId"`);
        
        // 移除索引
        await queryRunner.query(`DROP INDEX "IDX_product_variants_product_sku"`);
        await queryRunner.query(`DROP INDEX "IDX_product_variants_sku"`);
        
        // 刪除 product_variants 表
        await queryRunner.query(`DROP TABLE "product_variants"`);
        
        // 刪除枚舉類型
        await queryRunner.query(`DROP TYPE "inventory_type_enum"`);
        await queryRunner.query(`DROP TYPE "product_status_enum"`);
    }

}
