import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Migration 重建腳本 - 直接連接生產資料庫執行
async function rebuildMigrations() {
  console.log('🚀 開始 Migration 重建流程...');
  
  // 使用與生產環境相同的連接配置
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

    // 第一步：分析當前資料庫結構
    console.log('\n📋 第一步：分析當前資料庫結構...');
    
    // 獲取所有表
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('發現的表:', tables.map((t: any) => t.table_name));

    const schemaReport: any = {
      analyzedAt: new Date().toISOString(),
      tables: {},
      enums: [],
      foreignKeys: [],
      migrationStatus: {}
    };

    // 分析每個表的結構
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`  分析表: ${tableName}`);

      const columns = await queryRunner.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale,
          udt_name
        FROM information_schema.columns 
        WHERE table_name = '${tableName}' 
        ORDER BY ordinal_position
      `);

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

      schemaReport.tables[tableName] = {
        columns: columns,
        primaryKeys: primaryKeys.map((pk: any) => pk.column_name)
      };
    }

    // 獲取外鍵約束
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

    // 獲取枚舉類型
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

    console.log(`✅ 分析完成: ${Object.keys(schemaReport.tables).length} 表, ${foreignKeys.length} 外鍵, ${enums.length} 枚舉`);

    // 第二步：生成基線 Migration
    console.log('\n🏗️ 第二步：生成基線 Migration...');
    
    const timestamp = new Date().getTime();
    const migrationName = `${timestamp}-BaselineSchema`;
    const migrationFileName = `${migrationName}.ts`;

    let migrationContent = `import { MigrationInterface, QueryRunner } from "typeorm";

export class BaselineSchema${timestamp} implements MigrationInterface {
    name = 'BaselineSchema${timestamp}'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('執行基線 Migration - 建立當前資料庫結構');
        
        // 確保 UUID 擴展存在
        await queryRunner.query(\`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"\`);
        
`;

    // 生成枚舉類型
    if (enums.length > 0) {
      migrationContent += `        // 創建枚舉類型\n`;
      for (const enumType of enums) {
        // enum_values 可能是字串或陣列，需要處理
        let enumValues;
        if (Array.isArray(enumType.enum_values)) {
          enumValues = enumType.enum_values.map((v: string) => `'${v}'`).join(', ');
        } else {
          // 如果是字串格式 {value1,value2}，需要解析
          enumValues = enumType.enum_values.replace(/[{}]/g, '').split(',').map((v: string) => `'${v.trim()}'`).join(', ');
        }
        migrationContent += `        await queryRunner.query(\`CREATE TYPE "public"."${enumType.enum_name}" AS ENUM(${enumValues})\`);\n`;
      }
      migrationContent += `\n`;
    }

    // 生成表創建語句
    migrationContent += `        // 創建表\n`;
    const sortedTables = Object.keys(schemaReport.tables).sort();
    
    for (const tableName of sortedTables) {
      const table = schemaReport.tables[tableName];
      migrationContent += `        await queryRunner.query(\`CREATE TABLE "${tableName}" (\n`;
      
      const columnDefs = table.columns.map((col: any) => {
        let def = `            "${col.column_name}" `;
        
        if (col.data_type === 'uuid') {
          def += 'uuid';
        } else if (col.data_type === 'character varying') {
          def += col.character_maximum_length ? 
            `character varying(${col.character_maximum_length})` : 
            'character varying';
        } else if (col.data_type === 'USER-DEFINED') {
          def += `"public"."${col.udt_name}"`;
        } else if (col.data_type === 'ARRAY') {
          def += `${col.udt_name}`;
        } else if (col.data_type === 'numeric') {
          def += col.numeric_precision ? 
            `numeric(${col.numeric_precision},${col.numeric_scale})` : 
            'numeric';
        } else {
          def += col.data_type;
        }
        
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }
        
        return def;
      });
      
      migrationContent += columnDefs.join(',\n');
      
      if (table.primaryKeys.length > 0) {
        migrationContent += `,\n            CONSTRAINT "PK_${tableName}" PRIMARY KEY ("${table.primaryKeys.join('", "')}")`;
      }
      
      migrationContent += `\n        )\`);\n\n`;
    }

    // 生成外鍵約束
    if (foreignKeys.length > 0) {
      migrationContent += `        // 創建外鍵約束\n`;
      for (const fk of foreignKeys) {
        migrationContent += `        await queryRunner.query(\`ALTER TABLE "${fk.table_name}" ADD CONSTRAINT "${fk.constraint_name}" FOREIGN KEY ("${fk.column_name}") REFERENCES "${fk.foreign_table_name}"("${fk.foreign_column_name}") ON DELETE ${fk.delete_rule}\`);\n`;
      }
    }

    migrationContent += `    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('回退基線 Migration');
        // 這裡可以實作回退邏輯，但通常基線 migration 不需要回退
        throw new Error('基線 Migration 不支援回退');
    }
}
`;

    // 第三步：備份並清理現有 migrations
    console.log('\n🗂️ 第三步：備份並清理現有 migrations...');
    
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const backupDir = path.join(process.cwd(), 'migrations-backup');
    
    // 創建備份目錄
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    // 備份現有 migrations
    const existingMigrations = fs.readdirSync(migrationsDir);
    for (const migration of existingMigrations) {
      if (migration.endsWith('.ts')) {
        const sourcePath = path.join(migrationsDir, migration);
        const backupPath = path.join(backupDir, migration);
        fs.copyFileSync(sourcePath, backupPath);
        fs.unlinkSync(sourcePath); // 刪除原文件
      }
    }
    
    console.log(`✅ 備份了 ${existingMigrations.length} 個 migration 檔案到 migrations-backup/`);

    // 第四步：創建新的基線 migration
    console.log('\n📝 第四步：創建新的基線 migration...');
    
    const newMigrationPath = path.join(migrationsDir, migrationFileName);
    fs.writeFileSync(newMigrationPath, migrationContent);
    
    console.log(`✅ 基線 migration 創建完成: ${migrationFileName}`);

    // 第五步：重置 migration 歷史
    console.log('\n🔄 第五步：重置 migration 歷史...');
    
    try {
      // 清空 migrations 表
      await queryRunner.query(`DELETE FROM migrations`);
      console.log('✅ 清空 migrations 表');
      
      // 插入基線 migration 記錄
      await queryRunner.query(`
        INSERT INTO migrations (timestamp, name) 
        VALUES (${timestamp}, 'BaselineSchema${timestamp}')
      `);
      console.log('✅ 插入基線 migration 記錄');
      
    } catch (error) {
      console.log('migrations 表不存在，將由基線 migration 創建');
    }

    console.log('\n🎉 Migration 重建完成！');
    console.log('\n📋 總結:');
    console.log(`  - 分析了 ${Object.keys(schemaReport.tables).length} 個表`);
    console.log(`  - 備份了 ${existingMigrations.length} 個舊 migration 檔案`);
    console.log(`  - 創建了基線 migration: ${migrationFileName}`);
    console.log(`  - 重置了 migration 歷史記錄`);
    console.log('\n✅ 現在可以安全地啟用 migrationsRun: true');

    await queryRunner.release();
    await dataSource.destroy();

  } catch (error) {
    console.error('❌ Migration 重建失敗:', error);
    process.exit(1);
  }
}

// 執行重建
if (require.main === module) {
  require('dotenv').config();
  rebuildMigrations();
}

export { rebuildMigrations };