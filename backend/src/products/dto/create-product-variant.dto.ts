import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
  IsEnum,
  IsDateString,
  IsPositive,
  Min,
} from 'class-validator';
import { ProductStatus, InventoryType } from '../enums/product-status.enum';

export class CreateProductVariantDto {
  @IsString()
  productId: string;

  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  variantTitle?: string;

  @IsObject()
  specs: Record<string, string>;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  compareAtPrice?: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  weight?: number;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsEnum(InventoryType)
  inventoryType?: InventoryType;

  // 預購相關欄位
  @IsOptional()
  @IsNumber()
  @IsPositive()
  preorderLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  preorderSold?: number;

  @IsOptional()
  @IsDateString()
  preorderStartTime?: string;

  @IsOptional()
  @IsDateString()
  preorderEndTime?: string;

  @IsOptional()
  @IsDateString()
  expectedShipDate?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  preorderPrice?: number;

  @IsOptional()
  @IsString()
  preorderDescription?: string;
}
