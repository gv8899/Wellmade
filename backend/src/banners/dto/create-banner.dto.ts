import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsDateString, IsUrl, MaxLength } from 'class-validator';
import { BannerLinkType, BannerPosition } from '../banner.entity';

export class CreateBannerDto {
  @IsString()
  @MaxLength(255, { message: '標題長度不能超過 255 字元' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  mobileImageUrl?: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsEnum(BannerLinkType, { message: '無效的連結類型' })
  linkType?: BannerLinkType;

  @IsOptional()
  @IsEnum(BannerPosition, { message: '無效的顯示位置' })
  position?: BannerPosition;

  @IsOptional()
  @IsNumber({}, { message: '排序必須是數字' })
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString({}, { message: '請提供有效的開始日期' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: '請提供有效的結束日期' })
  endDate?: string;
}