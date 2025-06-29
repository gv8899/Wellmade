import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddCategoryIdToProducts1750493648107 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. 添加 categoryId 欄位
        await queryRunner.addColumn(
            "products",
            new TableColumn({
                name: "categoryId",
                type: "uuid",
                isNullable: true,
            })
        );

        // 2. 建立分類對應關係
        const categoryMap = {
            'electronics': 'b4f019cb-b406-44b7-b9f6-b22f15ede69c',
            'clothing': '0bcb3736-929f-4bf5-9fc4-551aa8a1609b',
            'home': 'b65d11e3-c2f0-4768-97bf-5791d4d7a7fa',
            'beauty': 'e6d8595a-58bb-49e6-88f7-08d66dd8b14e',
            'sports': 'b141ed18-0542-4401-b89d-6182cbcd261e',
            'books': '497e19e6-40c0-4576-9192-78f630968e4c',
            'toys': '0699557a-d5f9-476b-be0d-b67ac90fed83',
            'food': 'ee1e2cca-c187-4364-80e9-42ebcf31b1a2'
        };

        // 3. 更新現有產品的 categoryId
        for (const [slug, categoryId] of Object.entries(categoryMap)) {
            await queryRunner.query(`
                UPDATE products 
                SET "categoryId" = '${categoryId}'
                WHERE category = '${slug}'
            `);
        }

        // 4. 添加外鍵約束
        await queryRunner.createForeignKey(
            "products",
            new TableForeignKey({
                columnNames: ["categoryId"],
                referencedColumnNames: ["id"],
                referencedTableName: "categories",
                onDelete: "SET NULL",
            })
        );

        // 5. 將 category 欄位設為可空（為了之後可以移除）
        await queryRunner.query(`
            ALTER TABLE products ALTER COLUMN category DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. 從 categoryId 回復 category 欄位的值
        const categoryMap = {
            'b4f019cb-b406-44b7-b9f6-b22f15ede69c': 'electronics',
            '0bcb3736-929f-4bf5-9fc4-551aa8a1609b': 'clothing',
            'b65d11e3-c2f0-4768-97bf-5791d4d7a7fa': 'home',
            'e6d8595a-58bb-49e6-88f7-08d66dd8b14e': 'beauty',
            'b141ed18-0542-4401-b89d-6182cbcd261e': 'sports',
            '497e19e6-40c0-4576-9192-78f630968e4c': 'books',
            '0699557a-d5f9-476b-be0d-b67ac90fed83': 'toys',
            'ee1e2cca-c187-4364-80e9-42ebcf31b1a2': 'food'
        };

        for (const [categoryId, slug] of Object.entries(categoryMap)) {
            await queryRunner.query(`
                UPDATE products 
                SET category = '${slug}'
                WHERE "categoryId" = '${categoryId}'
            `);
        }

        // 2. 將 category 欄位設回非空
        await queryRunner.query(`
            ALTER TABLE products ALTER COLUMN category SET NOT NULL
        `);

        // 3. 刪除外鍵約束
        const table = await queryRunner.getTable("products");
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("categoryId") !== -1
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey("products", foreignKey);
        }

        // 4. 刪除 categoryId 欄位
        await queryRunner.dropColumn("products", "categoryId");
    }

}
