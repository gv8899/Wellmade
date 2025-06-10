import { IsOptional, IsString, IsInt, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FindProductsDto {
  // 分頁參數
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  skip?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50) // 限制最大返回數量，避免過大查詢
  @Type(() => Number)
  take?: number = 10;

  // 排序參數
  @IsOptional()
  @IsString()
  @IsIn(['name', 'price', 'createdAt'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';

  // 篩選參數
  @IsOptional()
  @IsString()
  category?: string;
  
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
