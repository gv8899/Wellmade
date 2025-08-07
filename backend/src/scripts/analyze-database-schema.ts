import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// 分析生產資料庫結構的腳本
async function analyzeDatabaseSchema() {
  console.log('🔍 開始分析生產資料庫結構...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await dataSource.initialize();
    console.log('✅ 資料庫連接成功');

    const queryRunner = dataSource.createQueryRunner();

    // 1. 獲取所有表
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log(
      '📋 發現的表:',
      tables.map((t: any) => t.table_name),
    );

    const schemaReport: any = {
      tables: {},
      enums: [],
      foreignKeys: [],
      indexes: [],
    };

    // 2. 分析每個表的結構
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`\n🔍 分析表: ${tableName}`);

      // 獲取欄位信息
      const columns = await queryRunner.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_name = '${tableName}' 
        ORDER BY ordinal_position
      `);

      // 獲取主鍵
      const primaryKeys = await queryRunner.query(`
        SELECT column_name
        FROM information_schema.key_column_usage
        WHERE table_name = '${tableName}'
        AND constraint_name IN (
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_name = '${tableName}' AND constraint_type = 'PRIMARY KEY'
        )
      `);

      // 獲取唯一約束
      const uniqueConstraints = await queryRunner.query(`
        SELECT column_name, constraint_name
        FROM information_schema.key_column_usage
        WHERE table_name = '${tableName}'
        AND constraint_name IN (
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_name = '${tableName}' AND constraint_type = 'UNIQUE'
        )
      `);

      schemaReport.tables[tableName] = {
        columns: columns,
        primaryKeys: primaryKeys.map((pk: any) => pk.column_name),
        uniqueConstraints: uniqueConstraints,
      };
    }

    // 3. 獲取所有外鍵約束
    const foreignKeys = await queryRunner.query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, tc.constraint_name
    `);

    schemaReport.foreignKeys = foreignKeys;

    // 4. 獲取自定義枚舉類型
    const enums = await queryRunner.query(`
      SELECT 
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typtype = 'e'
      GROUP BY t.typname
      ORDER BY t.typname
    `);

    schemaReport.enums = enums;

    // 5. 獲取索引
    const indexes = await queryRunner.query(`
      SELECT 
        indexname,
        tablename,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname
    `);

    schemaReport.indexes = indexes;

    // 6. 保存分析報告
    const reportPath = path.join(
      process.cwd(),
      'database-schema-analysis.json',
    );
    fs.writeFileSync(reportPath, JSON.stringify(schemaReport, null, 2));
    console.log(`\n📄 結構分析報告已保存至: ${reportPath}`);

    // 7. 生成摘要
    console.log('\n📊 資料庫結構摘要:');
    console.log(`   - 表數量: ${Object.keys(schemaReport.tables).length}`);
    console.log(`   - 外鍵約束: ${foreignKeys.length}`);
    console.log(`   - 自定義枚舉: ${enums.length}`);
    console.log(`   - 索引: ${indexes.length}`);

    console.log('\n🎯 下一步: 根據此分析生成基線 migration');

    await queryRunner.release();
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ 分析失敗:', error);
    process.exit(1);
  }
}

// 執行分析
if (require.main === module) {
  require('dotenv').config();
  analyzeDatabaseSchema();
}

export { analyzeDatabaseSchema };
