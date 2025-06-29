import { MigrationInterface, QueryRunner } from "typeorm";

export class ConsolidateProductTables1749680531255 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 檢查 product 表格是否存在
        const productTableExists = await queryRunner.hasTable('product');
        
        if (productTableExists) {
            // 檢查 products 表格是否存在
            const productsTableExists = await queryRunner.hasTable('products');

            if (productsTableExists) {
                // 兩個表格都存在，需要合併數據
                
                // 首先，複製 product 表格中的數據至 products 表格
                // 但需要避免主鍵衝突，所以只複製不存在於 products 表格中的記錄
                await queryRunner.query(`
                    INSERT INTO products (id, name, description, price, stock, category, "imageUrl", images, "isActive", "createdAt", "updatedAt")
                    SELECT p.id, p.name, p.description, p.price, p.stock, p.category, p."imageUrl", p.images, p."isActive", p."createdAt", p."updatedAt"
                    FROM product p
                    WHERE NOT EXISTS (
                        SELECT 1 FROM products ps WHERE ps.id = p.id
                    )
                `);
                
                // 刪除舊的 product 表格
                await queryRunner.dropTable('product');
                
                console.log('成功將 product 表格數據合併至 products 表格並刪除 product 表格');
            } else {
                // 只有 product 表格存在，將其重命名為 products
                await queryRunner.renameTable('product', 'products');
                console.log('成功將 product 表格重命名為 products 表格');
            }
        } else {
            console.log('product 表格不存在，無需進行合併操作');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 不提供回滾操作，因為這是一個資料合併操作
        // 如果需要回滾，應該從備份恢復
        console.log('警告：此遷移不支持回滾操作');
    }
}
