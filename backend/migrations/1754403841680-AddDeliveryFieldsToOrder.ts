import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeliveryFieldsToOrder1754403841680 implements MigrationInterface {
    name = 'AddDeliveryFieldsToOrder1754403841680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 添加 delivery_method 枚舉類型
        await queryRunner.query(`
            CREATE TYPE "public"."orders_deliverymethod_enum" AS ENUM(
                'home_delivery', 
                'seven_eleven', 
                'family_mart', 
                'hi_life', 
                'ok_mart'
            )
        `);
        
        // 添加 deliveryMethod 欄位
        await queryRunner.query(`
            ALTER TABLE "orders" 
            ADD "deliveryMethod" "public"."orders_deliverymethod_enum"
        `);
        
        // 添加 deliveryInfo jsonb 欄位
        await queryRunner.query(`
            ALTER TABLE "orders" 
            ADD "deliveryInfo" jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 移除 deliveryInfo 欄位
        await queryRunner.query(`
            ALTER TABLE "orders" 
            DROP COLUMN "deliveryInfo"
        `);
        
        // 移除 deliveryMethod 欄位
        await queryRunner.query(`
            ALTER TABLE "orders" 
            DROP COLUMN "deliveryMethod"
        `);
        
        // 移除枚舉類型  
        await queryRunner.query(`
            DROP TYPE "public"."orders_deliverymethod_enum"
        `);
    }

}
