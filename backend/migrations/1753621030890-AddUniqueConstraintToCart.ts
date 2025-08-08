import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintToCart1753621030890 implements MigrationInterface {
    name = 'AddUniqueConstraintToCart1753621030890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_CART_USER_ID" ON "carts" ("userId") WHERE "userId" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_CART_USER_ID"`);
    }

}
