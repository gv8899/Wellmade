import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseAnalysisService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private schemaReport: any = null;

  async analyzeSchema() {
    console.log('🔍 開始分析生產資料庫結構...');

    const queryRunner = this.dataSource.createQueryRunner();

    try {
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
        analyzedAt: new Date().toISOString(),
        tables: {},
        enums: [],
        foreignKeys: [],
        indexes: [],
        migrationStatus: {},
      };

      // 2. 分析每個表的結構
      for (const table of tables) {
        const tableName = table.table_name;
        console.log(`🔍 分析表: ${tableName}`);

        // 獲取欄位信息
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

      // 6. 檢查當前 migration 狀態
      try {
        const migrations = await queryRunner.query(`
          SELECT * FROM migrations ORDER BY timestamp
        `);
        schemaReport.migrationStatus = {
          hasTable: true,
          executedMigrations: migrations,
        };
      } catch (error) {
        schemaReport.migrationStatus = {
          hasTable: false,
          executedMigrations: [],
        };
      }

      // 保存分析結果到內存
      this.schemaReport = schemaReport;

      console.log('📊 資料庫結構摘要:');
      console.log(`   - 表數量: ${Object.keys(schemaReport.tables).length}`);
      console.log(`   - 外鍵約束: ${foreignKeys.length}`);
      console.log(`   - 自定義枚舉: ${enums.length}`);
      console.log(`   - 索引: ${indexes.length}`);
      console.log(
        `   - Migration 表存在: ${schemaReport.migrationStatus.hasTable}`,
      );

      return {
        success: true,
        message: '資料庫結構分析完成',
        summary: {
          tablesCount: Object.keys(schemaReport.tables).length,
          foreignKeysCount: foreignKeys.length,
          enumsCount: enums.length,
          indexesCount: indexes.length,
          hasMigrationTable: schemaReport.migrationStatus.hasTable,
          executedMigrationsCount:
            schemaReport.migrationStatus.executedMigrations.length,
        },
      };
    } catch (error) {
      console.error('❌ 分析失敗:', error);
      throw new BadRequestException(`資料庫結構分析失敗: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async getSchemaReport() {
    if (!this.schemaReport) {
      throw new BadRequestException('請先執行資料庫結構分析');
    }
    return this.schemaReport;
  }

  async generateBaselineMigration() {
    if (!this.schemaReport) {
      throw new BadRequestException('請先執行資料庫結構分析');
    }

    console.log('🏗️ 開始生成基線 Migration...');

    const timestamp = new Date().getTime();
    const migrationName = `${timestamp}-BaselineSchema`;

    let migrationContent = `import { MigrationInterface, QueryRunner } from "typeorm";

export class BaselineSchema${timestamp} implements MigrationInterface {
    name = 'BaselineSchema${timestamp}'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 基線 Migration - 反映當前生產資料庫結構
        console.log('執行基線 Migration，建立當前資料庫結構');
        
        // 注意：這個 Migration 假設從空資料庫開始
        // 如果在已有資料的資料庫上執行，需要先檢查表是否存在
        
`;

    // 1. 創建 UUID 擴展
    migrationContent += `        // 確保 UUID 擴展存在\n`;
    migrationContent += `        await queryRunner.query(\`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"\`);\n\n`;

    // 2. 創建枚舉類型
    if (this.schemaReport.enums.length > 0) {
      migrationContent += `        // 創建枚舉類型\n`;
      for (const enumType of this.schemaReport.enums) {
        const enumValues = enumType.enum_values
          .map((v: string) => `'${v}'`)
          .join(', ');
        migrationContent += `        await queryRunner.query(\`CREATE TYPE "public"."${enumType.enum_name}" AS ENUM(${enumValues})\`);\n`;
      }
      migrationContent += `\n`;
    }

    // 3. 創建表
    migrationContent += `        // 創建表\n`;
    const sortedTables = Object.keys(this.schemaReport.tables).sort();

    for (const tableName of sortedTables) {
      const table = this.schemaReport.tables[tableName];
      migrationContent += `        // 創建 ${tableName} 表\n`;
      migrationContent += `        await queryRunner.query(\`CREATE TABLE "${tableName}" (\n`;

      const columnDefs = table.columns.map((col: any) => {
        let def = `            "${col.column_name}" `;

        // 處理資料類型
        if (col.data_type === 'uuid') {
          def += 'uuid';
        } else if (col.data_type === 'character varying') {
          def += col.character_maximum_length
            ? `character varying(${col.character_maximum_length})`
            : 'character varying';
        } else if (col.data_type === 'USER-DEFINED') {
          def += `"public"."${col.udt_name}"`;
        } else if (col.data_type === 'ARRAY') {
          def += `${col.udt_name}`;
        } else if (col.data_type === 'numeric') {
          def += col.numeric_precision
            ? `numeric(${col.numeric_precision},${col.numeric_scale})`
            : 'numeric';
        } else {
          def += col.data_type;
        }

        // NOT NULL
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }

        // DEFAULT
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }

        return def;
      });

      migrationContent += columnDefs.join(',\n');

      // 主鍵約束
      if (table.primaryKeys.length > 0) {
        migrationContent += `,\n            CONSTRAINT "PK_${tableName}" PRIMARY KEY ("${table.primaryKeys.join('", "')}")`;
      }

      migrationContent += `\n        )\`);\n\n`;
    }

    // 4. 創建外鍵約束
    if (this.schemaReport.foreignKeys.length > 0) {
      migrationContent += `        // 創建外鍵約束\n`;
      for (const fk of this.schemaReport.foreignKeys) {
        migrationContent += `        await queryRunner.query(\`ALTER TABLE "${fk.table_name}" ADD CONSTRAINT "${fk.constraint_name}" FOREIGN KEY ("${fk.column_name}") REFERENCES "${fk.foreign_table_name}"("${fk.foreign_column_name}") ON DELETE ${fk.delete_rule}\`);\n`;
      }
      migrationContent += `\n`;
    }

    // 5. 創建索引
    if (this.schemaReport.indexes.length > 0) {
      migrationContent += `        // 創建索引\n`;
      for (const index of this.schemaReport.indexes) {
        migrationContent += `        await queryRunner.query(\`${index.indexdef}\`);\n`;
      }
    }

    migrationContent += `    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 反向操作：刪除所有創建的結構
        console.log('回退基線 Migration');
        
        // 刪除外鍵約束
`;

    for (const fk of this.schemaReport.foreignKeys) {
      migrationContent += `        await queryRunner.query(\`ALTER TABLE "${fk.table_name}" DROP CONSTRAINT "${fk.constraint_name}"\`);\n`;
    }

    migrationContent += `
        // 刪除表
`;

    // 反向刪除表（避免外鍵依賴問題）
    for (const tableName of sortedTables.reverse()) {
      migrationContent += `        await queryRunner.query(\`DROP TABLE "${tableName}"\`);\n`;
    }

    migrationContent += `
        // 刪除枚舉類型
`;

    for (const enumType of this.schemaReport.enums) {
      migrationContent += `        await queryRunner.query(\`DROP TYPE "public"."${enumType.enum_name}"\`);\n`;
    }

    migrationContent += `    }
}
`;

    return {
      success: true,
      message: '基線 Migration 生成完成',
      migrationName: migrationName,
      migrationContent: migrationContent,
      timestamp: timestamp,
    };
  }

  async resetMigrationHistory() {
    if (!this.schemaReport) {
      throw new BadRequestException('請先執行資料庫結構分析');
    }

    console.log('🔄 開始重置 Migration 歷史...');

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      // 1. 清空 migrations 表
      if (this.schemaReport.migrationStatus.hasTable) {
        await queryRunner.query(`DELETE FROM migrations`);
        console.log('✅ 清空 migrations 表');
      } else {
        // 創建 migrations 表
        await queryRunner.query(`
          CREATE TABLE migrations (
            id SERIAL PRIMARY KEY,
            timestamp BIGINT NOT NULL,
            name VARCHAR NOT NULL
          )
        `);
        console.log('✅ 創建 migrations 表');
      }

      return {
        success: true,
        message: 'Migration 歷史重置完成',
        action: this.schemaReport.migrationStatus.hasTable
          ? 'cleared'
          : 'created',
      };
    } catch (error) {
      console.error('❌ 重置失敗:', error);
      throw new BadRequestException(`Migration 歷史重置失敗: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
