import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductStatus, InventoryType } from './enums/product-status.enum';

@Entity('product_variants')
@Index(['productId', 'sku'], { unique: true }) // 確保同一產品的SKU唯一
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 產品關聯
  @ManyToOne(() => Product, product => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  // SKU (Stock Keeping Unit)
  @Column()
  @Index()
  sku: string;

  // 變體名稱（例如：白色/大號）
  @Column({ nullable: true })
  variantTitle: string;

  // 規格（JSON格式存儲，例如：{ "顏色": "白色", "尺寸": "M" }）
  @Column('jsonb')
  specs: Record<string, string>;

  // 價格
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  // 原價/市場價（用於顯示折扣）
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  compareAtPrice: number;

  // 庫存
  @Column('int', { default: 0 })
  stock: number;

  // 變體專屬圖片
  @Column({ nullable: true })
  imageUrl: string;

  // 排序順序
  @Column({ default: 0 })
  sortOrder: number;

  // 是否啟用
  @Column({ default: true })
  isActive: boolean;

  // 重量（用於運費計算）
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  weight: number;

  // 條碼
  @Column({ nullable: true })
  barcode: string;

  // 產品狀態
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.IN_STOCK
  })
  status: ProductStatus;

  // 庫存類型
  @Column({
    type: 'enum',
    enum: InventoryType,
    default: InventoryType.PHYSICAL
  })
  inventoryType: InventoryType;

  // === 預購相關欄位 ===
  
  // 預購限制數量（僅當 inventoryType 為 PREORDER_LIMITED 時使用）
  @Column('int', { nullable: true })
  preorderLimit: number;

  // 已預購數量
  @Column('int', { default: 0 })
  preorderSold: number;

  // 預購開始時間
  @Column({ type: 'timestamp', nullable: true })
  preorderStartTime: Date;

  // 預購結束時間
  @Column({ type: 'timestamp', nullable: true })
  preorderEndTime: Date;

  // 預計出貨日期
  @Column({ type: 'date', nullable: true })
  expectedShipDate: Date;

  // 預購價格（如果與正常價格不同）
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  preorderPrice: number;

  // 預購描述
  @Column('text', { nullable: true })
  preorderDescription: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // === 計算屬性 ===
  
  /**
   * 獲取可用庫存數量
   * 對於預購商品，返回剩餘可預購數量
   */
  getAvailableStock(): number {
    switch (this.inventoryType) {
      case InventoryType.PHYSICAL:
        return this.stock;
      case InventoryType.PREORDER_LIMITED:
        return this.preorderLimit ? this.preorderLimit - this.preorderSold : 0;
      case InventoryType.PREORDER_UNLIMITED:
        return Number.MAX_SAFE_INTEGER;
      default:
        return 0;
    }
  }

  /**
   * 檢查是否可以購買
   */
  canPurchase(quantity: number = 1): boolean {
    if (!this.isActive || this.status === ProductStatus.DISCONTINUED) {
      return false;
    }

    if (this.status === ProductStatus.PREORDER) {
      // 檢查預購時間範圍
      const now = new Date();
      if (this.preorderStartTime && now < this.preorderStartTime) {
        return false;
      }
      if (this.preorderEndTime && now > this.preorderEndTime) {
        return false;
      }
    }

    return this.getAvailableStock() >= quantity;
  }

  /**
   * 獲取當前有效價格
   */
  getCurrentPrice(): number {
    if (this.status === ProductStatus.PREORDER && this.preorderPrice) {
      return this.preorderPrice;
    }
    return this.price;
  }
}