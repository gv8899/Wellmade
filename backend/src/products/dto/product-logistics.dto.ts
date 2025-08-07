import { IsArray, IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryMethod, DeliveryRestrictionType } from '../interfaces/product-logistics.interface';

// 物理屬性 DTO
export class PhysicalAttributesDto {
  @ApiProperty({ description: '重量（公斤）', required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ description: '尺寸（公分）', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;

  @ApiProperty({ description: '是否易碎', required: false })
  @IsOptional()
  @IsBoolean()
  isFragile?: boolean;

  @ApiProperty({ description: '是否大型商品', required: false })
  @IsOptional()
  @IsBoolean()
  isOversized?: boolean;

  @ApiProperty({ description: '是否需要冷藏', required: false })
  @IsOptional()
  @IsBoolean()
  requiresRefrigeration?: boolean;

  @ApiProperty({ description: '是否為危險品', required: false })
  @IsOptional()
  @IsBoolean()
  isDangerous?: boolean;

  @ApiProperty({ description: '是否為高價值商品', required: false })
  @IsOptional()
  @IsBoolean()
  isHighValue?: boolean;
}

// 尺寸 DTO
export class DimensionsDto {
  @ApiProperty({ description: '長度（公分）' })
  @IsNumber()
  length: number;

  @ApiProperty({ description: '寬度（公分）' })
  @IsNumber()
  width: number;

  @ApiProperty({ description: '高度（公分）' })
  @IsNumber()
  height: number;
}

// 特殊配送要求 DTO
export class SpecialRequirementsDto {
  @ApiProperty({ description: '是否需要簽收', required: false })
  @IsOptional()
  @IsBoolean()
  signatureRequired?: boolean;

  @ApiProperty({ description: '是否需要保險', required: false })
  @IsOptional()
  @IsBoolean()
  insuranceRequired?: boolean;

  @ApiProperty({ description: '是否需要預約配送', required: false })
  @IsOptional()
  @IsBoolean()
  appointmentDelivery?: boolean;

  @ApiProperty({ description: '是否需要特殊包裝', required: false })
  @IsOptional()
  @IsBoolean()
  fragileHandling?: boolean;
}

// 配送限制 DTO
export class DeliveryRestrictionDto {
  @ApiProperty({ description: '是否受限' })
  @IsBoolean()
  restricted: boolean;

  @ApiProperty({ description: '限制原因', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

// 產品物流配置 DTO
export class ProductLogisticsConfigDto {
  @ApiProperty({ 
    description: '支援的配送方式',
    enum: DeliveryMethod,
    isArray: true
  })
  @IsArray()
  @IsEnum(DeliveryMethod, { each: true })
  supportedDeliveryMethods: DeliveryMethod[];

  @ApiProperty({ 
    description: '配送限制原因',
    required: false
  })
  @IsOptional()
  @IsObject()
  deliveryRestrictions?: Record<DeliveryMethod, DeliveryRestrictionDto>;

  @ApiProperty({ description: '商品物理特性', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PhysicalAttributesDto)
  physicalAttributes?: PhysicalAttributesDto;

  @ApiProperty({ description: '特殊配送要求', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpecialRequirementsDto)
  specialRequirements?: SpecialRequirementsDto;
}

// 購物車配送可用性檢查請求 DTO
export class CheckCartLogisticsDto {
  @ApiProperty({ 
    description: '購物車項目列表',
    type: [Object]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  cartItems: CartItemDto[];
}

// 購物車項目 DTO
export class CartItemDto {
  @ApiProperty({ description: '產品ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: '變體ID', required: false })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ description: '數量' })
  @IsNumber()
  quantity: number;
}

// 配送可用性回應 DTO
export class CartDeliveryAvailabilityDto {
  @ApiProperty({ description: '配送方式', enum: DeliveryMethod })
  @IsEnum(DeliveryMethod)
  method: DeliveryMethod;

  @ApiProperty({ description: '是否可用' })
  @IsBoolean()
  available: boolean;

  @ApiProperty({ 
    description: '限制列表',
    type: [Object]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryRestrictionInfoDto)
  restrictions: DeliveryRestrictionInfoDto[];
}

// 配送限制資訊 DTO
export class DeliveryRestrictionInfoDto {
  @ApiProperty({ description: '產品ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: '產品名稱' })
  @IsString()
  productName: string;

  @ApiProperty({ description: '限制類型', enum: DeliveryRestrictionType })
  @IsEnum(DeliveryRestrictionType)
  restrictionType: DeliveryRestrictionType;

  @ApiProperty({ description: '限制原因' })
  @IsString()
  reason: string;
}

// 配送方式配置 DTO
export class DeliveryMethodConfigDto {
  @ApiProperty({ description: '配送方式', enum: DeliveryMethod })
  @IsEnum(DeliveryMethod)
  method: DeliveryMethod;

  @ApiProperty({ description: '配送方式名稱' })
  @IsString()
  name: string;

  @ApiProperty({ description: '配送方式描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '基本運費' })
  @IsNumber()
  baseFee: number;

  @ApiProperty({ description: '預估配送天數' })
  @IsNumber()
  estimatedDays: number;

  @ApiProperty({ description: '是否啟用' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ 
    description: '全域限制',
    type: 'object',
    additionalProperties: true
  })
  @IsObject()
  globalLimits: any;
}