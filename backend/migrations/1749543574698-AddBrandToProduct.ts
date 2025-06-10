import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBrandToProduct1749543574698 implements MigrationInterface {
    name = 'AddBrandToProduct1749543574698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "brand" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "brand"`);
    }

}
