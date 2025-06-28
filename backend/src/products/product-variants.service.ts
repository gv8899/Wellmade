import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { Product } from './product.entity';
import {
  CreateVariantDto,
  CreateProductVariantDto,
} from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { ProductStatus, InventoryType } from './enums/product-status.enum';
import { SkuGenerationService } from './services/sku-generation.service';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly skuGenerationService: SkuGenerationService,
  ) {}

  // 創建產品變體
  async create(
    createVariantDto: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    // 檢查產品是否存在（包含品牌和分類資訊）
    const product = await this.productRepository.findOne({
      where: { id: createVariantDto.productId },
      relations: ['brand', 'categoryRelation'],
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${createVariantDto.productId} not found`,
      );
    }

    // 驗證規格一致性
    if (createVariantDto.specs) {
      await this.validateSpecsConsistency(product, createVariantDto.specs);
    }

    // 如果沒有提供 SKU，則自動生成
    let sku = createVariantDto.sku;
    if (!sku || createVariantDto.autoGenerateSku) {
      sku = await this.skuGenerationService.generateSku(
        product,
        createVariantDto.specs || {},
      );
    }

    // 檢查SKU是否已存在（全域檢查，因為SKU必須全域唯一）
    const existingSku = await this.variantRepository.findOne({
      where: { sku },
    });

    if (existingSku) {
      throw new ConflictException(`SKU ${sku} already exists in the system`);
    }

    const variant = this.variantRepository.create({
      ...createVariantDto,
      sku,
    });
    return await this.variantRepository.save(variant);
  }

  // 批量創建變體（用於創建產品時一併創建變體）
  async createBulk(
    productId: string,
    variants: CreateVariantDto[],
  ): Promise<ProductVariant[]> {
    if (!variants || variants.length === 0) {
      return [];
    }

    // 獲取產品資訊（包含品牌和分類）
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['brand', 'categoryRelation'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // 為每個變體生成或驗證 SKU
    const processedVariants = await Promise.all(
      variants.map(async (variantDto) => {
        let sku = variantDto.sku;

        // 如果沒有提供 SKU 或標記為自動生成，則生成 SKU
        if (!sku || variantDto.autoGenerateSku) {
          sku = await this.skuGenerationService.generateSku(
            product,
            variantDto.specs || {},
          );
        }

        return {
          ...variantDto,
          sku,
          productId,
        };
      }),
    );

    // 檢查處理後的 SKU 是否有重複
    const skus = processedVariants.map((v) => v.sku);
    const uniqueSkus = new Set(skus);
    if (skus.length !== uniqueSkus.size) {
      throw new BadRequestException(
        'Duplicate SKUs found in variants after generation',
      );
    }

    // 檢查資料庫中是否已存在這些 SKU
    const existingSkuCheck =
      await this.skuGenerationService.checkSkuExists(skus);
    const existingSkus = Object.entries(existingSkuCheck)
      .filter(([_, exists]) => exists)
      .map(([sku]) => sku);

    if (existingSkus.length > 0) {
      throw new ConflictException(
        `The following SKUs already exist: ${existingSkus.join(', ')}`,
      );
    }

    const variantEntities = processedVariants.map((variantData) =>
      this.variantRepository.create(variantData),
    );

    return await this.variantRepository.save(variantEntities);
  }

  // 獲取產品的所有變體
  async findByProductId(productId: string): Promise<ProductVariant[]> {
    return await this.variantRepository.find({
      where: { productId, isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  // 獲取單一變體
  async findOne(id: string): Promise<ProductVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID ${id} not found`);
    }

    return variant;
  }

  // 根據SKU查找變體
  async findBySku(sku: string): Promise<ProductVariant> {
    const variant = await this.variantRepository.findOne({
      where: { sku },
      relations: ['product'],
    });

    if (!variant) {
      throw new NotFoundException(`Variant with SKU ${sku} not found`);
    }

    return variant;
  }

  // 更新變體
  async update(
    id: string,
    updateVariantDto: UpdateVariantDto,
  ): Promise<ProductVariant> {
    console.log('ProductVariantsService - 更新變體:', {
      id,
      updateData: updateVariantDto,
    });

    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID ${id} not found`);
    }

    console.log('ProductVariantsService - 找到變體:', {
      id: variant.id,
      sku: variant.sku,
    });

    // 如果更新規格，驗證規格一致性
    if (updateVariantDto.specs) {
      await this.validateSpecsConsistency(
        variant.product,
        updateVariantDto.specs,
      );
    }

    // 如果更新SKU，檢查新SKU是否已存在（全域檢查）
    if (updateVariantDto.sku && updateVariantDto.sku !== variant.sku) {
      const existingSku = await this.variantRepository.findOne({
        where: { sku: updateVariantDto.sku },
      });

      if (existingSku) {
        throw new ConflictException(
          `SKU ${updateVariantDto.sku} already exists in the system`,
        );
      }
    }

    // 確保不會更新不應該更新的欄位
    const { productId: _productId, ...cleanUpdateData } =
      updateVariantDto as any;
    console.log('ProductVariantsService - 清理後的更新資料:', cleanUpdateData);

    Object.assign(variant, cleanUpdateData);
    const savedVariant = await this.variantRepository.save(variant);
    console.log('ProductVariantsService - 變體更新成功:', {
      id: savedVariant.id,
      sku: savedVariant.sku,
    });

    return savedVariant;
  }

  // 批量更新庫存
  async updateStock(updates: { id: string; stock: number }[]): Promise<void> {
    for (const update of updates) {
      await this.variantRepository.update(update.id, { stock: update.stock });
    }
  }

  // 獲取可購買的變體
  async findAvailableVariants(productId?: string): Promise<ProductVariant[]> {
    const queryBuilder = this.variantRepository.createQueryBuilder('variant');

    if (productId) {
      queryBuilder.where('variant.productId = :productId', { productId });
    }

    const variants = await queryBuilder
      .andWhere('variant.isActive = :isActive', { isActive: true })
      .andWhere('variant.status != :discontinued', {
        discontinued: ProductStatus.DISCONTINUED,
      })
      .getMany();

    return variants.filter((variant) => variant.canPurchase());
  }

  // 批量更新排序順序
  async updateSortOrder(
    updates: { id: string; sortOrder: number }[],
  ): Promise<void> {
    const updatePromises = updates.map((update) =>
      this.variantRepository.update(update.id, { sortOrder: update.sortOrder }),
    );

    await Promise.all(updatePromises);
  }

  // 減少庫存（用於下單） - 更新支援預購模式
  async decrementStock(id: string, quantity: number): Promise<ProductVariant> {
    const variant = await this.findOne(id);

    if (!variant.canPurchase(quantity)) {
      throw new BadRequestException(
        `Insufficient stock or variant not available for purchase. SKU: ${variant.sku}`,
      );
    }

    switch (variant.inventoryType) {
      case InventoryType.PHYSICAL:
        variant.stock -= quantity;
        break;
      case InventoryType.PREORDER_LIMITED:
      case InventoryType.PREORDER_UNLIMITED:
        variant.preorderSold += quantity;
        break;
    }

    return await this.variantRepository.save(variant);
  }

  // 恢復庫存（取消訂單時）
  async restoreStock(id: string, quantity: number): Promise<ProductVariant> {
    const variant = await this.findOne(id);

    switch (variant.inventoryType) {
      case InventoryType.PHYSICAL:
        variant.stock += quantity;
        break;
      case InventoryType.PREORDER_LIMITED:
      case InventoryType.PREORDER_UNLIMITED:
        variant.preorderSold = Math.max(0, variant.preorderSold - quantity);
        break;
    }

    return await this.variantRepository.save(variant);
  }

  // 刪除變體
  async remove(id: string): Promise<void> {
    const variant = await this.findOne(id);

    // 檢查是否是產品的最後一個變體
    const variantCount = await this.variantRepository.count({
      where: { productId: variant.productId },
    });

    if (variantCount <= 1) {
      throw new BadRequestException(
        'Cannot delete the last variant of a product',
      );
    }

    await this.variantRepository.remove(variant);
  }

  // 批量刪除產品的所有變體（用於刪除產品時）
  async removeByProductId(productId: string): Promise<void> {
    await this.variantRepository.delete({ productId });
  }

  // 生成SKU（輔助功能）- 保留舊方法以便向後相容
  generateSku(productName: string, specs: Record<string, string>): string {
    const productPrefix = productName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 3);

    const specsString = Object.values(specs)
      .map((value) => value.charAt(0).toUpperCase())
      .join('');

    const timestamp = Date.now().toString().slice(-4);

    return `${productPrefix}-${specsString}-${timestamp}`;
  }

  // 預覽 SKU 生成結果
  async previewSku(
    productId: string,
    specs?: Record<string, string>,
  ): Promise<string> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['brand', 'categoryRelation'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return await this.skuGenerationService.previewSku(product, specs || {});
  }

  // 檢查 SKU 是否可用
  async checkSkuAvailability(
    sku: string,
    productId?: string,
  ): Promise<boolean> {
    const query = this.variantRepository
      .createQueryBuilder('variant')
      .where('variant.sku = :sku', { sku });

    if (productId) {
      query.andWhere('variant.productId != :productId', { productId });
    }

    const count = await query.getCount();
    return count === 0;
  }

  // 驗證變體規格與產品規格模板的一致性
  private async validateSpecsConsistency(
    product: Product,
    variantSpecs: Record<string, string>,
  ): Promise<void> {
    // 如果產品沒有規格模板，允許任何規格
    if (!product.specTemplate || product.specTemplate.length === 0) {
      console.log(
        `產品 ${product.id} 沒有規格模板，允許任意規格:`,
        Object.keys(variantSpecs),
      );
      return;
    }

    const templateKeys = new Set(product.specTemplate);
    const variantKeys = new Set(Object.keys(variantSpecs));

    // 檢查變體規格是否包含模板中沒有的規格項目（僅警告，不阻止）
    const extraKeys = [...variantKeys].filter((key) => !templateKeys.has(key));
    if (extraKeys.length > 0) {
      console.warn(
        `變體包含產品模板中沒有的規格項目（允許）: ${extraKeys.join(', ')}`,
      );
    }

    // 檢查是否缺少必要的規格項目（僅在有模板時嚴格要求）
    const missingKeys = [...templateKeys].filter(
      (key) => !variantKeys.has(key),
    );
    if (missingKeys.length > 0) {
      console.warn(
        `變體缺少模板中的規格項目（暫時允許）: ${missingKeys.join(', ')}`,
      );
      // 暫時註釋掉嚴格驗證，改為警告
      // throw new BadRequestException(
      //   `變體缺少必要的規格項目: ${missingKeys.join(', ')}。產品規格模板要求: ${product.specTemplate.join(', ')}`
      // );
    }

    console.log('規格一致性驗證完成:', {
      productTemplate: product.specTemplate,
      variantSpecs: Object.keys(variantSpecs),
      extraKeys: extraKeys.length > 0 ? extraKeys : '無',
      missingKeys: missingKeys.length > 0 ? missingKeys : '無',
    });
  }
}
