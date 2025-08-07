import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsUUID,
  IsObject,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ArticleStatus, ArticleContent } from '../entities/article.entity';

export class CreateArticleDto {
  @IsString()
  @MinLength(1, { message: '標題不能為空' })
  @MaxLength(200, { message: '標題長度不能超過200字符' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: '副標題長度不能超過300字符' })
  subtitle?: string;

  @IsString()
  @MinLength(1, { message: 'Slug 不能為空' })
  @MaxLength(200, { message: 'Slug 長度不能超過200字符' })
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '封面圖片URL長度不能超過500字符' })
  coverImage?: string;

  @IsObject()
  content: ArticleContent;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsUUID('4', { message: '分類ID格式不正確' })
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Meta標題長度不能超過200字符' })
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Meta描述長度不能超過300字符' })
  metaDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Canonical URL長度不能超過500字符' })
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '社交分享圖片URL長度不能超過500字符' })
  socialImage?: string;

  @IsUUID('4', { message: '作者ID格式不正確' })
  authorId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  featuredProducts?: string[];
}
