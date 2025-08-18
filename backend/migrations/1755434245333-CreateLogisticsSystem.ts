import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLogisticsSystem1755434245333 implements MigrationInterface {
    name = 'CreateLogisticsSystem1755434245333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."logistics_status_records_status_enum" AS ENUM('PENDING', 'CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED')`);
        await queryRunner.query(`CREATE TYPE "public"."logistics_status_records_previous_status_enum" AS ENUM('PENDING', 'CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED')`);
        await queryRunner.query(`CREATE TABLE "logistics_status_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "logistics_order_id" uuid NOT NULL, "status" "public"."logistics_status_records_status_enum" NOT NULL, "status_code" character varying, "status_desc" character varying NOT NULL, "previous_status" "public"."logistics_status_records_previous_status_enum", "trace_data" jsonb, "api_source" character varying, "notification_sent" boolean NOT NULL DEFAULT false, "note" text, "updated_by" character varying, "is_manual" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f6c112faa2636fc6cbd6f757236" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2ba7cf8187322ee827ae94631d" ON "logistics_status_records" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_57bf7295e2ef5f466471756fc2" ON "logistics_status_records" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_d2bddf64f226a9fd31f12d315d" ON "logistics_status_records" ("logistics_order_id") `);
        await queryRunner.query(`CREATE TYPE "public"."logistics_orders_logistics_type_enum" AS ENUM('B2C', 'C2C')`);
        await queryRunner.query(`CREATE TYPE "public"."logistics_orders_logistics_sub_type_enum" AS ENUM('1', '2', '3', '4')`);
        await queryRunner.query(`CREATE TYPE "public"."logistics_orders_status_enum" AS ENUM('PENDING', 'CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED')`);
        await queryRunner.query(`CREATE TABLE "logistics_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "merchant_order_no" character varying NOT NULL, "logistics_type" "public"."logistics_orders_logistics_type_enum" NOT NULL, "logistics_sub_type" "public"."logistics_orders_logistics_sub_type_enum" NOT NULL, "shipment_no" character varying, "cvs_payment_no" character varying, "cvs_validation_no" character varying, "booking_note" character varying, "is_collection" boolean NOT NULL DEFAULT false, "collection_amount" numeric(10,2), "goods_name" character varying NOT NULL, "goods_amount" numeric(10,2) NOT NULL, "sender_name" character varying NOT NULL, "sender_phone" character varying NOT NULL, "sender_cell_phone" character varying, "receiver_name" character varying NOT NULL, "receiver_phone" character varying, "receiver_cell_phone" character varying NOT NULL, "receiver_email" character varying, "receiver_address" character varying, "cvs_store_id" character varying, "cvs_store_name" character varying, "cvs_address" character varying, "cvs_telephone" character varying, "status" "public"."logistics_orders_status_enum" NOT NULL DEFAULT 'PENDING', "status_desc" character varying, "trade_desc" character varying, "remark" text, "label_url" character varying, "api_response" jsonb, "last_api_call" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fc2e364f1b0be5ee677f7a140db" UNIQUE ("merchant_order_no"), CONSTRAINT "PK_3732a6b4b92cfd6f3bc09e557b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0cb799bae028efc854eadce25d" ON "logistics_orders" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_af94292f61d61fcbad65046907" ON "logistics_orders" ("order_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fc2e364f1b0be5ee677f7a140d" ON "logistics_orders" ("merchant_order_no") `);
        await queryRunner.query(`CREATE TYPE "public"."convenience_stores_store_type_enum" AS ENUM('1', '2', '3', '4')`);
        await queryRunner.query(`CREATE TABLE "convenience_stores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "store_type" "public"."convenience_stores_store_type_enum" NOT NULL, "store_id" character varying NOT NULL, "store_name" character varying NOT NULL, "store_address" character varying NOT NULL, "store_telephone" character varying, "city" character varying, "district" character varying, "postal_code" character varying, "latitude" numeric(10,6), "longitude" numeric(10,6), "is_active" boolean NOT NULL DEFAULT true, "operating_hours" character varying, "pickup_available" boolean NOT NULL DEFAULT true, "payment_available" boolean NOT NULL DEFAULT false, "store_image_url" character varying, "special_note" character varying, "max_package_size" character varying, "max_package_weight" numeric(5,2), "usage_count" integer NOT NULL DEFAULT '0', "last_used_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e67bb559e0356e98b5678acf60d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5001595348b3a21e97bf1c266e" ON "convenience_stores" ("is_active") `);
        await queryRunner.query(`CREATE INDEX "IDX_a3a8d2fc5fa3e1d877ab2bf307" ON "convenience_stores" ("store_type") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_382a9a2ec6595daed3f222c5cc" ON "convenience_stores" ("store_type", "store_id") `);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "logisticsConfig" SET DEFAULT '{
      "supportedDeliveryMethods": ["home_delivery", "seven_eleven", "family_mart", "hi_life", "ok_mart"],
      "physicalAttributes": {}
    }'::jsonb`);
        await queryRunner.query(`ALTER TABLE "product_variants" ALTER COLUMN "logisticsConfig" SET DEFAULT '{
      "supportedDeliveryMethods": ["home_delivery", "seven_eleven", "family_mart", "hi_life", "ok_mart"],
      "physicalAttributes": {}
    }'::jsonb`);
        await queryRunner.query(`ALTER TABLE "logistics_status_records" ADD CONSTRAINT "FK_d2bddf64f226a9fd31f12d315d6" FOREIGN KEY ("logistics_order_id") REFERENCES "logistics_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "logistics_orders" ADD CONSTRAINT "FK_af94292f61d61fcbad650469072" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "logistics_orders" DROP CONSTRAINT "FK_af94292f61d61fcbad650469072"`);
        await queryRunner.query(`ALTER TABLE "logistics_status_records" DROP CONSTRAINT "FK_d2bddf64f226a9fd31f12d315d6"`);
        await queryRunner.query(`ALTER TABLE "product_variants" ALTER COLUMN "logisticsConfig" SET DEFAULT '{"physicalAttributes": {}, "supportedDeliveryMethods": ["home_delivery", "seven_eleven", "family_mart", "hi_life", "ok_mart"]}'`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "logisticsConfig" SET DEFAULT '{"physicalAttributes": {}, "supportedDeliveryMethods": ["home_delivery", "seven_eleven", "family_mart", "hi_life", "ok_mart"]}'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_382a9a2ec6595daed3f222c5cc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a3a8d2fc5fa3e1d877ab2bf307"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5001595348b3a21e97bf1c266e"`);
        await queryRunner.query(`DROP TABLE "convenience_stores"`);
        await queryRunner.query(`DROP TYPE "public"."convenience_stores_store_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fc2e364f1b0be5ee677f7a140d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_af94292f61d61fcbad65046907"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0cb799bae028efc854eadce25d"`);
        await queryRunner.query(`DROP TABLE "logistics_orders"`);
        await queryRunner.query(`DROP TYPE "public"."logistics_orders_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."logistics_orders_logistics_sub_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."logistics_orders_logistics_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d2bddf64f226a9fd31f12d315d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_57bf7295e2ef5f466471756fc2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2ba7cf8187322ee827ae94631d"`);
        await queryRunner.query(`DROP TABLE "logistics_status_records"`);
        await queryRunner.query(`DROP TYPE "public"."logistics_status_records_previous_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."logistics_status_records_status_enum"`);
    }

}
