import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Article } from './article.entity';

@Entity('article_categories')
export class ArticleCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverImage: string;

  // 支援階層分類
  @Column({ type: 'uuid', nullable: true })
  parentId: string;

  @ManyToOne(() => ArticleCategory, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: ArticleCategory;

  @OneToMany(() => ArticleCategory, (category) => category.parent)
  children: ArticleCategory[];

  // SEO 相關
  @Column({ type: 'varchar', length: 200, nullable: true })
  metaTitle: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  metaDescription: string;

  // 顯示設定
  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // 分類下的文章
  @OneToMany(() => Article, (article) => article.category)
  articles: Article[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
