import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, IsNotEmpty, Min, ValidateNested, IsObject, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { KeyFeature, FeatureDetail } from '../product.entity';

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
  @IsNotEmpty()
  category: string;
  
  @IsString()
  @IsOptional()
  brandId?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

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
