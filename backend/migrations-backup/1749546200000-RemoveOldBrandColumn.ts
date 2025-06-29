import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RemoveOldBrandColumn1749546200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 檢查 brand 欄位是否存在
    const columns = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'brand'
    `);
    
    // 如果 brand 欄位存在，則移除
    if (columns && columns.length > 0) {
      await queryRunner.dropColumn("products", "brand");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 重新添加 brand 欄位
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "brand",
        type: "varchar",
        isNullable: true,
      })
    );

    // 恢復 brand 欄位的資料
    await queryRunner.query(`
      UPDATE products p
      SET brand = (SELECT b.name FROM brands b WHERE b.id = p."brandId")
      WHERE p."brandId" IS NOT NULL
    `);
  }
}
