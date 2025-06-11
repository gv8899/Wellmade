import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Brand } from '../brands/brand.entity';

// 產品的關鍵特性介面
export interface KeyFeature {
  image: string;
  title: string;
  subtitle?: string;
  description: string;
}

@Entity('products') // Specifies the table name in the database
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;

  @Column()
  category: string;
  
  // 品牌關聯
  @ManyToOne(() => Brand, { nullable: true })
  @JoinColumn({ name: "brandId" })
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
  
  // 商品狀態（是否啟用）
  @Column({ default: true })
  isActive: boolean;

  // 創建時間
  @CreateDateColumn()
  createdAt: Date;

  // 更新時間
  @UpdateDateColumn()
  updatedAt: Date;
}
