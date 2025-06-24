import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Brand } from '../brands/brand.entity';
import { Category } from '../categories/category.entity';
import { ProductStatus } from './enums/product-status.enum';

// 產品的關鍵特性介面
export interface KeyFeature {
  image: string;
  title: string;
  subtitle?: string;
  description: string;
}

// 產品的特性詳情介面
export interface FeatureDetail {
  type: 'image' | 'video';
  src: string;
  title: string;
  description: string;
  direction?: 'left' | 'right';
}

// 產品的常見問答介面
export interface FAQItem {
  question: string;
  answer: string;
}

// 在檔案最前面導入 ProductVariant 會產生循環依賴，所以使用延遲載入
import type { ProductVariant } from './product-variant.entity';

@Entity('products') // Specifies the table name in the database
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // 主 SKU - 當產品沒有變體時使用
  @Column({ nullable: true })
  @Index({ unique: true, where: 'master_sku IS NOT NULL' })
  masterSku: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number;

  @Column('int', { default: 0 })
  stock: number;


  // 分類關聯
  @ManyToOne(() => Category, category => category.products, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  categoryRelation: Category;

  @Column({ nullable: true })
  categoryId: string;

  // 品牌關聯
  @ManyToOne(() => Brand, { nullable: true })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column({ nullable: true })
  brandId: string;

  // 單一主要圖片 URL
  @Column({ nullable: true })
  imageUrl: string;

  // 多張圖片 URLs 陣列
  @Column('text', { array: true, nullable: true })
  images: string[];

  // 關鍵特性 (JSON 格式儲存)
  @Column('jsonb', { nullable: true })
  keyFeatures: KeyFeature[];

  // 特性詳情 (JSON 格式儲存)
  @Column('jsonb', { nullable: true })
  featureDetails: FeatureDetail[];

  // 常見問答 (JSON 格式儲存)
  @Column('jsonb', { nullable: true })
  faqs: FAQItem[];

  // 產品規格模板 (定義此產品有哪些規格項目，例如：["顏色", "尺寸"])
  @Column('jsonb', { nullable: true, default: () => "'[]'" })
  specTemplate: string[];

  // 是否為容器產品（只用來組織變體，不可直接購買）
  @Column({ default: false })
  isContainer: boolean;

  // 商品狀態（是否啟用）
  @Column({ default: true })
  isActive: boolean;

  // 產品狀態
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.IN_STOCK
  })
  status: ProductStatus;

  // 創建時間
  @CreateDateColumn()
  createdAt: Date;

  // 更新時間
  @UpdateDateColumn()
  updatedAt: Date;

  // 產品變體
  @OneToMany('ProductVariant', 'product', { cascade: false, eager: false })
  variants: ProductVariant[];

  // === 計算屬性 ===
  
  /**
   * 獲取產品的整體狀態
   * 基於所有變體的狀態計算
   */
  getOverallStatus(): ProductStatus {
    if (!this.variants || this.variants.length === 0) {
      return this.status;
    }

    // 如果有任何變體有庫存，產品就是有庫存的
    const hasInStock = this.variants.some(v => 
      v.isActive && v.status === ProductStatus.IN_STOCK && v.stock > 0
    );
    
    if (hasInStock) {
      return ProductStatus.IN_STOCK;
    }

    // 如果有任何變體可預購，產品就是可預購的
    const hasPreorder = this.variants.some(v => 
      v.isActive && v.status === ProductStatus.PREORDER && v.canPurchase()
    );
    
    if (hasPreorder) {
      return ProductStatus.PREORDER;
    }

    // 如果所有變體都停產，產品就是停產的
    const allDiscontinued = this.variants.every(v => 
      !v.isActive || v.status === ProductStatus.DISCONTINUED
    );
    
    if (allDiscontinued) {
      return ProductStatus.DISCONTINUED;
    }

    // 否則是缺貨
    return ProductStatus.OUT_OF_STOCK;
  }

  /**
   * 獲取可購買的變體
   */
  getAvailableVariants(): ProductVariant[] {
    if (!this.variants) return [];
    
    return this.variants.filter(variant => 
      variant.isActive && variant.canPurchase()
    );
  }

  /**
   * 獲取最低價格
   */
  getMinPrice(): number {
    if (!this.variants || this.variants.length === 0) {
      return this.price;
    }

    const availableVariants = this.getAvailableVariants();
    if (availableVariants.length === 0) {
      return this.price;
    }

    return Math.min(...availableVariants.map(v => v.getCurrentPrice()));
  }

  /**
   * 獲取最高價格
   */
  getMaxPrice(): number {
    if (!this.variants || this.variants.length === 0) {
      return this.price;
    }

    const availableVariants = this.getAvailableVariants();
    if (availableVariants.length === 0) {
      return this.price;
    }

    return Math.max(...availableVariants.map(v => v.getCurrentPrice()));
  }

  /**
   * 獲取有效的 SKU
   * 如果有變體，返回變體的 SKU 列表
   * 如果沒有變體，返回主 SKU
   */
  getSkus(): string[] {
    if (this.variants && this.variants.length > 0) {
      return this.variants
        .filter(v => v.isActive && v.sku)
        .map(v => v.sku);
    }
    
    return this.masterSku ? [this.masterSku] : [];
  }

  /**
   * 檢查產品是否有有效的 SKU
   */
  hasValidSku(): boolean {
    if (this.variants && this.variants.length > 0) {
      // 有變體時，檢查是否有任何變體有 SKU
      return this.variants.some(v => v.isActive && v.sku);
    }
    
    // 沒有變體時，檢查主 SKU
    return !!this.masterSku;
  }

  /**
   * 是否為簡單產品（沒有變體）
   */
  isSimpleProduct(): boolean {
    return !this.variants || this.variants.length === 0;
  }

  /**
   * 是否可直接購買
   * 容器產品不可直接購買，必須選擇變體
   */
  canPurchaseDirectly(): boolean {
    return !this.isContainer;
  }

  /**
   * 獲取容器產品的有效價格範圍
   */
  getPriceRange(): { min: number; max: number } | null {
    if (!this.isContainer || !this.variants || this.variants.length === 0) {
      return null;
    }

    const availableVariants = this.getAvailableVariants();
    if (availableVariants.length === 0) {
      return null;
    }

    const prices = availableVariants.map(v => v.getCurrentPrice());
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }

  /**
   * 獲取容器產品的總庫存
   */
  getTotalStock(): number {
    if (!this.isContainer || !this.variants || this.variants.length === 0) {
      return this.stock || 0;
    }

    return this.variants
      .filter(v => v.isActive)
      .reduce((sum, v) => sum + (v.stock || 0), 0);
  }
}
