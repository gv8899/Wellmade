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

    if (category) {
      whereConditions.category = category;
    }

    if (brandId) {
      whereConditions.brandId = brandId;
    }

    if (search) {
      whereConditions.name = `%${search}%`;
    }

    const [items, total] = await this.productRepository.findAndCount({
      where: whereConditions,
      relations: ['brand'],
      order: { [sortBy]: order },
      skip,
      take,
    });

    return { items, total, page: Math.floor(skip / take) + 1, limit: take };
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['brand'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    // 檢查品牌是否存在
    if (createProductDto.brandId) {
      const brand = await this.brandRepository.findOne({
        where: { id: createProductDto.brandId },
      });
      if (!brand) {
        throw new NotFoundException(
          `Brand with ID ${createProductDto.brandId} not found`,
        );
      }
    }

    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['brand', 'categoryRelation'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // 如果更新品牌ID，檢查品牌是否存在
    if (updateProductDto.brandId) {
      const brand = await this.brandRepository.findOne({
        where: { id: updateProductDto.brandId },
      });
      if (!brand) {
        throw new NotFoundException(
          `Brand with ID ${updateProductDto.brandId} not found`,
        );
      }
    }

    // 如果更新分類ID，檢查分類是否存在
    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateProductDto.categoryId} not found`,
        );
      }
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
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
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    Object.assign(brand, updateBrandDto);
    return this.brandRepository.save(brand);
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
