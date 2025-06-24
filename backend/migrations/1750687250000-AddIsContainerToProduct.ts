import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsContainerToProduct1750687250000 implements MigrationInterface {
    name = 'AddIsContainerToProduct1750687250000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. 添加 isContainer 欄位
        await queryRunner.query(`
            ALTER TABLE "products" 
            ADD COLUMN "is_container" boolean NOT NULL DEFAULT false
        `);

        // 2. 修改 price 欄位為可空（容器產品無獨立價格）
        await queryRunner.query(`
            ALTER TABLE "products" 
            ALTER COLUMN "price" DROP NOT NULL
        `);

        // 3. 將有變體的產品標記為容器產品
        await queryRunner.query(`
            UPDATE "products" 
            SET 
                "isContainer" = true,
                "price" = NULL,
                "stock" = 0,
                "masterSku" = NULL
            WHERE id IN (
                SELECT DISTINCT "productId" 
                FROM product_variants 
                WHERE "isActive" = true
            )
        `);

        console.log('✅ 已成功將有變體的產品標記為容器產品');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 回滾：恢復 price 欄位為非空
        await queryRunner.query(`
            UPDATE "products" 
            SET "price" = 1000.00 
            WHERE "price" IS NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "products" 
            ALTER COLUMN "price" SET NOT NULL
        `);

        // 移除 isContainer 欄位
        await queryRunner.query(`
            ALTER TABLE "products" 
            DROP COLUMN "is_container"
        `);

        console.log('✅ 已回滾 isContainer 相關變更');
    }
}