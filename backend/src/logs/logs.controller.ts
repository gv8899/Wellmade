import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Public()
  @Post()
  async createLog(@Body() createLogDto: CreateLogDto) {
    console.log('📥 收到前端日誌請求:', createLogDto);
    try {
      const result = await this.logsService.create(createLogDto);
      console.log('✅ 日誌保存成功:', result.id);
      return result;
    } catch (error) {
      console.error('❌ 日誌保存失敗:', error);
      throw error;
    }
  }

  @Public()
  @Get()
  async getLogs(
    @Query('level') level?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.logsService.findAll(level, limit || 50, page || 1);
  }
}
