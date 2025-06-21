import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class ProductBrandRelation1749546100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 檢查 brandId 欄位是否已存在
    const columns = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'brandId'
    `);
    
    // 如果 brandId 欄位不存在，則添加
    if (!columns || columns.length === 0) {
      await queryRunner.addColumn(
        "products",
        new TableColumn({
          name: "brandId",
          type: "uuid",
          isNullable: true,
        })
      );
    }

    // 檢查外鍵是否已存在
    const foreignKeys = await queryRunner.query(`
      SELECT constraint_name FROM information_schema.constraint_column_usage 
      WHERE table_name = 'brands' AND column_name = 'id'
      AND constraint_name IN (
        SELECT constraint_name FROM information_schema.constraint_column_usage 
        WHERE table_name = 'products' AND column_name = 'brandId'
      )
    `);
    
    // 如果外鍵不存在，則添加
    if (!foreignKeys || foreignKeys.length === 0) {
      await queryRunner.createForeignKey(
        "products",
        new TableForeignKey({
          columnNames: ["brandId"],
          referencedColumnNames: ["id"],
          referencedTableName: "brands",
          onDelete: "SET NULL",
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. 刪除外鍵約束
    const table = await queryRunner.getTable("products");
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("brandId") !== -1
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey("products", foreignKey);
    }

    // 2. 刪除 brandId 欄位
    await queryRunner.dropColumn("products", "brandId");
  }
}