import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBrandToProduct1749543574698 implements MigrationInterface {
    name = 'AddBrandToProduct1749543574698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 檢查 brand 欄位是否已存在
        const columns = await queryRunner.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'brand'
        `);
        
        // 如果 brand 欄位不存在，則添加
        if (!columns || columns.length === 0) {
            await queryRunner.query(`ALTER TABLE "products" ADD "brand" character varying`);
        } else {
            console.log('brand 欄位已存在，跳過創建');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "brand"`);
    }

}
