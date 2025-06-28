import {
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  Min,
  ValidateNested,
  IsObject,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { KeyFeature, FeatureDetail, FAQItem } from '../product.entity';
import { CreateVariantDto } from './create-variant.dto';
import { ProductStatus } from '../enums/product-status.enum';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  categoryId?: string; // 新的分類ID欄位

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsString()
  @IsOptional()
  masterSku?: string;

  @IsBoolean()
  @IsOptional()
  autoGenerateMasterSku?: boolean;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsBoolean()
  @IsOptional()
  isContainer?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => KeyFeatureDto)
  keyFeatures?: KeyFeature[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FeatureDetailDto)
  featureDetails?: FeatureDetail[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FAQItemDto)
  faqs?: FAQItem[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  specTemplate?: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];
}

// 關鍵特性 DTO
export class KeyFeatureDto implements KeyFeature {
  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

// 特性詳情 DTO
export class FeatureDetailDto implements FeatureDetail {
  @IsString()
  @IsEnum(['image', 'video'])
  type: 'image' | 'video';

  @IsString()
  @IsNotEmpty()
  src: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  @IsEnum(['left', 'right'])
  direction?: 'left' | 'right';
}

// 常見問答 DTO
export class FAQItemDto implements FAQItem {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
