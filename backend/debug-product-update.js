const { createConnection } = require('typeorm');
const { Product } = require('./dist/products/product.entity');
const { Category } = require('./dist/categories/category.entity');

async function debugProductUpdate() {
  console.log('🔍 開始分析產品更新問題...\n');

  try {
    // 1. 建立資料庫連接（從 ormconfig.json 讀取）
    const connection = await createConnection();
    
    const productRepo = connection.getRepository(Product);
    const categoryRepo = connection.getRepository(Category);
    
    console.log('✅ 資料庫連接成功\n');

    // 2. 查找測試產品
    const testProduct = await productRepo.findOne({
      where: { name: 'AirPods Pro' },
      relations: ['categoryRelation']
    });
    
    if (!testProduct) {
      console.log('❌ 找不到測試產品 AirPods Pro');
      await connection.close();
      return;
    }
    
    console.log('📦 找到測試產品:');
    console.log(`  ID: ${testProduct.id}`);
    console.log(`  Name: ${testProduct.name}`);
    console.log(`  Current categoryId: ${testProduct.categoryId}`);
    console.log(`  Current category (old): ${testProduct.category}`);
    console.log(`  Category relation: ${testProduct.categoryRelation?.name || 'null'}\n`);

    // 3. 查找目標分類
    const targetCategory = await categoryRepo.findOne({
      where: { slug: 'smart-home' }
    });
    
    if (!targetCategory) {
      console.log('❌ 找不到目標分類 smart-home');
      await connection.close();
      return;
    }
    
    console.log('🎯 找到目標分類:');
    console.log(`  ID: ${targetCategory.id}`);
    console.log(`  Name: ${targetCategory.name}`);
    console.log(`  Slug: ${targetCategory.slug}\n`);

    // 4. 開始事務並監控更新過程
    await connection.transaction(async manager => {
      console.log('🔄 開始事務更新...\n');
      
      // 4.1 重新加載產品（在事務中）
      const productInTransaction = await manager.findOne(Product, {
        where: { id: testProduct.id },
        relations: ['categoryRelation']
      });
      
      console.log('📋 事務中的產品狀態:');
      console.log(`  categoryId: ${productInTransaction.categoryId}`);
      console.log(`  category: ${productInTransaction.category}`);
      
      // 4.2 模擬 Object.assign 更新
      const updateData = { categoryId: targetCategory.id };
      console.log(`\n🔧 應用更新: ${JSON.stringify(updateData)}`);
      
      const updatedProduct = Object.assign(productInTransaction, updateData);
      
      console.log('📋 Object.assign 後的產品狀態:');
      console.log(`  categoryId: ${updatedProduct.categoryId}`);
      console.log(`  category: ${updatedProduct.category}`);
      
      // 4.3 檢查實體是否被 TypeORM 標記為已修改
      const metadata = manager.connection.getMetadata(Product);
      console.log(`\n🏷️  實體元數據檢查:`);
      console.log(`  Table name: ${metadata.tableName}`);
      console.log(`  Primary columns: ${metadata.primaryColumns.map(c => c.propertyName).join(', ')}`);
      console.log(`  Category columns: ${metadata.columns.filter(c => c.propertyName.includes('category')).map(c => c.propertyName).join(', ')}`);
      
      // 4.4 執行保存並監控 SQL
      console.log('\n💾 執行保存操作...');
      
      // 啟用查詢日誌
      const queryRunner = manager.connection.createQueryRunner();
      queryRunner.connection.logger = {
        logQuery: (query, parameters) => {
          console.log(`🔍 SQL: ${query}`);
          if (parameters && parameters.length > 0) {
            console.log(`📊 Parameters: ${JSON.stringify(parameters)}`);
          }
        },
        logQueryError: (error, query, parameters) => {
          console.log(`❌ SQL Error: ${error}`);
          console.log(`🔍 Failed SQL: ${query}`);
        },
        logQuerySlow: () => {},
        logSchemaBuild: () => {},
        logMigration: () => {},
        log: () => {}
      };
      
      const savedProduct = await manager.save(Product, updatedProduct);
      
      console.log('\n✅ 保存完成，結果:');
      console.log(`  Saved categoryId: ${savedProduct.categoryId}`);
      console.log(`  Saved category: ${savedProduct.category}`);
      
      // 4.5 重新查詢確認
      const verifyProduct = await manager.findOne(Product, {
        where: { id: testProduct.id },
        relations: ['categoryRelation']
      });
      
      console.log('\n🔍 重新查詢確認:');
      console.log(`  DB categoryId: ${verifyProduct.categoryId}`);
      console.log(`  DB category: ${verifyProduct.category}`);
      console.log(`  DB categoryRelation: ${verifyProduct.categoryRelation?.name || 'null'}`);
      
      // 手動回滾以不影響實際資料
      throw new Error('手動回滾測試事務');
    });
    
  } catch (error) {
    if (error.message === '手動回滾測試事務') {
      console.log('\n✅ 測試完成，事務已回滾\n');
    } else {
      console.error('❌ 測試過程中發生錯誤:', error);
    }
  } finally {
    // 確保連接關閉
    try {
      const connection = await createConnection();
      await connection.close();
    } catch (e) {
      // 忽略關閉錯誤
    }
  }
}

// 執行測試
debugProductUpdate().catch(console.error);