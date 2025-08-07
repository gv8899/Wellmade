import { Controller, Post, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.enum';
import { DatabaseAnalysisService } from './database-analysis.service';

@ApiTags('admin')
@Controller('admin/database')
@Roles(UserRole.ADMIN)
export class DatabaseAnalysisController {
  constructor(
    private readonly databaseAnalysisService: DatabaseAnalysisService,
  ) {}

  @ApiOperation({ summary: '分析資料庫結構' })
  @ApiResponse({ status: 200, description: '分析完成' })
  @Post('analyze-schema')
  @HttpCode(HttpStatus.OK)
  async analyzeSchema() {
    return this.databaseAnalysisService.analyzeSchema();
  }

  @ApiOperation({ summary: '獲取資料庫結構分析報告' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  @Get('schema-report')
  async getSchemaReport() {
    return this.databaseAnalysisService.getSchemaReport();
  }

  @ApiOperation({ summary: '生成基線 Migration' })
  @ApiResponse({ status: 200, description: '生成成功' })
  @Post('generate-baseline-migration')
  @HttpCode(HttpStatus.OK)
  async generateBaselineMigration() {
    return this.databaseAnalysisService.generateBaselineMigration();
  }

  @ApiOperation({ summary: '重置 Migration 歷史' })
  @ApiResponse({ status: 200, description: '重置成功' })
  @Post('reset-migration-history')
  @HttpCode(HttpStatus.OK)
  async resetMigrationHistory() {
    return this.databaseAnalysisService.resetMigrationHistory();
  }
}
