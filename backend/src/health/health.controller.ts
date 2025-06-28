import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('健康檢查')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '基本健康檢查' })
  @ApiResponse({ status: 200, description: '服務正常運行' })
  async checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'wellmade-backend',
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  @Get('db')
  @Public()
  @ApiOperation({ summary: '資料庫健康檢查' })
  @ApiResponse({ status: 200, description: '資料庫連線正常' })
  @ApiResponse({ status: 503, description: '資料庫連線失敗' })
  async checkDatabase() {
    try {
      // 執行簡單的查詢來檢查資料庫連線
      await this.dataSource.query('SELECT 1');
      
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: '就緒檢查' })
  @ApiResponse({ status: 200, description: '服務已就緒' })
  @ApiResponse({ status: 503, description: '服務尚未就緒' })
  async checkReadiness() {
    try {
      // 檢查所有關鍵服務是否就緒
      const dbCheck = await this.dataSource.query('SELECT 1');
      
      return {
        status: 'ready',
        services: {
          database: 'ready',
          api: 'ready',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'not_ready',
        services: {
          database: 'not_ready',
          api: 'ready',
        },
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}