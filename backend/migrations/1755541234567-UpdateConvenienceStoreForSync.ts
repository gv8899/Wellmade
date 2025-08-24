import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateConvenienceStoreForSync1755541234567 implements MigrationInterface {
    name = 'UpdateConvenienceStoreForSync1755541234567';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 新增欄位以支援全家便利商店資料同步
        await queryRunner.query(`
            ALTER TABLE "convenience_stores" 
            ADD COLUMN "address" varchar NULL,
            ADD COLUMN "phone" varchar NULL,
            ADD COLUMN "area" varchar NULL,
            ADD COLUMN "services" json NULL,
            ADD COLUMN "business_hours" varchar NULL,
            ADD COLUMN "last_updated" timestamp NULL
        `);

        // 建立索引以提升查詢效能
        await queryRunner.query(`
            CREATE INDEX "IDX_convenience_stores_city_area" 
            ON "convenience_stores" ("city", "area")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_convenience_stores_latitude_longitude" 
            ON "convenience_stores" ("latitude", "longitude")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_convenience_stores_last_updated" 
            ON "convenience_stores" ("last_updated")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 移除索引
        await queryRunner.query(`DROP INDEX "IDX_convenience_stores_last_updated"`);
        await queryRunner.query(`DROP INDEX "IDX_convenience_stores_latitude_longitude"`);
        await queryRunner.query(`DROP INDEX "IDX_convenience_stores_city_area"`);

        // 移除新增的欄位
        await queryRunner.query(`
            ALTER TABLE "convenience_stores" 
            DROP COLUMN "last_updated",
            DROP COLUMN "business_hours",
            DROP COLUMN "services",
            DROP COLUMN "area",
            DROP COLUMN "phone",
            DROP COLUMN "address"
        `);
    }
}