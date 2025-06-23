import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMasterSkuToProduct1750587203184 implements MigrationInterface {
    name = 'AddMasterSkuToProduct1750587203184'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "masterSku" character varying`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ae49fff747be834b6491103f7e" ON "products" ("masterSku") WHERE "masterSku" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ae49fff747be834b6491103f7e"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "masterSku"`);
    }

}
