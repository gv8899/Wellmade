import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ description: '品牌名稱 (必填)' })
  @IsNotEmpty({ message: '品牌名稱不可為空' })
  @IsString()
  name: string;

  @ApiProperty({ description: '品牌標誌圖片網址 (選填)', required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @Matches(/^(https?:\/\/)?(localhost|127\.0\.0\.1|[\w\.-]+\.[a-zA-Z]{2,})(:\d{1,5})?(\/.*)?$/, {
    message: '請提供有效的網址'
  })
  logoUrl?: string;

  @ApiProperty({ description: '品牌描述 (選填)', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '品牌狀態', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
