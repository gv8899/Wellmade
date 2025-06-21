import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  // 父分類關聯
  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => Category, category => category.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  @OneToMany(() => Category, category => category.parent)
  children: Category[];

  // 排序順序
  @Column({ default: 0 })
  sortOrder: number;

  // 是否啟用
  @Column({ default: true })
  isActive: boolean;

  // SEO相關
  @Column({ nullable: true })
  metaTitle: string;

  @Column('text', { nullable: true })
  metaDescription: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}