import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FindBrandsDto {
  @ApiProperty({ description: '分頁跳過幾筆', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  skip?: number;

  @ApiProperty({ description: '分頁取得幾筆', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  take?: number;

  @ApiProperty({ description: '排序欄位', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: '排序方向 (ASC/DESC)', required: false })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC';

  @ApiProperty({ description: '品牌狀態', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '關鍵字搜尋', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
