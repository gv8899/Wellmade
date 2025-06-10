import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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
  
  // 品牌
  @Column({ nullable: true })
  brand: string;

  // 單一主要圖片 URL
  @Column({ nullable: true })
  imageUrl: string;
  
  // 多張圖片 URLs 數組
  @Column('text', { array: true, nullable: true })
  images: string[];
  
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
