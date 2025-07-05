import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { Product } from './product.entity';
import { Brand } from '../brands/brand.entity';
import { Category } from '../categories/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { ProductVariantsService } from './product-variants.service';
import { ProductStatus } from './enums/product-status.enum';
import { EnhancedProduct } from './interfaces/enhanced-product.interface';
import { SkuGenerationService } from './services/sku-generation.service';

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

    private skuGenerationService: SkuGenerationService,
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
      // 用slug查詢分類
      const categoryEntity = await this.categoryRepository.findOne({
        where: { slug: category },
      });

      if (categoryEntity) {
        // 獲取所有子分類ID（包括子分類的子分類）
        const getAllChildrenIds = async (parentId: string): Promise<string[]> => {
          const children = await this.categoryRepository.find({
            where: { parentId },
          });
          
          let allIds: string[] = [];
          for (const child of children) {
            allIds.push(child.id);
            // 遞歸獲取子分類的子分類
            const grandChildren = await getAllChildrenIds(child.id);
            allIds = allIds.concat(grandChildren);
          }
          return allIds;
        };
        
        // 收集當前分類和所有子分類的ID
        const categoryIds = [categoryEntity.id];
        const childrenIds = await getAllChildrenIds(categoryEntity.id);
        categoryIds.push(...childrenIds);
        
        // 使用 In 查詢來包含所有相關分類
        whereConditions.categoryId = In(categoryIds);
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
    const enhancedItems = items.map((product) => {
      const overallStatus = product.getOverallStatus();
      const minPrice = product.getMinPrice();
      const maxPrice = product.getMaxPrice();
      const availableVariants = product.getAvailableVariants();

      let priceRange: any;

      if (product.isContainer) {
        // 容器產品顯示變體價格範圍
        const priceRangeData = product.getPriceRange();
        if (priceRangeData) {
          priceRange =
            priceRangeData.min === priceRangeData.max
              ? { price: priceRangeData.min }
              : { minPrice: priceRangeData.min, maxPrice: priceRangeData.max };
        } else {
          priceRange = { price: null };
        }
      } else {
        // 簡單產品顯示固定價格
        priceRange =
          minPrice === maxPrice ? { price: minPrice } : { minPrice, maxPrice };
      }

      return {
        ...product,
        overallStatus,
        priceRange,
        availableVariantsCount: availableVariants.length,
        totalStock: product.isContainer
          ? product.getTotalStock()
          : product.stock,
        canPurchaseDirectly: product.canPurchaseDirectly(),
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

      // 為容器產品添加增強信息
      if (product.isContainer) {
        const priceRange = product.getPriceRange();
        const totalStock = product.getTotalStock();
        (product as any).priceRange = priceRange;
        (product as any).totalStock = totalStock;
        (product as any).canPurchaseDirectly = false;
      } else {
        (product as any).canPurchaseDirectly = true;
      }

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
    }

    // 提取變體資料和主 SKU 設定
    const { variants, autoGenerateMasterSku, ...productDataWithoutVariants } =
      productData;

    const product = this.productRepository.create(productDataWithoutVariants);
    const savedProduct = await this.productRepository.save(product);

    // 如果有變體資料，創建變體
    if (variants && variants.length > 0) {
      await this.variantsService.createBulk(savedProduct.id, variants);
    } else {
      // 沒有變體的產品，自動生成主 SKU（除非已提供）
      if (!savedProduct.masterSku) {
        console.log(
          `🔧 [SKU] 新產品 "${savedProduct.name}" 沒有變體，自動生成主 SKU...`,
        );

        const productWithRelations = await this.productRepository.findOne({
          where: { id: savedProduct.id },
          relations: ['brand', 'categoryRelation'],
        });

        if (productWithRelations) {
          try {
            const masterSku = await this.skuGenerationService.generateSku(
              productWithRelations,
              {}, // 沒有規格
            );

            await this.productRepository.update(savedProduct.id, { masterSku });
            console.log(`✅ [SKU] 已生成主 SKU: ${masterSku}`);
          } catch (error) {
            console.error(`❌ [SKU] 生成主 SKU 失敗:`, error.message);
          }
        }
      }
    }

    // 重新載入關聯資料後返回
    return this.findOne(savedProduct.id);
  }

  // 更新產品
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    console.log('🔍 [DEBUG] 開始更新產品:', {
      id,
      updateData: updateProductDto,
    });

    // 排除變體欄位，變體的更新應該通過專門的變體 API 處理
    const { variants, autoGenerateMasterSku, ...productUpdateData } =
      updateProductDto;
    console.log('🔧 [DEBUG] 已排除變體欄位，純產品數據:', productUpdateData);

    const product = await this.findOne(id); // 確認產品存在
    console.log('📦 [DEBUG] 當前產品狀態:', {
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
    });

    // 處理分類更新
    if (productUpdateData.categoryId !== undefined) {
      console.log(
        '🎯 [DEBUG] 處理 categoryId 更新:',
        productUpdateData.categoryId,
      );

      if (productUpdateData.categoryId) {
        // 確認新分類存在
        const category = await this.categoryRepository.findOne({
          where: { id: productUpdateData.categoryId },
        });
        if (!category) {
          throw new NotFoundException(
            `Category with ID ${productUpdateData.categoryId} not found`,
          );
        }
        console.log('✅ [DEBUG] 目標分類已驗證:', {
          id: category.id,
          name: category.name,
        });
      } else {
        console.log('🔄 [DEBUG] categoryId 設為 null');
      }
    }

    console.log('🔧 [DEBUG] Object.assign 前的狀態:', {
      product_categoryId: product.categoryId,
      updateDto_categoryId: productUpdateData.categoryId,
    });

    // 使用 Object.assign 合併現有產品和更新數據（不包含變體）
    const updatedProduct = Object.assign(product, productUpdateData);

    console.log('🔧 [DEBUG] Object.assign 後的狀態:', {
      updatedProduct_categoryId: updatedProduct.categoryId,
    });

    console.log('💾 [DEBUG] 準備保存產品...');
    const savedProduct = await this.productRepository.save(updatedProduct);

    console.log('✅ [DEBUG] 產品已保存:', {
      savedProduct_categoryId: savedProduct.categoryId,
    });

    // 直接使用 repository 重新查詢，避免 findOne 的額外邏輯
    console.log('🔄 [DEBUG] 直接重新查詢產品資料...');
    const finalProduct = await this.productRepository.findOne({
      where: { id },
      relations: ['brand', 'categoryRelation', 'variants'],
    });

    console.log('🎉 [DEBUG] 最終產品狀態:', {
      finalProduct_categoryId: finalProduct.categoryId,
      categoryRelation: finalProduct.categoryRelation?.name || 'null',
    });

    return finalProduct;
  }

  // 確保產品有適當的 SKU（僅在安全情況下執行）
  private async ensureMasterSku(product: Product): Promise<void> {
    try {
      // 延遲執行，避免與變體操作衝突
      setTimeout(async () => {
        try {
          // 重新載入變體資料以確保準確性
          const productWithVariants = await this.productRepository.findOne({
            where: { id: product.id },
            relations: ['brand', 'categoryRelation', 'variants'],
          });

          if (!productWithVariants) {
            return;
          }

          // 檢查是否需要生成主 SKU（只有在沒有變體時才生成）
          const hasVariants =
            productWithVariants.variants &&
            productWithVariants.variants.length > 0;
          const needsMasterSku = !productWithVariants.masterSku && !hasVariants;

          if (needsMasterSku) {
            console.log(
              `🔧 [SKU] 為產品 "${productWithVariants.name}" 生成主 SKU...`,
            );

            const masterSku = await this.skuGenerationService.generateSku(
              productWithVariants,
              {}, // 沒有規格
            );

            await this.productRepository.update(productWithVariants.id, {
              masterSku,
            });
            console.log(`✅ [SKU] 已生成主 SKU: ${masterSku}`);
          }
        } catch (error) {
          console.error(`❌ [SKU] 延遲生成主 SKU 失敗:`, error.message);
        }
      }, 1000); // 延遲 1 秒執行
    } catch (error) {
      console.error(`❌ [SKU] 生成主 SKU 失敗:`, error.message);
    }
  }

  // 為所有現有產品生成缺失的主 SKU
  async generateMissingMasterSkus(): Promise<{
    success: number;
    failed: number;
    skipped: number;
  }> {
    console.log('🚀 [SKU] 開始為現有產品生成缺失的主 SKU...');

    const products = await this.productRepository.find({
      relations: ['brand', 'categoryRelation', 'variants'],
    });

    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (const product of products) {
      try {
        const hasVariants = product.variants && product.variants.length > 0;
        const hasMasterSku = !!product.masterSku;

        if (hasVariants) {
          // 有變體的產品不需要主 SKU
          skipped++;
          continue;
        }

        if (hasMasterSku) {
          // 已經有主 SKU
          skipped++;
          continue;
        }

        // 需要生成主 SKU
        const masterSku = await this.skuGenerationService.generateSku(
          product,
          {}, // 沒有規格
        );

        await this.productRepository.update(product.id, { masterSku });
        console.log(`✅ [SKU] "${product.name}" -> ${masterSku}`);
        success++;
      } catch (error) {
        console.error(
          `❌ [SKU] 產品 "${product.name}" 生成失敗:`,
          error.message,
        );
        failed++;
      }
    }

    console.log(
      `🎉 [SKU] 完成！成功: ${success}, 失敗: ${failed}, 跳過: ${skipped}`,
    );

    return { success, failed, skipped };
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
      where: category
        ? {
            categoryRelation: {
              name: Like(`%${category}%`),
            },
          }
        : {},
      relations: ['brand', 'categoryRelation', 'variants'],
    });
    return rawResult;
  }

  // 獲取可購買的產品 (支援預購和現貨)
  async findAvailableProducts(
    queryParams: FindProductsDto = {},
  ): Promise<{ items: EnhancedProduct[]; total: number }> {
    const result = await this.findAll(queryParams);

    // 過濾出可購買的產品
    const availableItems = result.items.filter((product) => {
      return (
        product.overallStatus === ProductStatus.IN_STOCK ||
        product.overallStatus === ProductStatus.PREORDER
      );
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

    return product.getAvailableVariants().map((variant) => ({
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

    products.forEach((product) => {
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

  // 輔助方法：獲取品牌
  async findBrandById(id: string): Promise<Brand | null> {
    return this.brandRepository.findOne({ where: { id } });
  }

  // 輔助方法：獲取分類
  async findCategoryById(id: string): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  // 輔助方法：獲取 SKU 生成服務
  getSkuGenerationService() {
    return this.skuGenerationService;
  }
}
