import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { CreateArticleCategoryDto } from './dto/create-article-category.dto';
import { UpdateArticleCategoryDto } from './dto/update-article-category.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.enum';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // 文章相關端點
  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  createArticle(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.createArticle(createArticleDto);
  }

  @Get()
  @Public()
  findAllArticles(@Query() queryDto: QueryArticleDto) {
    return this.articlesService.findAllArticles(queryDto);
  }

  @Get('featured')
  @Public()
  getFeaturedArticles(@Query('limit') limit?: number) {
    return this.articlesService.getFeaturedArticles(limit);
  }

  @Get('id/:id')
  @Public()
  findArticleById(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.findArticleById(id);
  }

  @Get(':slug')
  @Public()
  findArticleBySlug(@Param('slug') slug: string) {
    return this.articlesService.findArticleBySlug(slug);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  updateArticle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.updateArticle(id, updateArticleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  removeArticle(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.removeArticle(id);
  }

  @Post(':id/view')
  @Public()
  incrementViewCount(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.incrementViewCount(id);
  }

  @Get(':id/related')
  @Public()
  getRelatedArticles(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: number,
  ) {
    return this.articlesService.getRelatedArticles(id, limit);
  }
}

@Controller('article-categories')
export class ArticleCategoriesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  createCategory(@Body() createCategoryDto: CreateArticleCategoryDto) {
    return this.articlesService.createCategory(createCategoryDto);
  }

  @Get()
  @Public()
  findAllCategories() {
    return this.articlesService.findAllCategories();
  }

  @Get(':slug')
  @Public()
  findCategoryBySlug(@Param('slug') slug: string) {
    return this.articlesService.findCategoryBySlug(slug);
  }

  @Get(':slug/articles')
  @Public()
  async findArticlesByCategory(
    @Param('slug') slug: string,
    @Query() queryDto: QueryArticleDto,
  ) {
    const category = await this.articlesService.findCategoryBySlug(slug);
    return this.articlesService.findAllArticles({
      ...queryDto,
      categoryId: category.id,
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateArticleCategoryDto,
  ) {
    return this.articlesService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  removeCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.removeCategory(id);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  toggleCategoryStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.toggleCategoryStatus(id);
  }
}

@Controller('authors')
export class AuthorsController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  createAuthor(@Body() createAuthorDto: CreateAuthorDto) {
    return this.articlesService.createAuthor(createAuthorDto);
  }

  @Get()
  @Public()
  findAllAuthors() {
    return this.articlesService.findAllAuthors();
  }

  @Get(':id')
  @Public()
  findAuthorById(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.findAuthorById(id);
  }

  @Get(':id/articles')
  @Public()
  async findArticlesByAuthor(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() queryDto: QueryArticleDto,
  ) {
    const author = await this.articlesService.findAuthorById(id);
    return this.articlesService.findAllArticles({
      ...queryDto,
      authorId: author.id,
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  updateAuthor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.articlesService.updateAuthor(id, updateAuthorDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  removeAuthor(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.removeAuthor(id);
  }

  @Get(':id/statistics')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  getAuthorStatistics(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.getAuthorStatistics(id);
  }
}
