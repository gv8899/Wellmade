import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCategoryTable1750492901740 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "categories",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "name",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "slug",
                        type: "varchar",
                        isUnique: true,
                        isNullable: false
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "imageUrl",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "parentId",
                        type: "uuid",
                        isNullable: true
                    },
                    {
                        name: "sortOrder",
                        type: "int",
                        default: 0
                    },
                    {
                        name: "isActive",
                        type: "boolean",
                        default: true
                    },
                    {
                        name: "metaTitle",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "metaDescription",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()"
                    }
                ],
                foreignKeys: [
                    {
                        columnNames: ["parentId"],
                        referencedTableName: "categories",
                        referencedColumnNames: ["id"],
                        onDelete: "SET NULL"
                    }
                ]
            }),
            true
        );

        // 創建索引
        await queryRunner.query(`CREATE INDEX "IDX_categories_slug" ON "categories" ("slug")`);
        await queryRunner.query(`CREATE INDEX "IDX_categories_parent" ON "categories" ("parentId")`);
        await queryRunner.query(`CREATE INDEX "IDX_categories_active" ON "categories" ("isActive")`);

        // 插入預設分類數據
        await queryRunner.query(`
            INSERT INTO categories (name, slug, description, sortOrder, isActive) VALUES
            ('電子產品', 'electronics', '各類電子產品與配件', 1, true),
            ('服飾', 'clothing', '男女服飾、配件', 2, true),
            ('居家用品', 'home', '家居裝飾、日用品', 3, true),
            ('美妝保養', 'beauty', '彩妝、保養品', 4, true),
            ('運動用品', 'sports', '運動器材、運動服飾', 5, true),
            ('書籍', 'books', '各類書籍雜誌', 6, true),
            ('玩具', 'toys', '兒童玩具、益智遊戲', 7, true),
            ('食品', 'food', '零食、飲品、保健食品', 8, true)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("categories");
    }

}
