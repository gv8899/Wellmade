import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Product } from './product.entity';
import { Brand } from '../brands/brand.entity';
import { Category } from '../categories/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { ProductVariantsService } from './product-variants.service';
import { ProductStatus } from './enums/product-status.enum';
import { EnhancedProduct } from './interfaces/enhanced-product.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,

    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

    @Inject(forwardRef(() => ProductVariantsService))
    private variantsService: ProductVariantsService,
  ) {}

  // 帶分頁和排序的查找產品
  async findAll(
    queryParams: FindProductsDto = {},
  ): Promise<{ items: EnhancedProduct[]; total: number }> {
    const {
      skip = 0,
      take = 10,
      sortBy = 'createdAt',
      order = 'DESC',
      category,
      brandId,
      minPrice,
      maxPrice,
      search,
    } = queryParams;

    // 構建查詢條件
    const whereConditions: any = {};

    // 如果有分類篩選 - 支援兩種方式
    if (category) {
      // 先嘗試用slug查詢分類
      const categoryEntity = await this.categoryRepository.findOne({
        where: { slug: category }
      });
      
      if (categoryEntity) {
        whereConditions.categoryId = categoryEntity.id;
      } else {
        // 向後相容：如果找不到對應的分類，使用舊的category欄位
        whereConditions.category = category;
      }
    }

    // 如果有品牌篩選
    if (brandId) {
      whereConditions.brandId = brandId;
    }

    // 如果有價格範圍篩選
    if (minPrice !== undefined || maxPrice !== undefined) {
      whereConditions.price = {};

      if (minPrice !== undefined) {
        whereConditions.price = { ...whereConditions.price, gte: minPrice };
      }

      if (maxPrice !== undefined) {
        whereConditions.price = { ...whereConditions.price, lte: maxPrice };
      }
    }

    // 如果有搜尋關鍵詞
    if (search) {
      whereConditions.name = Like(`%${search}%`);
    }

    // 執行查詢
    const [items, total] = await this.productRepository.findAndCount({
      where: whereConditions,
      order: { [sortBy]: order },
      skip,
      take,
      relations: ['brand', 'categoryRelation', 'variants'], // 載入品牌、分類和變體關聯資訊
    });

    // 為每個產品計算整體狀態和價格範圍
    const enhancedItems = items.map(product => {
      const overallStatus = product.getOverallStatus();
      const minPrice = product.getMinPrice();
      const maxPrice = product.getMaxPrice();
      const availableVariants = product.getAvailableVariants();
      
      return {
        ...product,
        overallStatus,
        priceRange: minPrice === maxPrice ? { price: minPrice } : { minPrice, maxPrice },
        availableVariantsCount: availableVariants.length,
      };
    });

    return { items: enhancedItems, total };
  }

  // 根據 ID 查找單個產品
  async findOne(id: string): Promise<Product> {
    try {
      // 檢查是否為有效的 UUID 格式
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id,
        )
      ) {
        throw new BadRequestException(
          'Invalid product ID format. Expected UUID format.',
        );
      }

      // 使用關聯查詢載入品牌資訊
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['brand', 'categoryRelation', 'variants'],
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // 確保產品是啟用狀態的
      if (!product.isActive) {
        throw new NotFoundException(`Product with ID ${id} is not available`);
      }

      // 計算產品的整體狀態和價格範圍
      const overallStatus = product.getOverallStatus();
      const minPrice = product.getMinPrice();
      const maxPrice = product.getMaxPrice();
      const availableVariants = product.getAvailableVariants();
      
      return product;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error retrieving product: ${error.message}`,
      );
    }
  }

  // 創建新產品
  async create(createProductDto: CreateProductDto): Promise<Product> {
    // 處理 Brand 關聯
    const productData = { ...createProductDto };

    if (createProductDto.brandId) {
      // 確認 Brand 存在
      const brand = await this.brandRepository.findOne({
        where: { id: createProductDto.brandId },
      });
      if (!brand) {
        throw new NotFoundException(
          `Brand with ID ${createProductDto.brandId} not found`,
        );
      }
    }

    // 處理分類關聯
    if (createProductDto.categoryId) {
      // 確認分類存在
      const category = await this.categoryRepository.findOne({
        where: { id: createProductDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${createProductDto.categoryId} not found`,
        );
      }
    } else if (createProductDto.category) {
      // 向後相容：如果提供了 category slug，轉換為 categoryId
      const category = await this.categoryRepository.findOne({
        where: { slug: createProductDto.category },
      });
      if (category) {
        productData.categoryId = category.id;
        delete productData.category; // 移除舊的 category 欄位
      }
    }

    // 提取變體資料
    const { variants, ...productDataWithoutVariants } = productData;

    const product = this.productRepository.create(productDataWithoutVariants);
    const savedProduct = await this.productRepository.save(product);
    
    // 如果有變體資料，創建變體
    if (variants && variants.length > 0) {
      await this.variantsService.createBulk(savedProduct.id, variants);
    }
    
    // 重新載入關聯資料後返回
    return this.findOne(savedProduct.id);
  }

  // 更新產品
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id); // 確認產品存在

    // 處理分類更新
    if (updateProductDto.categoryId !== undefined) {
      if (updateProductDto.categoryId) {
        // 確認新分類存在
        const category = await this.categoryRepository.findOne({
          where: { id: updateProductDto.categoryId },
        });
        if (!category) {
          throw new NotFoundException(
            `Category with ID ${updateProductDto.categoryId} not found`,
          );
        }
      }
    } else if (updateProductDto.category) {
      // 向後相容：如果提供了 category slug，轉換為 categoryId
      const category = await this.categoryRepository.findOne({
        where: { slug: updateProductDto.category },
      });
      if (category) {
        updateProductDto.categoryId = category.id;
        delete updateProductDto.category; // 移除舊的 category 欄位
      }
    }

    // 使用 Object.assign 合併現有產品和更新數據
    const updatedProduct = Object.assign(product, updateProductDto);

    await this.productRepository.save(updatedProduct);
    
    // 重新載入關聯資料後返回
    return this.findOne(id);
  }

  // 刪除產品
  async remove(id: string): Promise<void> {
    // 先刪除所有變體（因為設定了 CASCADE，其實會自動刪除）
    await this.variantsService.removeByProductId(id);
    
    const result = await this.productRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  // 根據類別查找產品 (為了相容性保留，但建議使用 findAll 並傳入 category 參數)
  async findByCategory(category: string): Promise<Product[]> {
    const rawResult = await this.productRepository.find({
      where: category ? 
        {
          category: Like(`%${category}%`)
        } : {},
      relations: ['brand', 'categoryRelation', 'variants'],
    });
    return rawResult;
  }

  // 獲取可購買的產品 (支援預購和現貨)
  async findAvailableProducts(queryParams: FindProductsDto = {}): Promise<{ items: EnhancedProduct[]; total: number }> {
    const result = await this.findAll(queryParams);
    
    // 過濾出可購買的產品
    const availableItems = result.items.filter(product => {
      return product.overallStatus === ProductStatus.IN_STOCK || product.overallStatus === ProductStatus.PREORDER;
    });
    
    return {
      items: availableItems,
      total: availableItems.length,
    };
  }

  // 獲取產品的可購買變體
  async getAvailableVariants(productId: string): Promise<any[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['variants'],
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    
    return product.getAvailableVariants().map(variant => ({
      ...variant,
      currentPrice: variant.getCurrentPrice(),
      availableStock: variant.getAvailableStock(),
      canPurchase: variant.canPurchase(),
    }));
  }

  // 查詢產品狀態統計
  async getProductStatusStats(): Promise<any> {
    const products = await this.productRepository.find({
      relations: ['variants'],
    });

    const stats = {
      total: products.length,
      inStock: 0,
      preorder: 0,
      outOfStock: 0,
      discontinued: 0,
    };

    products.forEach(product => {
      const status = product.getOverallStatus();
      switch (status) {
        case ProductStatus.IN_STOCK:
          stats.inStock++;
          break;
        case ProductStatus.PREORDER:
          stats.preorder++;
          break;
        case ProductStatus.OUT_OF_STOCK:
          stats.outOfStock++;
          break;
        case ProductStatus.DISCONTINUED:
          stats.discontinued++;
          break;
      }
    });

    return stats;
  }
}
