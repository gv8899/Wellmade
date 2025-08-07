import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArticlesSystem1754219961647 implements MigrationInterface {
    name = 'CreateArticlesSystem1754219961647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 創建 authors 表
        await queryRunner.query(`
            CREATE TABLE "authors" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "bio" text,
                "avatar" character varying(500),
                "email" character varying(100),
                "socialLinks" jsonb,
                "userId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_d2ed02fabd9b52847ccb85e6b88" PRIMARY KEY ("id")
            )
        `);

        // 創建 article_categories 表
        await queryRunner.query(`
            CREATE TABLE "article_categories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "slug" character varying(100) NOT NULL,
                "description" text,
                "coverImage" character varying(500),
                "parentId" uuid,
                "metaTitle" character varying(200),
                "metaDescription" character varying(300),
                "displayOrder" integer NOT NULL DEFAULT '0',
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_article_categories_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_5b8c7c3b4f9d8e2f0a1c9b3d5e7" PRIMARY KEY ("id")
            )
        `);

        // 創建 articles 表
        await queryRunner.query(`
            CREATE TYPE "articles_status_enum" AS ENUM('draft', 'published', 'archived')
        `);

        await queryRunner.query(`
            CREATE TABLE "articles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(200) NOT NULL,
                "subtitle" character varying(300),
                "slug" character varying(200) NOT NULL,
                "coverImage" character varying(500),
                "content" jsonb NOT NULL,
                "excerpt" text,
                "categoryId" uuid,
                "tags" text array NOT NULL DEFAULT '{}',
                "status" "articles_status_enum" NOT NULL DEFAULT 'draft',
                "publishedAt" TIMESTAMP,
                "metaTitle" character varying(200),
                "metaDescription" character varying(300),
                "canonicalUrl" character varying(500),
                "socialImage" character varying(500),
                "viewCount" integer NOT NULL DEFAULT '0',
                "readingTime" integer NOT NULL DEFAULT '0',
                "authorId" uuid NOT NULL,
                "featuredProducts" text array NOT NULL DEFAULT '{}',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_articles_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id")
            )
        `);

        // 創建索引
        await queryRunner.query(`CREATE INDEX "IDX_article_categories_slug" ON "article_categories" ("slug")`);
        await queryRunner.query(`CREATE INDEX "IDX_articles_slug" ON "articles" ("slug")`);
        await queryRunner.query(`CREATE INDEX "IDX_articles_status" ON "articles" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_articles_published_at" ON "articles" ("publishedAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_articles_category_id" ON "articles" ("categoryId")`);
        await queryRunner.query(`CREATE INDEX "IDX_articles_author_id" ON "articles" ("authorId")`);

        // 創建外鍵約束
        await queryRunner.query(`
            ALTER TABLE "authors" 
            ADD CONSTRAINT "FK_authors_userId" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "article_categories" 
            ADD CONSTRAINT "FK_article_categories_parentId" 
            FOREIGN KEY ("parentId") REFERENCES "article_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "articles" 
            ADD CONSTRAINT "FK_articles_categoryId" 
            FOREIGN KEY ("categoryId") REFERENCES "article_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "articles" 
            ADD CONSTRAINT "FK_articles_authorId" 
            FOREIGN KEY ("authorId") REFERENCES "authors"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 刪除外鍵約束
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_articles_authorId"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_articles_categoryId"`);
        await queryRunner.query(`ALTER TABLE "article_categories" DROP CONSTRAINT "FK_article_categories_parentId"`);
        await queryRunner.query(`ALTER TABLE "authors" DROP CONSTRAINT "FK_authors_userId"`);

        // 刪除索引
        await queryRunner.query(`DROP INDEX "IDX_articles_author_id"`);
        await queryRunner.query(`DROP INDEX "IDX_articles_category_id"`);
        await queryRunner.query(`DROP INDEX "IDX_articles_published_at"`);
        await queryRunner.query(`DROP INDEX "IDX_articles_status"`);
        await queryRunner.query(`DROP INDEX "IDX_articles_slug"`);
        await queryRunner.query(`DROP INDEX "IDX_article_categories_slug"`);

        // 刪除表
        await queryRunner.query(`DROP TABLE "articles"`);
        await queryRunner.query(`DROP TYPE "articles_status_enum"`);
        await queryRunner.query(`DROP TABLE "article_categories"`);
        await queryRunner.query(`DROP TABLE "authors"`);
    }

}
