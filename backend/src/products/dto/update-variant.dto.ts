import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
  Min,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ProductStatus, InventoryType } from '../enums/product-status.enum';

export class UpdateVariantDto {
  @ApiPropertyOptional({ description: 'SKU (Stock Keeping Unit)' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: '是否自動生成 SKU' })
  @IsOptional()
  @IsBoolean()
  autoGenerateSku?: boolean;

  @ApiPropertyOptional({ description: '變體名稱' })
  @IsOptional()
  @IsString()
  variantTitle?: string;

  @ApiPropertyOptional({ 
    description: '規格',
    example: { "顏色": "白色", "尺寸": "M" }
  })
  @IsOptional()
  @IsObject()
  specs?: Record<string, string>;

  @ApiPropertyOptional({ description: '價格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: '原價/市場價' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ description: '庫存' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: '變體專屬圖片URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: '排序順序' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '是否啟用' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '重量' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: '條碼' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ 
    description: '產品狀態',
    enum: ProductStatus
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ 
    description: '庫存類型',
    enum: InventoryType
  })
  @IsOptional()
  @IsEnum(InventoryType)
  inventoryType?: InventoryType;

  @ApiPropertyOptional({ description: '預購限制數量' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preorderLimit?: number;

  @ApiPropertyOptional({ description: '已預購數量' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preorderSold?: number;

  @ApiPropertyOptional({ description: '預購開始時間' })
  @IsOptional()
  @IsDateString()
  preorderStartTime?: string;

  @ApiPropertyOptional({ description: '預購結束時間' })
  @IsOptional()
  @IsDateString()
  preorderEndTime?: string;

  @ApiPropertyOptional({ description: '預計出貨日期' })
  @IsOptional()
  @IsDateString()
  expectedShipDate?: string;

  @ApiPropertyOptional({ description: '預購價格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preorderPrice?: number;

  @ApiPropertyOptional({ description: '預購描述' })
  @IsOptional()
  @IsString()
  preorderDescription?: string;
}