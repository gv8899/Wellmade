import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCartTables1749697500000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 創建購物車表
        await queryRunner.createTable(
            new Table({
                name: "carts",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "userId",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "sessionId",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );

        // 創建購物車項目表
        await queryRunner.createTable(
            new Table({
                name: "cart_items",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "cartId",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "productId",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "variantId",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "quantity",
                        type: "integer",
                        default: 1,
                    },
                    {
                        name: "price",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        default: 0,
                    },
                    {
                        name: "name",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "cover",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "specs",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );

        // 添加外鍵約束
        await queryRunner.createForeignKey(
            "carts",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "cart_items",
            new TableForeignKey({
                columnNames: ["cartId"],
                referencedColumnNames: ["id"],
                referencedTableName: "carts",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "cart_items",
            new TableForeignKey({
                columnNames: ["productId"],
                referencedColumnNames: ["id"],
                referencedTableName: "products",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 刪除表格（會自動刪除關聯的外鍵）
        await queryRunner.dropTable("cart_items");
        await queryRunner.dropTable("carts");
    }
}
