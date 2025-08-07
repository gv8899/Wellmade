import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto';
import { IsOptional, IsInt, IsDate } from 'class-validator';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @IsOptional()
  @IsInt()
  readingTime?: number;

  @IsOptional()
  @IsDate()
  publishedAt?: Date;
}
