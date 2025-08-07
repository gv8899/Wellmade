import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsInt,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateArticleCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: '分類名稱不能為空' })
  @MaxLength(100, { message: '分類名稱長度不能超過100字符' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Slug 不能為空' })
  @MaxLength(100, { message: 'Slug 長度不能超過100字符' })
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '封面圖片URL長度不能超過500字符' })
  coverImage?: string;

  @IsOptional()
  @IsUUID('4', { message: '父分類ID格式不正確' })
  parentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Meta標題長度不能超過200字符' })
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Meta描述長度不能超過300字符' })
  metaDescription?: string;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
