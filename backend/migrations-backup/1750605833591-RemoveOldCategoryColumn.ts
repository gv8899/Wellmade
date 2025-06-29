import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOldCategoryColumn1750605833591 implements MigrationInterface {
    name = 'RemoveOldCategoryColumn1750605833591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "category"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "category" character varying`);
    }

}
