import { IsOptional, IsEnum, IsBoolean, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { BannerPosition } from '../banner.entity';

export class QueryBannerDto {
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeInactive?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  take?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  onlyCurrentlyActive?: boolean; // 只返回當前時間有效的 Banner
}
