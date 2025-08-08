import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintToCart1753621030890 implements MigrationInterface {
    name = 'AddUniqueConstraintToCart1753621030890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 檢查 userId 欄位是否存在
        const hasUserIdColumn = await queryRunner.hasColumn("carts", "userId");
        if (!hasUserIdColumn) {
            console.log("添加 userId 欄位到 carts 表");
            await queryRunner.query(`ALTER TABLE "carts" ADD COLUMN "userId" character varying`);
        }
        
        // 創建唯一索引
        const hasIndex = await queryRunner.query(`
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'carts' AND indexname = 'IDX_CART_USER_ID'
        `);
        
        if (hasIndex.length === 0) {
            console.log("創建 userId 唯一索引");
            await queryRunner.query(`CREATE UNIQUE INDEX "IDX_CART_USER_ID" ON "carts" ("userId") WHERE "userId" IS NOT NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_CART_USER_ID"`);
    }

}
