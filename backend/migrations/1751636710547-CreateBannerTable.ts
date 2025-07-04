import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBannerTable1751636710547 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "banners",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "gen_random_uuid()",
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "imageUrl",
                        type: "varchar",
                        length: "500",
                        isNullable: false,
                    },
                    {
                        name: "mobileImageUrl",
                        type: "varchar",
                        length: "500",
                        isNullable: true,
                    },
                    {
                        name: "linkUrl",
                        type: "varchar",
                        length: "500",
                        isNullable: true,
                    },
                    {
                        name: "linkType",
                        type: "enum",
                        enum: ["none", "internal", "external"],
                        default: "'none'",
                    },
                    {
                        name: "position",
                        type: "enum",
                        enum: ["homepage", "homepage_secondary", "category_top", "product_detail"],
                        default: "'homepage'",
                    },
                    {
                        name: "sortOrder",
                        type: "integer",
                        default: 0,
                    },
                    {
                        name: "isActive",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "startDate",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "endDate",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
                indices: [
                    {
                        name: "IDX_BANNER_POSITION_SORT",
                        columnNames: ["position", "sortOrder"],
                    },
                    {
                        name: "IDX_BANNER_ACTIVE",
                        columnNames: ["isActive"],
                    },
                    {
                        name: "IDX_BANNER_DATES",
                        columnNames: ["startDate", "endDate"],
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("banners");
    }

}
