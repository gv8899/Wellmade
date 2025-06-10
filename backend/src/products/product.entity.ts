import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Brand } from '../brands/brand.entity';

// ç¢åçééµç¹æ§ä»é¢
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
  
  // åçéè¯
  @ManyToOne(() => Brand, { nullable: true })
  @JoinColumn({ name: "brandId" })
  brand: Brand;

  @Column({ nullable: true })
  brandId: string;

  // å®ä¸ä¸»è¦åç URL
  @Column({ nullable: true })
  imageUrl: string;
  
  // å¤å¼µåç URLs æ¸çµ
  @Column('text', { array: true, nullable: true })
  images: string[];
  
  // ééµç¹æ§ (JSON æ ¼å¼å²å­)
  @Column('jsonb', { nullable: true })
  keyFeatures: KeyFeature[];
  
  // ååçæï¼æ¯å¦åç¨ï¼
  @Column({ default: true })
  isActive: boolean;

  // åµå»ºæé
  @CreateDateColumn()
  createdAt: Date;

  // æ´æ°æé
  @UpdateDateColumn()
  updatedAt: Date;
}
