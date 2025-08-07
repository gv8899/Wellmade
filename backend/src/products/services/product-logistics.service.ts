import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product.entity';
import { ProductVariant } from '../product-variant.entity';
import { DeliveryMethodConfig } from '../entities/delivery-method-config.entity';
import { 
  DeliveryMethod, 
  CartDeliveryAvailability,
  DeliveryRestrictionType,
  ProductLogisticsConfig
} from '../interfaces/product-logistics.interface';

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  product?: Product;
  variant?: ProductVariant;
}

@Injectable()
export class ProductLogisticsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    
    @InjectRepository(DeliveryMethodConfig)
    private readonly deliveryConfigRepository: Repository<DeliveryMethodConfig>,
  ) {}

  /**
   * 獲取所有可用的配送方式配置
   */
  async getAvailableDeliveryMethods(): Promise<DeliveryMethodConfig[]> {
    return this.deliveryConfigRepository.find({
      where: { isActive: true },
      order: { method: 'ASC' }
    });
  }

  /**
   * 獲取特定配送方式的配置
   */
  async getDeliveryMethodConfig(method: DeliveryMethod): Promise<DeliveryMethodConfig | null> {
    return this.deliveryConfigRepository.findOne({
      where: { method, isActive: true }
    });
  }

  /**
   * 檢查購物車中商品的配送方式可用性
   */
  async checkCartDeliveryAvailability(cartItems: CartItem[]): Promise<CartDeliveryAvailability[]> {
    // 獲取所有可用的配送方式
    const deliveryMethods = await this.getAvailableDeliveryMethods();
    
    // 載入購物車中的產品和變體資訊
    const enrichedCartItems = await this.enrichCartItems(cartItems);
    
    // 為每種配送方式檢查可用性
    const availabilityResults: CartDeliveryAvailability[] = [];
    
    for (const deliveryMethod of deliveryMethods) {
      const availability = await this.checkDeliveryMethodAvailability(
        deliveryMethod, 
        enrichedCartItems
      );
      
      availabilityResults.push(availability);
    }
    
    return availabilityResults;
  }

  /**
   * 檢查單一配送方式對購物車的可用性
   */
  private async checkDeliveryMethodAvailability(
    deliveryConfig: DeliveryMethodConfig,
    cartItems: CartItem[]
  ): Promise<CartDeliveryAvailability> {
    const restrictions: CartDeliveryAvailability['restrictions'] = [];
    
    for (const item of cartItems) {
      const logistics = this.getItemLogisticsConfig(item);
      
      if (!logistics) {
        restrictions.push({
          productId: item.productId,
          productName: item.product?.name || 'Unknown Product',
          restrictionType: DeliveryRestrictionType.CUSTOM,
          reason: '商品缺少物流配置'
        });
        continue;
      }
      
      // 檢查商品是否支援此配送方式
      if (!logistics.supportedDeliveryMethods.includes(deliveryConfig.method)) {
        const reason = this.getRestrictionReason(logistics, deliveryConfig.method);
        restrictions.push({
          productId: item.productId,
          productName: item.product?.name || 'Unknown Product',
          restrictionType: this.getRestrictionType(logistics, deliveryConfig.method),
          reason
        });
        continue;
      }
      
      // 檢查物理屬性限制
      if (logistics.physicalAttributes) {
        const supportResult = deliveryConfig.supportsProductAttributes(logistics.physicalAttributes);
        
        if (!supportResult.supported) {
          for (const reason of supportResult.reasons) {
            restrictions.push({
              productId: item.productId,
              productName: item.product?.name || 'Unknown Product',
              restrictionType: this.categorizeRestrictionReason(reason),
              reason
            });
          }
        }
      }
    }
    
    return {
      method: deliveryConfig.method,
      available: restrictions.length === 0,
      restrictions
    };
  }

  /**
   * 豐富購物車項目資訊
   */
  private async enrichCartItems(cartItems: CartItem[]): Promise<CartItem[]> {
    const enriched: CartItem[] = [];
    
    for (const item of cartItems) {
      const enrichedItem = { ...item };
      
      // 載入產品資訊
      if (!enrichedItem.product) {
        enrichedItem.product = await this.productRepository.findOne({
          where: { id: item.productId }
        });
      }
      
      // 載入變體資訊（如果有）
      if (item.variantId && !enrichedItem.variant) {
        enrichedItem.variant = await this.variantRepository.findOne({
          where: { id: item.variantId }
        });
      }
      
      enriched.push(enrichedItem);
    }
    
    return enriched;
  }

  /**
   * 獲取項目的物流配置
   */
  private getItemLogisticsConfig(item: CartItem): ProductLogisticsConfig | null {
    // 優先使用變體的物流配置，其次使用產品的配置
    if (item.variant?.logisticsConfig) {
      return item.variant.logisticsConfig;
    }
    
    if (item.product?.logisticsConfig) {
      return item.product.logisticsConfig;
    }
    
    return null;
  }

  /**
   * 獲取限制原因
   */
  private getRestrictionReason(logistics: ProductLogisticsConfig, method: DeliveryMethod): string {
    const restriction = logistics.deliveryRestrictions?.[method];
    if (restriction?.reason) {
      return restriction.reason;
    }
    
    // 根據商品屬性生成預設原因
    if (logistics.physicalAttributes?.isOversized) {
      return '商品尺寸過大，不適合此配送方式';
    }
    
    if (logistics.physicalAttributes?.isFragile) {
      return '易碎商品，不適合此配送方式';
    }
    
    if (logistics.physicalAttributes?.isHighValue) {
      return '高價值商品，需要較安全的配送方式';
    }
    
    if (logistics.physicalAttributes?.requiresRefrigeration) {
      return '冷藏商品，此配送方式無法提供冷鏈服務';
    }
    
    return '商品不支援此配送方式';
  }

  /**
   * 獲取限制類型
   */
  private getRestrictionType(logistics: ProductLogisticsConfig, method: DeliveryMethod): DeliveryRestrictionType {
    if (logistics.physicalAttributes?.isOversized) {
      return DeliveryRestrictionType.SIZE_LIMIT;
    }
    
    if (logistics.physicalAttributes?.isFragile) {
      return DeliveryRestrictionType.FRAGILE_ITEM;
    }
    
    if (logistics.physicalAttributes?.isHighValue) {
      return DeliveryRestrictionType.HIGH_VALUE;
    }
    
    if (logistics.physicalAttributes?.requiresRefrigeration) {
      return DeliveryRestrictionType.REFRIGERATED;
    }
    
    return DeliveryRestrictionType.CUSTOM;
  }

  /**
   * 根據原因文字分類限制類型
   */
  private categorizeRestrictionReason(reason: string): DeliveryRestrictionType {
    if (reason.includes('重量')) {
      return DeliveryRestrictionType.WEIGHT_LIMIT;
    }
    
    if (reason.includes('尺寸')) {
      return DeliveryRestrictionType.SIZE_LIMIT;
    }
    
    if (reason.includes('易碎')) {
      return DeliveryRestrictionType.FRAGILE_ITEM;
    }
    
    if (reason.includes('高價值')) {
      return DeliveryRestrictionType.HIGH_VALUE;
    }
    
    if (reason.includes('冷藏')) {
      return DeliveryRestrictionType.REFRIGERATED;
    }
    
    return DeliveryRestrictionType.CUSTOM;
  }

  /**
   * 更新產品的物流配置
   */
  async updateProductLogisticsConfig(
    productId: string, 
    config: ProductLogisticsConfig
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId }
    });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    product.logisticsConfig = config;
    return this.productRepository.save(product);
  }

  /**
   * 更新變體的物流配置
   */
  async updateVariantLogisticsConfig(
    variantId: string, 
    config: ProductLogisticsConfig
  ): Promise<ProductVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId }
    });
    
    if (!variant) {
      throw new Error('Product variant not found');
    }
    
    variant.logisticsConfig = config;
    return this.variantRepository.save(variant);
  }
}