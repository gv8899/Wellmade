import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { LogisticsController } from './logistics.controller';
import { NewebpayLogisticsService } from './newebpay-logistics.service';

import { LogisticsOrder } from './entities/logistics-order.entity';
import { LogisticsStatusRecord } from './entities/logistics-status-record.entity';
import { ConvenienceStore } from './entities/convenience-store.entity';

/**
 * 物流模組
 * 整合藍新金流物流服務的所有功能
 */
@Module({
  imports: [
    // 匯入 ConfigModule 以使用環境變數
    ConfigModule,
    
    // 匯入 TypeORM 實體
    TypeOrmModule.forFeature([
      LogisticsOrder,
      LogisticsStatusRecord,
      ConvenienceStore,
    ]),
  ],
  controllers: [
    LogisticsController,
  ],
  providers: [
    NewebpayLogisticsService,
  ],
  exports: [
    // 匯出服務供其他模組使用
    NewebpayLogisticsService,
  ],
})
export class LogisticsModule {}