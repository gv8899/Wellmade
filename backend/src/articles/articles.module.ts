import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesService } from './articles.service';
import {
  ArticlesController,
  ArticleCategoriesController,
  AuthorsController,
} from './articles.controller';
import { Article } from './entities/article.entity';
import { ArticleCategory } from './entities/article-category.entity';
import { Author } from './entities/author.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Article, ArticleCategory, Author])],
  controllers: [
    ArticlesController,
    ArticleCategoriesController,
    AuthorsController,
  ],
  providers: [ArticlesService],
  exports: [ArticlesService, TypeOrmModule],
})
export class ArticlesModule {}
