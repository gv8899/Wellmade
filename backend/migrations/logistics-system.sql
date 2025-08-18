-- 物流系統資料庫結構建立

-- 建立物流狀態記錄相關的枚舉
CREATE TYPE "public"."logistics_status_records_status_enum" AS ENUM('PENDING', 'CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED');
CREATE TYPE "public"."logistics_status_records_previous_status_enum" AS ENUM('PENDING', 'CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED');

-- 建立物流狀態記錄表
CREATE TABLE "logistics_status_records" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "logistics_order_id" uuid NOT NULL,
    "status" "public"."logistics_status_records_status_enum" NOT NULL,
    "status_code" character varying,
    "status_desc" character varying NOT NULL,
    "previous_status" "public"."logistics_status_records_previous_status_enum",
    "trace_data" jsonb,
    "api_source" character varying,
    "notification_sent" boolean NOT NULL DEFAULT false,
    "note" text,
    "updated_by" character varying,
    "is_manual" boolean NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_f6c112faa2636fc6cbd6f757236" PRIMARY KEY ("id")
);

-- 建立狀態記錄表索引
CREATE INDEX "IDX_2ba7cf8187322ee827ae94631d" ON "logistics_status_records" ("created_at");
CREATE INDEX "IDX_57bf7295e2ef5f466471756fc2" ON "logistics_status_records" ("status");
CREATE INDEX "IDX_d2bddf64f226a9fd31f12d315d" ON "logistics_status_records" ("logistics_order_id");

-- 建立物流訂單相關的枚舉
CREATE TYPE "public"."logistics_orders_logistics_type_enum" AS ENUM('B2C', 'C2C');
CREATE TYPE "public"."logistics_orders_logistics_sub_type_enum" AS ENUM('1', '2', '3', '4');
CREATE TYPE "public"."logistics_orders_status_enum" AS ENUM('PENDING', 'CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED');

-- 建立物流訂單表
CREATE TABLE "logistics_orders" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "order_id" uuid NOT NULL,
    "merchant_order_no" character varying NOT NULL,
    "logistics_type" "public"."logistics_orders_logistics_type_enum" NOT NULL,
    "logistics_sub_type" "public"."logistics_orders_logistics_sub_type_enum" NOT NULL,
    "shipment_no" character varying,
    "cvs_payment_no" character varying,
    "cvs_validation_no" character varying,
    "booking_note" character varying,
    "is_collection" boolean NOT NULL DEFAULT false,
    "collection_amount" numeric(10,2),
    "goods_name" character varying NOT NULL,
    "goods_amount" numeric(10,2) NOT NULL,
    "sender_name" character varying NOT NULL,
    "sender_phone" character varying NOT NULL,
    "sender_cell_phone" character varying,
    "receiver_name" character varying NOT NULL,
    "receiver_phone" character varying,
    "receiver_cell_phone" character varying NOT NULL,
    "receiver_email" character varying,
    "receiver_address" character varying,
    "cvs_store_id" character varying,
    "cvs_store_name" character varying,
    "cvs_address" character varying,
    "cvs_telephone" character varying,
    "status" "public"."logistics_orders_status_enum" NOT NULL DEFAULT 'PENDING',
    "status_desc" character varying,
    "trade_desc" character varying,
    "remark" text,
    "label_url" character varying,
    "api_response" jsonb,
    "last_api_call" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_fc2e364f1b0be5ee677f7a140db" UNIQUE ("merchant_order_no"),
    CONSTRAINT "PK_3732a6b4b92cfd6f3bc09e557b9" PRIMARY KEY ("id")
);

-- 建立物流訂單表索引
CREATE INDEX "IDX_0cb799bae028efc854eadce25d" ON "logistics_orders" ("status");
CREATE INDEX "IDX_af94292f61d61fcbad65046907" ON "logistics_orders" ("order_id");
CREATE UNIQUE INDEX "IDX_fc2e364f1b0be5ee677f7a140d" ON "logistics_orders" ("merchant_order_no");

-- 建立超商門市相關的枚舉
CREATE TYPE "public"."convenience_stores_store_type_enum" AS ENUM('1', '2', '3', '4');

-- 建立超商門市表
CREATE TABLE "convenience_stores" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "store_type" "public"."convenience_stores_store_type_enum" NOT NULL,
    "store_id" character varying NOT NULL,
    "store_name" character varying NOT NULL,
    "store_address" character varying NOT NULL,
    "store_telephone" character varying,
    "city" character varying,
    "district" character varying,
    "postal_code" character varying,
    "latitude" numeric(10,6),
    "longitude" numeric(10,6),
    "is_active" boolean NOT NULL DEFAULT true,
    "operating_hours" character varying,
    "pickup_available" boolean NOT NULL DEFAULT true,
    "payment_available" boolean NOT NULL DEFAULT false,
    "store_image_url" character varying,
    "special_note" character varying,
    "max_package_size" character varying,
    "max_package_weight" numeric(5,2),
    "usage_count" integer NOT NULL DEFAULT '0',
    "last_used_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_e67bb559e0356e98b5678acf60d" PRIMARY KEY ("id")
);

-- 建立超商門市表索引
CREATE INDEX "IDX_5001595348b3a21e97bf1c266e" ON "convenience_stores" ("is_active");
CREATE INDEX "IDX_a3a8d2fc5fa3e1d877ab2bf307" ON "convenience_stores" ("store_type");
CREATE UNIQUE INDEX "IDX_382a9a2ec6595daed3f222c5cc" ON "convenience_stores" ("store_type", "store_id");

-- 檢查產品表是否存在 logisticsConfig 欄位，如果存在則更新預設值
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'logisticsConfig') THEN
        ALTER TABLE "products" ALTER COLUMN "logisticsConfig" SET DEFAULT '{
          "supportedDeliveryMethods": ["home_delivery", "seven_eleven", "family_mart", "hi_life", "ok_mart"],
          "physicalAttributes": {}
        }'::jsonb;
    END IF;
END
$$;

-- 檢查商品變體表是否存在 logisticsConfig 欄位，如果存在則更新預設值
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_variants' AND column_name = 'logisticsConfig') THEN
        ALTER TABLE "product_variants" ALTER COLUMN "logisticsConfig" SET DEFAULT '{
          "supportedDeliveryMethods": ["home_delivery", "seven_eleven", "family_mart", "hi_life", "ok_mart"],
          "physicalAttributes": {}
        }'::jsonb;
    END IF;
END
$$;

-- 建立外鍵約束
ALTER TABLE "logistics_status_records" ADD CONSTRAINT "FK_d2bddf64f226a9fd31f12d315d6" FOREIGN KEY ("logistics_order_id") REFERENCES "logistics_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- 檢查訂單表是否存在，如果存在則建立外鍵約束
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        ALTER TABLE "logistics_orders" ADD CONSTRAINT "FK_af94292f61d61fcbad650469072" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END
$$;