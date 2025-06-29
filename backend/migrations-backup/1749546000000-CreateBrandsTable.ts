import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBrandsTable1749546000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 創建品牌資料表
    await queryRunner.createTable(
      new Table({
        name: "brands",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "logoUrl",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
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

    // 確保 uuid-ossp 擴展已啟用
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("brands");
  }
}
