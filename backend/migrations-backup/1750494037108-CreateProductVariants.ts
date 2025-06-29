import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateProductVariants1750494037108 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "product_variants",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "productId",
                        type: "uuid",
                        isNullable: false
                    },
                    {
                        name: "sku",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "variantTitle",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "specs",
                        type: "jsonb",
                        isNullable: false
                    },
                    {
                        name: "price",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: "compareAtPrice",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: "stock",
                        type: "int",
                        default: 0
                    },
                    {
                        name: "imageUrl",
                        type: "varchar",
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
                        name: "weight",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: "barcode",
                        type: "varchar",
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
                        columnNames: ["productId"],
                        referencedTableName: "products",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE"
                    }
                ],
                indices: [
                    {
                        name: "IDX_product_variants_sku",
                        columnNames: ["sku"]
                    },
                    {
                        name: "IDX_product_variants_productId",
                        columnNames: ["productId"]
                    },
                    {
                        name: "UQ_product_variants_productId_sku",
                        columnNames: ["productId", "sku"],
                        isUnique: true
                    }
                ]
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("product_variants");
    }

}
