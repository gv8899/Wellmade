import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { Banner } from './banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner])],
  controllers: [BannersController],
  providers: [BannersService],
  exports: [BannersService], // 導出服務以供其他模組使用
})
export class BannersModule {}