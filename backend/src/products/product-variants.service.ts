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
import { CreateVariantDto, CreateProductVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { ProductStatus, InventoryType } from './enums/product-status.enum';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // 創建產品變體
  async create(createVariantDto: CreateProductVariantDto): Promise<ProductVariant> {
    // 檢查產品是否存在
    const product = await this.productRepository.findOne({
      where: { id: createVariantDto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${createVariantDto.productId} not found`,
      );
    }

    // 檢查SKU是否已存在
    const existingSku = await this.variantRepository.findOne({
      where: {
        productId: createVariantDto.productId,
        sku: createVariantDto.sku,
      },
    });

    if (existingSku) {
      throw new ConflictException(
        `SKU ${createVariantDto.sku} already exists for this product`,
      );
    }

    const variant = this.variantRepository.create(createVariantDto);
    return await this.variantRepository.save(variant);
  }

  // 批量創建變體（用於創建產品時一併創建變體）
  async createBulk(productId: string, variants: CreateVariantDto[]): Promise<ProductVariant[]> {
    if (!variants || variants.length === 0) {
      return [];
    }

    // 檢查SKU是否有重複
    const skus = variants.map(v => v.sku);
    const uniqueSkus = new Set(skus);
    if (skus.length !== uniqueSkus.size) {
      throw new BadRequestException('Duplicate SKUs found in variants');
    }

    const variantEntities = variants.map(variantDto => 
      this.variantRepository.create({
        ...variantDto,
        productId,
      })
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
  async update(id: string, updateVariantDto: UpdateVariantDto): Promise<ProductVariant> {
    const variant = await this.findOne(id);

    // 如果更新SKU，檢查新SKU是否已存在
    if (updateVariantDto.sku && updateVariantDto.sku !== variant.sku) {
      const existingSku = await this.variantRepository.findOne({
        where: {
          productId: variant.productId,
          sku: updateVariantDto.sku,
        },
      });

      if (existingSku) {
        throw new ConflictException(
          `SKU ${updateVariantDto.sku} already exists for this product`,
        );
      }
    }

    Object.assign(variant, updateVariantDto);
    return await this.variantRepository.save(variant);
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
      .andWhere('variant.status != :discontinued', { discontinued: ProductStatus.DISCONTINUED })
      .getMany();

    return variants.filter(variant => variant.canPurchase());
  }

  // 批量更新排序順序
  async updateSortOrder(updates: { id: string; sortOrder: number }[]): Promise<void> {
    const updatePromises = updates.map(update =>
      this.variantRepository.update(update.id, { sortOrder: update.sortOrder })
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

  // 生成SKU（輔助功能）
  generateSku(productName: string, specs: Record<string, string>): string {
    const productPrefix = productName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 3);

    const specsString = Object.values(specs)
      .map(value => value.charAt(0).toUpperCase())
      .join('');

    const timestamp = Date.now().toString().slice(-4);

    return `${productPrefix}-${specsString}-${timestamp}`;
  }
}