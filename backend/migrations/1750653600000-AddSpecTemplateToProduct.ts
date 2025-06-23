import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSpecTemplateToProduct1750653600000 implements MigrationInterface {
    name = 'AddSpecTemplateToProduct1750653600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "specTemplate" jsonb DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "specTemplate"`);
    }
}