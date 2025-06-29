import { MigrationInterface, QueryRunner } from "typeorm";

export class BaselineSchema1751162182420 implements MigrationInterface {
    name = 'BaselineSchema1751162182420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('執行基線 Migration - 建立當前資料庫結構');
        
        // 確保 UUID 擴展存在
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        
        // 創建枚舉類型
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentmethod_enum" AS ENUM('credit_card', 'line_pay')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM('pending', 'paid', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_records_status_enum" AS ENUM('pending', 'success', 'failed', 'cancelled', 'refunded')`);
        await queryRunner.query(`CREATE TYPE "public"."product_variants_inventorytype_enum" AS ENUM('PHYSICAL', 'PREORDER_LIMITED', 'PREORDER_UNLIMITED')`);
        await queryRunner.query(`CREATE TYPE "public"."product_variants_status_enum" AS ENUM('IN_STOCK', 'PREORDER', 'OUT_OF_STOCK', 'DISCONTINUED')`);
        await queryRunner.query(`CREATE TYPE "public"."products_status_enum" AS ENUM('IN_STOCK', 'PREORDER', 'OUT_OF_STOCK', 'DISCONTINUED')`);
        await queryRunner.query(`CREATE TYPE "public"."users_roles_enum" AS ENUM('admin', 'user', 'editor')`);

        // 創建表
        await queryRunner.query(`CREATE TABLE "brands" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "logoUrl" character varying,
            "description" text,
            "isActive" boolean NOT NULL DEFAULT true,
            "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
            "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
            CONSTRAINT "PK_brands" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "cart_items" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "cartId" uuid NOT NULL,
            "productId" uuid NOT NULL,
            "variantId" character varying,
            "quantity" integer NOT NULL,
            "price" numeric(10,2) NOT NULL DEFAULT '0'::numeric,
            "name" character varying,
            "cover" character varying,
            "specs" jsonb,
            "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
            "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
            CONSTRAINT "PK_cart_items" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "carts" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "userId" uuid,
            "sessionId" character varying,
            "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
            "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
            CONSTRAINT "PK_carts" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "categories" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "slug" character varying NOT NULL,
            "description" text,
            "imageUrl" character varying,
            "parentId" uuid,
            "sortOrder" integer NOT NULL DEFAULT 0,
            "isActive" boolean NOT NULL DEFAULT true,
            "metaTitle" character varying,
            "metaDescription" text,
            "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
            "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
            CONSTRAINT "PK_categories" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "frontend_logs" (
            "id" integer NOT NULL DEFAULT nextval('frontend_logs_id_seq'::regclass),
            "level" character varying NOT NULL DEFAULT 'info'::character varying,
            "message" text NOT NULL,
            "context" jsonb,
            "error_stack" text,
            "user_id" integer,
            "session_id" character varying,
            "url" character varying,
            "user_agent" character varying,
            "timestamp" timestamp without time zone NOT NULL DEFAULT now(),
            "created_at" timestamp without time zone NOT NULL DEFAULT now(),
            CONSTRAINT "PK_frontend_logs" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "migrations" (
            "id" integer NOT NULL DEFAULT nextval('migrations_id_seq'::regclass),
            "timestamp" bigint NOT NULL,
            "name" character varying NOT NULL,
            CONSTRAINT "PK_migrations" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "order_items" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "orderId" uuid NOT NULL,
            "productId" uuid NOT NULL,
            "variantId" uuid,
            "quantity" integer NOT NULL,
            "price" numeric(10,2) NOT NULL,
            "specs" jsonb,
            "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
            "order_id" uuid,
            "product_id" uuid,
            "variant_id" uuid,
            CONSTRAINT "PK_order_items" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "orders" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "orderNumber" character varying NOT NULL,
            "userId" uuid,
            "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending'::orders_status_enum,
            "paymentStatus" "public"."orders_paymentstatus_enum" NOT NULL DEFAULT 'pending'::orders_paymentstatus_enum,
            "paymentMethod" "public"."orders_paymentmethod_enum",
            "subtotal" numeric(10,2) NOT NULL,
            "shippingFee" numeric(10,2) NOT NULL DEFAULT '0'::numeric,
            "total" numeric(10,2) NOT NULL,
            "customerInfo" jsonb NOT NULL,
            "notes" text,
            "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
            "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
            "user_id" uuid,
            CONSTRAINT "PK_orders" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "payment_records" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "orderId" uuid NOT NULL,
            "transactionId" character varying,
            "paymentMethod" character varying NOT NULL,
            "amount" numeric(10,2) NOT NULL,
            "status" "public"."payment_records_status_enum" NOT NULL DEFAULT 'pending'::payment_records_status_enum,
            "requestData" jsonb,
            "responseData" jsonb,
            "errorMessage" text,
            "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
            "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
            "order_id" uuid,
            CONSTRAINT "PK_payment_records" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "product_variants" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "productId" uuid NOT NULL,
            "sku" character varying NOT NULL,
            "variantTitle" character varying,
            "specs" jsonb NOT NULL,
            "price" numeric(10,2) NOT NULL,
            "compareAtPrice" numeric(10,2),
            "stock" integer NOT NULL DEFAULT 0,
            "imageUrl" character varying,
            "sortOrder" integer NOT NULL DEFAULT 0,
            "isActive" boolean NOT NULL DEFAULT true,
            "weight" numeric(10,2),
            "barcode" character varying,
            "status" "public"."product_variants_status_enum" NOT NULL DEFAULT 'IN_STOCK'::product_variants_status_enum,
            "inventoryType" "public"."product_variants_inventorytype_enum" NOT NULL DEFAULT 'PHYSICAL'::product_variants_inventorytype_enum,
            "preorderLimit" integer,
            "preorderSold" integer NOT NULL DEFAULT 0,
            "preorderStartTime" timestamp without time zone,
            "preorderEndTime" timestamp without time zone,
            "expectedShipDate" date,
            "preorderPrice" numeric(10,2),
            "preorderDescription" text,
            "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
            "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
            CONSTRAINT "PK_product_variants" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "products" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "masterSku" character varying,
            "description" text NOT NULL,
            "price" numeric(10,2),
            "stock" integer NOT NULL DEFAULT 0,
            "categoryId" uuid,
            "brandId" uuid,
            "imageUrl" character varying,
            "images" _text,
            "keyFeatures" jsonb,
            "featureDetails" jsonb,
            "faqs" jsonb,
            "specTemplate" jsonb DEFAULT '[]'::jsonb,
            "isContainer" boolean NOT NULL DEFAULT false,
            "isActive" boolean NOT NULL DEFAULT true,
            "status" "public"."products_status_enum" NOT NULL DEFAULT 'IN_STOCK'::products_status_enum,
            "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
            "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
            CONSTRAINT "PK_products" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "users" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "username" character varying(50) NOT NULL,
            "password" character varying(255) NOT NULL,
            "email" character varying(100) NOT NULL,
            "firstName" character varying(100),
            "lastName" character varying(100),
            "picture" character varying(500),
            "roles" _users_roles_enum NOT NULL DEFAULT '{user}'::users_roles_enum[],
            "isActive" boolean NOT NULL DEFAULT true,
            "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
            "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
            CONSTRAINT "PK_users" PRIMARY KEY ("id")
        )`);

        // 創建外鍵約束
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_db2d0ea722e16e0fe8ab3bce111" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_records" ADD CONSTRAINT "FK_5d280bf56b140e43c1a95badd07" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ea86d0c514c4ecbb5694cbf57df" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('回退基線 Migration');
        // 這裡可以實作回退邏輯，但通常基線 migration 不需要回退
        throw new Error('基線 Migration 不支援回退');
    }
}
