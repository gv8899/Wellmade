import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class ProductBrandRelation1749546100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. åå¾ç¢åè¡¨ä¸­ç²åææç¾æçåçåç¨±
    const brands = await queryRunner.query(`
      SELECT DISTINCT brand 
      FROM products 
      WHERE brand IS NOT NULL AND brand != ''
    `);

    // 2. å°éäºåçåç¨±æå¥å°åçè¡¨ä¸­
    if (brands && brands.length > 0) {
      for (const brandObj of brands) {
        const brandName = brandObj.brand;
        // æª¢æ¥åçæ¯å¦å·²å­å¨
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

    // 3. å¨ç¢åè¡¨ä¸­æ·»å  brandId æ¬ä½
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "brandId",
        type: "uuid",
        isNullable: true,
      })
    );

    // 4. çºæ¯åç¢åè¨­ç½®æ­£ç¢ºç brandId
    await queryRunner.query(`
      UPDATE products p
      SET "brandId" = (SELECT b.id FROM brands b WHERE b.name = p.brand)
      WHERE p.brand IS NOT NULL AND p.brand != ''
    `);

    // 5. æ·»å å¤éµç´æ
    await queryRunner.createForeignKey(
      "products",
      new TableForeignKey({
        columnNames: ["brandId"],
        referencedColumnNames: ["id"],
        referencedTableName: "brands",
        onDelete: "SET NULL", // å¦æåªé¤åçï¼ç¢åç brandId è¨­çº null
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. åªé¤å¤éµç´æ
    const table = await queryRunner.getTable("products");
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("brandId") !== -1
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey("products", foreignKey);
    }

    // 2. åªé¤ brandId æ¬ä½
    await queryRunner.dropColumn("products", "brandId");
  }
}
