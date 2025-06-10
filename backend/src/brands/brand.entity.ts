import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Product } from '../products/product.entity';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;  // 品牌名稱

  @Column({ nullable: true })
  logoUrl: string;  // 品牌圖片/標誌

  @Column('text', { nullable: true })
  description: string;  // 品牌敘述
  
  @Column({ default: true })
  isActive: boolean;  // 品牌狀態

  // 建立關聯 - 一個品牌可以有多個產品
  @OneToMany(() => Product, product => product.brand)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
