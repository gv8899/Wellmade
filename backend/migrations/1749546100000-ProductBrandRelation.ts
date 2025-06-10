import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class ProductBrandRelation1749546100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 先從產品表中獲取所有現有的品牌名稱
    const brands = await queryRunner.query(`
      SELECT DISTINCT brand 
      FROM products 
      WHERE brand IS NOT NULL AND brand != ''
    `);

    // 2. 將這些品牌名稱插入到品牌表中
    if (brands && brands.length > 0) {
      for (const brandObj of brands) {
        const brandName = brandObj.brand;
        // 檢查品牌是否已存在
        const existingBrand = await queryRunner.query(`
          SELECT id FROM brands WHERE name = $1
        `, [brandName]);

        if (!existingBrand || existingBrand.length === 0) {
          await queryRunner.query(`
            INSERT INTO brands (name) VALUES ($1)
          `, [brandName]);
        }
      }
    }

    // 3. 在產品表中添加 brandId 欄位
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "brandId",
        type: "uuid",
        isNullable: true,
      })
    );

    // 4. 為每個產品設置正確的 brandId
    await queryRunner.query(`
      UPDATE products p
      SET "brandId" = (SELECT b.id FROM brands b WHERE b.name = p.brand)
      WHERE p.brand IS NOT NULL AND p.brand != ''
    `);

    // 5. 添加外鍵約束
    await queryRunner.createForeignKey(
      "products",
      new TableForeignKey({
        columnNames: ["brandId"],
        referencedColumnNames: ["id"],
        referencedTableName: "brands",
        onDelete: "SET NULL", // 如果刪除品牌，產品的 brandId 設為 null
      })
    );
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
