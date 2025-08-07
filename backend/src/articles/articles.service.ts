import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Article, ArticleStatus } from './entities/article.entity';
import { ArticleCategory } from './entities/article-category.entity';
import { Author } from './entities/author.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { CreateArticleCategoryDto } from './dto/create-article-category.dto';
import { UpdateArticleCategoryDto } from './dto/update-article-category.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(ArticleCategory)
    private categoryRepository: Repository<ArticleCategory>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  // 文章相關方法
  async createArticle(createArticleDto: CreateArticleDto): Promise<Article> {
    // 檢查 slug 是否唯一
    const existingArticle = await this.articleRepository.findOne({
      where: { slug: createArticleDto.slug },
    });
    if (existingArticle) {
      throw new BadRequestException('文章 slug 已存在');
    }

    // 檢查作者是否存在
    const author = await this.authorRepository.findOne({
      where: { id: createArticleDto.authorId },
    });
    if (!author) {
      throw new NotFoundException('作者不存在');
    }

    // 檢查分類是否存在（如果有提供）
    if (createArticleDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: createArticleDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('分類不存在');
      }
    }

    // 計算預估閱讀時間
    const readingTime = this.calculateReadingTime(createArticleDto.content);

    const article = this.articleRepository.create({
      ...createArticleDto,
      readingTime,
      publishedAt:
        createArticleDto.status === ArticleStatus.PUBLISHED ? new Date() : null,
    });

    return await this.articleRepository.save(article);
  }

  async findAllArticles(queryDto: QueryArticleDto) {
    const {
      page,
      limit,
      search,
      categoryId,
      authorId,
      status,
      tags,
      sortBy,
      sortOrder,
    } = queryDto;

    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.category', 'category');

    // 搜尋條件
    if (search) {
      queryBuilder.andWhere(
        '(article.title ILIKE :search OR article.subtitle ILIKE :search OR article.excerpt ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('article.categoryId = :categoryId', { categoryId });
    }

    if (authorId) {
      queryBuilder.andWhere('article.authorId = :authorId', { authorId });
    }

    if (status) {
      queryBuilder.andWhere('article.status = :status', { status });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('article.tags && :tags', { tags });
    }

    // 排序
    if (sortBy === 'publishedAt') {
      queryBuilder.orderBy('article.publishedAt', sortOrder);
    } else if (sortBy === 'viewCount') {
      queryBuilder.orderBy('article.viewCount', sortOrder);
    } else {
      queryBuilder.orderBy(`article.${sortBy}`, sortOrder);
    }

    // 分頁
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [articles, total] = await queryBuilder.getManyAndCount();

    return {
      data: articles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findArticleBySlug(slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: ['author', 'category'],
    });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    return article;
  }

  async findArticleById(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author', 'category'],
    });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    return article;
  }

  async updateArticle(
    id: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.findArticleById(id);

    // 檢查 slug 是否唯一（如果有更新）
    if (updateArticleDto.slug && updateArticleDto.slug !== article.slug) {
      const existingArticle = await this.articleRepository.findOne({
        where: { slug: updateArticleDto.slug },
      });
      if (existingArticle) {
        throw new BadRequestException('文章 slug 已存在');
      }
    }

    // 更新閱讀時間（如果內容有變更）
    if (updateArticleDto.content) {
      updateArticleDto.readingTime = this.calculateReadingTime(
        updateArticleDto.content,
      );
    }

    // 處理發布狀態變更
    if (
      updateArticleDto.status === ArticleStatus.PUBLISHED &&
      article.status !== ArticleStatus.PUBLISHED
    ) {
      updateArticleDto.publishedAt = new Date();
    }

    Object.assign(article, updateArticleDto);
    return await this.articleRepository.save(article);
  }

  async removeArticle(id: string): Promise<void> {
    const article = await this.findArticleById(id);
    await this.articleRepository.remove(article);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.articleRepository.increment({ id }, 'viewCount', 1);
  }

  // 分類相關方法
  async createCategory(
    createCategoryDto: CreateArticleCategoryDto,
  ): Promise<ArticleCategory> {
    // 檢查 slug 是否唯一
    const existingCategory = await this.categoryRepository.findOne({
      where: { slug: createCategoryDto.slug },
    });
    if (existingCategory) {
      throw new BadRequestException('分類 slug 已存在');
    }

    // 檢查父分類是否存在（如果有提供）
    if (createCategoryDto.parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });
      if (!parentCategory) {
        throw new NotFoundException('父分類不存在');
      }
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAllCategories(): Promise<ArticleCategory[]> {
    return await this.categoryRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
      relations: ['parent', 'children'],
    });
  }

  async findCategoryBySlug(slug: string): Promise<ArticleCategory> {
    const category = await this.categoryRepository.findOne({
      where: { slug, isActive: true },
      relations: ['parent', 'children', 'articles'],
    });

    if (!category) {
      throw new NotFoundException('分類不存在');
    }

    return category;
  }

  async findCategoryById(id: string): Promise<ArticleCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'articles'],
    });

    if (!category) {
      throw new NotFoundException('分類不存在');
    }

    return category;
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateArticleCategoryDto,
  ): Promise<ArticleCategory> {
    const category = await this.findCategoryById(id);

    // 檢查 slug 是否唯一（如果有更新）
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });
      if (existingCategory) {
        throw new BadRequestException('分類 slug 已存在');
      }
    }

    // 檢查父分類是否存在（如果有更新）
    if (
      updateCategoryDto.parentId &&
      updateCategoryDto.parentId !== category.parentId
    ) {
      // 檢查不能將分類設為自己的子分類
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('不能將分類設為自己的父分類');
      }

      // 檢查父分類是否存在
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: updateCategoryDto.parentId },
      });
      if (!parentCategory) {
        throw new NotFoundException('父分類不存在');
      }

      // 檢查不能形成循環引用
      await this.checkCategoryCircularReference(id, updateCategoryDto.parentId);
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findCategoryById(id);

    // 檢查是否有關聯的文章
    const articleCount = await this.articleRepository.count({
      where: { categoryId: id },
    });

    if (articleCount > 0) {
      throw new BadRequestException(
        `無法刪除分類，該分類下還有 ${articleCount} 篇文章`,
      );
    }

    // 檢查是否有子分類
    const childrenCount = await this.categoryRepository.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        `無法刪除分類，該分類下還有 ${childrenCount} 個子分類`,
      );
    }

    await this.categoryRepository.remove(category);
  }

  async toggleCategoryStatus(id: string): Promise<ArticleCategory> {
    const category = await this.findCategoryById(id);

    // 如果要停用分類，檢查是否有已發布的文章
    if (category.isActive) {
      const publishedArticleCount = await this.articleRepository.count({
        where: {
          categoryId: id,
          status: ArticleStatus.PUBLISHED,
        },
      });

      if (publishedArticleCount > 0) {
        throw new BadRequestException(
          `無法停用分類，該分類下還有 ${publishedArticleCount} 篇已發布的文章`,
        );
      }
    }

    category.isActive = !category.isActive;
    return await this.categoryRepository.save(category);
  }

  // 檢查分類循環引用的輔助方法
  private async checkCategoryCircularReference(
    categoryId: string,
    parentId: string,
  ): Promise<void> {
    const visited = new Set<string>();
    let currentParentId = parentId;

    while (currentParentId) {
      if (visited.has(currentParentId)) {
        throw new BadRequestException('分類層級設定會形成循環引用');
      }

      if (currentParentId === categoryId) {
        throw new BadRequestException('分類層級設定會形成循環引用');
      }

      visited.add(currentParentId);

      const parent = await this.categoryRepository.findOne({
        where: { id: currentParentId },
        select: ['parentId'],
      });

      currentParentId = parent?.parentId;
    }
  }

  // 作者相關方法
  async createAuthor(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const author = this.authorRepository.create(createAuthorDto);
    return await this.authorRepository.save(author);
  }

  async findAllAuthors(): Promise<Author[]> {
    return await this.authorRepository.find({
      relations: ['user'],
      order: { name: 'ASC' },
    });
  }

  async findAuthorById(id: string): Promise<Author> {
    const author = await this.authorRepository.findOne({
      where: { id },
      relations: ['user', 'articles'],
    });

    if (!author) {
      throw new NotFoundException('作者不存在');
    }

    return author;
  }

  async updateAuthor(
    id: string,
    updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author> {
    const author = await this.findAuthorById(id);

    // 檢查 userId 是否存在且唯一（如果有更新）
    if (
      updateAuthorDto.userId &&
      updateAuthorDto.userId !== author.userId
    ) {
      const existingAuthor = await this.authorRepository.findOne({
        where: { userId: updateAuthorDto.userId },
      });
      if (existingAuthor) {
        throw new BadRequestException('該用戶已經關聯到其他作者');
      }
    }

    Object.assign(author, updateAuthorDto);
    return await this.authorRepository.save(author);
  }

  async removeAuthor(id: string): Promise<void> {
    const author = await this.findAuthorById(id);

    // 檢查作者是否有關聯的文章
    const articleCount = await this.articleRepository.count({
      where: { authorId: id },
    });

    if (articleCount > 0) {
      throw new BadRequestException(
        `無法刪除作者，該作者還有 ${articleCount} 篇文章。請先處理這些文章或轉移給其他作者。`,
      );
    }

    await this.authorRepository.remove(author);
  }

  async getAuthorStatistics(id: string) {
    const author = await this.findAuthorById(id);

    // 計算基本統計數據
    const totalArticles = await this.articleRepository.count({
      where: { authorId: id },
    });

    const publishedArticles = await this.articleRepository.count({
      where: { authorId: id, status: ArticleStatus.PUBLISHED },
    });

    // 計算總瀏覽次數
    const viewCountResult = await this.articleRepository
      .createQueryBuilder('article')
      .select('SUM(article.viewCount)', 'totalViews')
      .where('article.authorId = :authorId', { authorId: id })
      .getRawOne();

    const totalViews = parseInt(viewCountResult.totalViews) || 0;

    // 計算平均閱讀時間
    const readingTimeResult = await this.articleRepository
      .createQueryBuilder('article')
      .select('AVG(article.readingTime)', 'avgReadingTime')
      .where('article.authorId = :authorId', { authorId: id })
      .andWhere('article.status = :status', { status: ArticleStatus.PUBLISHED })
      .getRawOne();

    const averageReadingTime = parseInt(readingTimeResult.avgReadingTime) || 0;

    // 獲取最受歡迎的文章（前5篇）
    const popularArticles = await this.articleRepository.find({
      where: { authorId: id, status: ArticleStatus.PUBLISHED },
      order: { viewCount: 'DESC' },
      take: 5,
      select: ['id', 'title', 'slug', 'viewCount', 'publishedAt'],
    });

    // 獲取最近發布的文章（前5篇）
    const recentArticles = await this.articleRepository.find({
      where: { authorId: id, status: ArticleStatus.PUBLISHED },
      order: { publishedAt: 'DESC' },
      take: 5,
      select: ['id', 'title', 'slug', 'publishedAt', 'viewCount'],
    });

    // 計算月度文章發布統計（最近12個月）
    const monthlyStats = await this.articleRepository
      .createQueryBuilder('article')
      .select([
        'EXTRACT(YEAR FROM article.publishedAt) as year',
        'EXTRACT(MONTH FROM article.publishedAt) as month',
        'COUNT(*) as count',
      ])
      .where('article.authorId = :authorId', { authorId: id })
      .andWhere('article.status = :status', { status: ArticleStatus.PUBLISHED })
      .andWhere('article.publishedAt >= :date', {
        date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 過去一年
      })
      .groupBy('EXTRACT(YEAR FROM article.publishedAt)')
      .addGroupBy('EXTRACT(MONTH FROM article.publishedAt)')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .getRawMany();

    return {
      author: {
        id: author.id,
        name: author.name,
        avatar: author.avatar,
        bio: author.bio,
      },
      statistics: {
        totalArticles,
        publishedArticles,
        draftArticles: totalArticles - publishedArticles,
        totalViews,
        averageReadingTime,
        averageViewsPerArticle: publishedArticles > 0 ? Math.round(totalViews / publishedArticles) : 0,
      },
      popularArticles,
      recentArticles,
      monthlyStats: monthlyStats.map((stat) => ({
        year: parseInt(stat.year),
        month: parseInt(stat.month),
        count: parseInt(stat.count),
        date: `${stat.year}-${stat.month.toString().padStart(2, '0')}`,
      })),
    };
  }

  // 輔助方法
  private calculateReadingTime(content: any): number {
    if (!content || !content.blocks) return 0;

    let wordCount = 0;
    content.blocks.forEach((block: any) => {
      if (block.type === 'paragraph' && block.data?.text) {
        // 簡單的字數統計（可以根據需要改進）
        wordCount += block.data.text.split(' ').length;
      }
    });

    // 假設每分鐘閱讀 200 字
    return Math.ceil(wordCount / 200) || 1;
  }

  async getFeaturedArticles(limit: number = 5): Promise<Article[]> {
    return await this.articleRepository.find({
      where: { status: ArticleStatus.PUBLISHED },
      relations: ['author', 'category'],
      order: { viewCount: 'DESC', publishedAt: 'DESC' },
      take: limit,
    });
  }

  async getRelatedArticles(
    articleId: string,
    limit: number = 5,
  ): Promise<Article[]> {
    const article = await this.findArticleById(articleId);

    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.category', 'category')
      .where('article.id != :articleId', { articleId })
      .andWhere('article.status = :status', { status: ArticleStatus.PUBLISHED })
      .orderBy('article.publishedAt', 'DESC')
      .take(limit);

    // 優先顯示同分類的文章
    if (article.categoryId) {
      queryBuilder.andWhere('article.categoryId = :categoryId', {
        categoryId: article.categoryId,
      });
    }

    const relatedArticles = await queryBuilder.getMany();

    // 如果同分類文章不足，補充其他文章
    if (relatedArticles.length < limit) {
      const additionalArticles = await this.articleRepository.find({
        where: {
          status: ArticleStatus.PUBLISHED,
          // 排除已有的文章
          id: Not(In([articleId, ...relatedArticles.map((a) => a.id)])),
        },
        relations: ['author', 'category'],
        order: { publishedAt: 'DESC' },
        take: limit - relatedArticles.length,
      });

      relatedArticles.push(...additionalArticles);
    }

    return relatedArticles;
  }
}
