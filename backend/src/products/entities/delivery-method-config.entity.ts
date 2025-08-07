import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeliveryMethod } from '../interfaces/product-logistics.interface';

// 配送方式全域限制介面
interface GlobalLimits {
  maxWeight?: number;        // 最大重量限制（公斤）
  maxDimensions?: {          // 最大尺寸限制（公分）
    length: number;
    width: number;
    height: number;
  };
  allowFragile?: boolean;    // 是否允許易碎品
  allowHighValue?: boolean;  // 是否允許高價值商品
  allowRefrigerated?: boolean; // 是否允許冷藏品
}

@Entity('delivery_method_configs')
export class DeliveryMethodConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: DeliveryMethod, unique: true })
  method: DeliveryMethod;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  baseFee: number;

  @Column({ type: 'int', default: 1 })
  estimatedDays: number;

  @Column({ default: true })
  isActive: boolean;

  @Column('jsonb', { default: () => "'{}'" })
  globalLimits: GlobalLimits;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 業務方法：檢查是否支援指定的商品特性
  supportsProductAttributes(attributes: {
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    isFragile?: boolean;
    isHighValue?: boolean;
    requiresRefrigeration?: boolean;
  }): { supported: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // 檢查重量限制
    if (this.globalLimits.maxWeight && attributes.weight && attributes.weight > this.globalLimits.maxWeight) {
      reasons.push(`商品重量 ${attributes.weight}kg 超過配送限制 ${this.globalLimits.maxWeight}kg`);
    }

    // 檢查尺寸限制
    if (this.globalLimits.maxDimensions && attributes.dimensions) {
      const { length, width, height } = attributes.dimensions;
      const maxDim = this.globalLimits.maxDimensions;
      
      if (length > maxDim.length || width > maxDim.width || height > maxDim.height) {
        reasons.push(`商品尺寸 ${length}x${width}x${height}cm 超過配送限制 ${maxDim.length}x${maxDim.width}x${maxDim.height}cm`);
      }
    }

    // 檢查易碎品
    if (attributes.isFragile && this.globalLimits.allowFragile === false) {
      reasons.push('此配送方式不支援易碎商品');
    }

    // 檢查高價值商品
    if (attributes.isHighValue && this.globalLimits.allowHighValue === false) {
      reasons.push('此配送方式不支援高價值商品');
    }

    // 檢查冷藏商品
    if (attributes.requiresRefrigeration && this.globalLimits.allowRefrigerated === false) {
      reasons.push('此配送方式不支援冷藏商品');
    }

    return {
      supported: reasons.length === 0,
      reasons
    };
  }
}