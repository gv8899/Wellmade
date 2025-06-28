import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { Brand } from '../brands/brand.entity';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { CreateBrandDto } from '../brands/dto/create-brand.dto';
import { UpdateBrandDto } from '../brands/dto/update-brand.dto';
import { FindProductsDto } from '../products/dto/find-products.dto';
import { UserRole } from '../users/user.enum';
import { UploadService } from './upload.service';
import { ProductVariantsService } from '../products/product-variants.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private uploadService: UploadService,
    private variantsService: ProductVariantsService,
  ) {}

  // ========== 產品管理 ==========

  async getAllProducts(queryParams: FindProductsDto = {}) {
    const {
      skip = 0,
      take = 20,
      sortBy = 'createdAt',
      order = 'DESC',
      category,
      brandId,
      search,
      // Admin 版本：不過濾 isActive，顯示所有產品
    } = queryParams;

    const whereConditions: any = {};

    // 處理分類篩選，支援新舊兩種方式
    if (category) {
      // 用slug查詢分類
      const categoryEntity = await this.categoryRepository.findOne({
        where: { slug: category },
      });

      if (categoryEntity) {
        whereConditions.categoryId = categoryEntity.id;
      }
    }

    if (brandId) {
      whereConditions.brandId = brandId;
    }

    if (search) {
      whereConditions.name = `%${search}%`;
    }

    const [items, total] = await this.productRepository.findAndCount({
      where: whereConditions,
      relations: ['brand', 'categoryRelation'], // 添加分類關聯
      order: { [sortBy]: order },
      skip,
      take,
    });

    return { items, total, page: Math.floor(skip / take) + 1, limit: take };
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['brand', 'categoryRelation'], // 確保分類關聯一致
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    console.log('AdminService - Creating product with data:', createProductDto);

    // 檢查品牌是否存在
    if (createProductDto.brandId) {
      const brand = await this.brandRepository.findOne({
        where: { id: createProductDto.brandId },
      });
      if (!brand) {
        console.error(`Brand with ID ${createProductDto.brandId} not found`);
        throw new BadRequestException(
          `品牌不存在 (ID: ${createProductDto.brandId})`,
        );
      }
    }

    // 檢查分類是否存在
    if (createProductDto.categoryId) {
      console.log('AdminService - 檢查分類 ID:', createProductDto.categoryId);
      const category = await this.categoryRepository.findOne({
        where: { id: createProductDto.categoryId },
      });
      if (!category) {
        console.error(
          `Category with ID ${createProductDto.categoryId} not found`,
        );

        // 列出所有可用的分類來幫助調試
        const allCategories = await this.categoryRepository.find({
          select: ['id', 'name', 'isActive'],
        });
        console.log('AdminService - 所有可用分類:', allCategories);

        throw new BadRequestException(
          `分類不存在 (ID: ${createProductDto.categoryId})`,
        );
      }
      console.log('AdminService - Category validation passed:', category.name);
    } else {
      console.error('AdminService - categoryId is required but not provided');
      throw new BadRequestException('請選擇產品分類');
    }

    try {
      // 分離變體資料和主 SKU 設定，像 Products Service 一樣處理
      const { variants, autoGenerateMasterSku, ...productDataWithoutVariants } =
        createProductDto;
      console.log('AdminService - 分離變體資料:', {
        hasVariants: variants?.length > 0,
        variantCount: variants?.length || 0,
        autoGenerateMasterSku,
      });

      const product = this.productRepository.create(productDataWithoutVariants);
      const savedProduct = await this.productRepository.save(product);
      console.log(
        'AdminService - Product created successfully:',
        savedProduct.id,
      );

      // 如果有變體資料，創建變體
      if (variants && variants.length > 0) {
        console.log('AdminService - 開始創建變體...');
        await this.variantsService.createBulk(savedProduct.id, variants);
        console.log('AdminService - 變體創建完成');
      } else {
        console.log('AdminService - 沒有變體資料，跳過變體創建');
      }

      // 重新載入關聯資料以確保返回完整的產品資訊
      return this.productRepository.findOne({
        where: { id: savedProduct.id },
        relations: ['brand', 'categoryRelation', 'variants'],
      });
    } catch (error) {
      console.error('AdminService - Error creating product:', error);
      throw new BadRequestException('創建產品時發生錯誤，請檢查資料格式');
    }
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    console.log(`Admin Service - Updating product ${id}:`, {
      updateData: updateProductDto,
      categoryId: updateProductDto.categoryId,
    });

    // 排除變體欄位，變體應該通過專門的變體 API 管理
    const { variants, autoGenerateMasterSku, ...cleanUpdateData } =
      updateProductDto;
    console.log('Admin Service - 已排除變體欄位，純產品數據:', cleanUpdateData);

    // 檢查產品是否存在
    const existingProduct = await this.productRepository.findOne({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    console.log(`Admin Service - Original product:`, {
      id: existingProduct.id,
      name: existingProduct.name,
      originalCategoryId: existingProduct.categoryId,
    });

    // 如果更新品牌ID，檢查品牌是否存在
    if (cleanUpdateData.brandId) {
      const brand = await this.brandRepository.findOne({
        where: { id: cleanUpdateData.brandId },
      });
      if (!brand) {
        throw new NotFoundException(
          `Brand with ID ${cleanUpdateData.brandId} not found`,
        );
      }
    }

    // 如果更新分類ID，檢查分類是否存在
    if (cleanUpdateData.categoryId !== undefined) {
      if (
        cleanUpdateData.categoryId &&
        cleanUpdateData.categoryId.trim() !== ''
      ) {
        const category = await this.categoryRepository.findOne({
          where: { id: cleanUpdateData.categoryId },
        });
        if (!category) {
          throw new NotFoundException(
            `Category with ID ${cleanUpdateData.categoryId} not found`,
          );
        }
      } else {
        // 如果 categoryId 為空字串或 null，清除分類關聯
        cleanUpdateData.categoryId = null;
      }
    }

    console.log(`Admin Service - Before QueryBuilder update:`, {
      id,
      updateData: cleanUpdateData,
    });

    // 使用 QueryBuilder 強制更新 categoryId（排除變體欄位）
    const updateResult = await this.productRepository
      .createQueryBuilder()
      .update(Product)
      .set(cleanUpdateData)
      .where('id = :id', { id })
      .execute();

    console.log(`Admin Service - QueryBuilder update result:`, {
      affected: updateResult.affected,
      raw: updateResult.raw,
    });

    // 重新載入產品資料
    const updatedProduct = await this.productRepository.findOne({
      where: { id },
      relations: ['brand', 'categoryRelation'],
    });

    console.log(`Admin Service - Final product after QueryBuilder:`, {
      id: updatedProduct.id,
      finalCategoryId: updatedProduct.categoryId,
      finalCategoryRelation: updatedProduct.categoryRelation?.name,
      updatedAt: updatedProduct.updatedAt,
    });

    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async toggleProductStatus(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    product.isActive = !product.isActive;
    return this.productRepository.save(product);
  }

  // ========== 品牌管理 ==========

  async getAllBrands() {
    return this.brandRepository.find({
      relations: ['products'],
      order: { createdAt: 'DESC' },
    });
  }

  async createBrand(createBrandDto: CreateBrandDto): Promise<Brand> {
    const brand = this.brandRepository.create(createBrandDto);
    return this.brandRepository.save(brand);
  }

  async updateBrand(
    id: string,
    updateBrandDto: UpdateBrandDto,
  ): Promise<Brand> {
    // 檢查品牌是否存在
    const existingBrand = await this.brandRepository.findOne({ where: { id } });
    if (!existingBrand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    // 如果名稱有變更，檢查是否有重複
    if (updateBrandDto.name && updateBrandDto.name !== existingBrand.name) {
      const duplicateBrand = await this.brandRepository.findOne({
        where: { name: updateBrandDto.name },
      });
      if (duplicateBrand) {
        throw new BadRequestException(
          `Brand name "${updateBrandDto.name}" already exists`,
        );
      }
    }

    // 使用 QueryBuilder 更新，避免關聯衝突問題
    await this.brandRepository
      .createQueryBuilder()
      .update(Brand)
      .set(updateBrandDto)
      .where('id = :id', { id })
      .execute();

    // 重新載入品牌資料
    const updatedBrand = await this.brandRepository.findOne({
      where: { id },
    });

    return updatedBrand;
  }

  async deleteBrand(id: string): Promise<void> {
    // 檢查是否有產品關聯到此品牌
    const productsCount = await this.productRepository.count({
      where: { brandId: id },
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        `Cannot delete brand. ${productsCount} products are still associated with this brand.`,
      );
    }

    const result = await this.brandRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
  }

  async toggleBrandStatus(id: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    brand.isActive = !brand.isActive;
    return this.brandRepository.save(brand);
  }

  // ========== 圖片上傳 ==========

  async uploadImage(file: Express.Multer.File) {
    return this.uploadService.uploadImage(file);
  }

  async uploadImages(files: Express.Multer.File[]) {
    return this.uploadService.uploadImages(files);
  }

  // ========== 統計資料 ==========

  async getDashboardStats() {
    const [
      totalProducts,
      activeProducts,
      totalBrands,
      activeBrands,
      totalUsers,
    ] = await Promise.all([
      this.productRepository.count(),
      this.productRepository.count({ where: { isActive: true } }),
      this.brandRepository.count(),
      this.brandRepository.count({ where: { isActive: true } }),
      this.userRepository.count(),
    ]);

    return {
      products: {
        total: totalProducts,
        active: activeProducts,
        inactive: totalProducts - activeProducts,
      },
      brands: {
        total: totalBrands,
        active: activeBrands,
        inactive: totalBrands - activeBrands,
      },
      users: {
        total: totalUsers,
      },
    };
  }

  // ========== 用戶管理 ==========

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await this.userRepository.findAndCount({
      select: [
        'id',
        'username',
        'email',
        'firstName',
        'lastName',
        'roles',
        'createdAt',
      ],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserRoles(userId: string, roles: UserRole[]): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // 驗證角色
    const validRoles = Object.values(UserRole);
    for (const role of roles) {
      if (!validRoles.includes(role)) {
        throw new BadRequestException(`Invalid role: ${role}`);
      }
    }

    user.roles = roles;
    return this.userRepository.save(user);
  }
}
