import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
  IsNotEmpty,
  Min,
  IsUUID,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ProductStatus, InventoryType } from '../enums/product-status.enum';

export class CreateVariantDto {
  @ApiPropertyOptional({ description: 'SKU (Stock Keeping Unit) - 如果未提供或設定 autoGenerateSku 為 true，將自動生成' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: '是否自動生成 SKU', default: false })
  @IsOptional()
  @IsBoolean()
  autoGenerateSku?: boolean;

  @ApiPropertyOptional({ description: '變體名稱' })
  @IsOptional()
  @IsString()
  variantTitle?: string;

  @ApiProperty({ 
    description: '規格',
    example: { "顏色": "白色", "尺寸": "M" }
  })
  @IsObject()
  specs: Record<string, string>;

  @ApiProperty({ description: '價格' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: '原價/市場價' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiProperty({ description: '庫存', default: 0 })
  @IsNumber()
  @Min(0)
  stock: number = 0;

  @ApiPropertyOptional({ description: '變體專屬圖片URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: '排序順序', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number = 0;

  @ApiPropertyOptional({ description: '是否啟用', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: '重量' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: '條碼' })
  @IsOptional()
  @IsString()
  barcode?: string;

  // 產品狀態相關欄位
  @ApiPropertyOptional({ 
    description: '產品狀態',
    enum: ProductStatus,
    default: ProductStatus.IN_STOCK 
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.IN_STOCK;

  @ApiPropertyOptional({ 
    description: '庫存類型',
    enum: InventoryType,
    default: InventoryType.PHYSICAL 
  })
  @IsOptional()
  @IsEnum(InventoryType)
  inventoryType?: InventoryType = InventoryType.PHYSICAL;

  // 預購相關欄位
  @ApiPropertyOptional({ description: '預購限制數量' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preorderLimit?: number;

  @ApiPropertyOptional({ description: '已預購數量', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preorderSold?: number = 0;

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

export class CreateProductVariantDto extends CreateVariantDto {
  @ApiPropertyOptional({ description: '產品ID (由控制器自動設置)' })
  @IsOptional()
  @IsUUID()
  productId?: string;
}