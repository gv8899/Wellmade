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

    // 檢查外鍵是否已存在 - 使用更準確的查詢
    const existingForeignKeys = await queryRunner.query(`
      SELECT tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'products'
        AND kcu.column_name = 'brandId'
        AND ccu.table_name = 'brands'
        AND ccu.column_name = 'id'
    `);
    
    // 如果外鍵不存在，則添加
    if (!existingForeignKeys || existingForeignKeys.length === 0) {
      await queryRunner.createForeignKey(
        "products",
        new TableForeignKey({
          columnNames: ["brandId"],
          referencedColumnNames: ["id"],
          referencedTableName: "brands",
          onDelete: "SET NULL",
        })
      );
    } else {
      console.log('外鍵約束已存在，跳過創建:', existingForeignKeys[0].constraint_name);
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