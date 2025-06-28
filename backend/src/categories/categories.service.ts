import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { Product } from '../products/product.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // 創建分類
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // 檢查slug是否已存在
    const existingCategory = await this.categoryRepository.findOne({
      where: { slug: createCategoryDto.slug },
    });

    if (existingCategory) {
      throw new ConflictException('Slug已存在');
    }

    // 如果有父分類，檢查是否存在
    if (createCategoryDto.parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });

      if (!parentCategory) {
        throw new NotFoundException('父分類不存在');
      }

      // 防止循環引用
      if (parentCategory.parentId === createCategoryDto.parentId) {
        throw new BadRequestException('不能設定自己為父分類');
      }
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  // 獲取所有分類（分頁）
  async findAll(queryDto: QueryCategoryDto): Promise<{
    categories: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, parentId, isActive, page, limit, sortBy, sortOrder } =
      queryDto;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('category.children', 'children');

    // 搜尋條件
    if (search) {
      queryBuilder.andWhere(
        '(category.name ILIKE :search OR category.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 父分類篩選
    if (parentId) {
      queryBuilder.andWhere('category.parentId = :parentId', { parentId });
    } else if (parentId === null) {
      queryBuilder.andWhere('category.parentId IS NULL');
    }

    // 啟用狀態篩選
    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }

    // 排序
    const sortField =
      sortBy === 'name'
        ? 'category.name'
        : sortBy === 'createdAt'
          ? 'category.createdAt'
          : 'category.sortOrder';
    queryBuilder.orderBy(sortField, sortOrder);

    // 分頁
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [categories, total] = await queryBuilder.getManyAndCount();

    return {
      categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 獲取分類樹狀結構
  async findTree(): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      relations: ['children'],
      order: { sortOrder: 'ASC' },
    });

    return this.buildTree(categories);
  }

  // 獲取單一分類
  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('分類不存在');
    }

    return category;
  }

  // 根據slug獲取分類
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('分類不存在');
    }

    return category;
  }

  // 更新分類
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    // 檢查slug是否重複
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });

      if (existingCategory) {
        throw new ConflictException('Slug已存在');
      }
    }

    // 檢查父分類
    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('不能設定自己為父分類');
      }

      const parentCategory = await this.categoryRepository.findOne({
        where: { id: updateCategoryDto.parentId },
      });

      if (!parentCategory) {
        throw new NotFoundException('父分類不存在');
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  // 刪除分類
  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // 檢查是否有子分類
    const childrenCount = await this.categoryRepository.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestException('無法刪除有子分類的分類');
    }

    // 檢查是否有產品使用此分類
    const productCount = await this.productRepository.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        '無法刪除有產品關聯的分類，請先將產品移至其他分類或刪除產品',
      );
    }

    await this.categoryRepository.remove(category);
  }

  // 批量更新排序
  async updateSortOrder(
    updates: { id: string; sortOrder: number }[],
  ): Promise<void> {
    for (const update of updates) {
      await this.categoryRepository.update(update.id, {
        sortOrder: update.sortOrder,
      });
    }
  }

  // 構建樹狀結構
  private buildTree(
    categories: Category[],
    parentId: string | null = null,
  ): Category[] {
    const tree: Category[] = [];

    for (const category of categories) {
      if (category.parentId === parentId) {
        const children = this.buildTree(categories, category.id);
        if (children.length > 0) {
          category.children = children;
        }
        tree.push(category);
      }
    }

    return tree.sort((a, b) => a.sortOrder - b.sortOrder);
  }
}
