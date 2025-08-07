import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Author } from './author.entity';
import { ArticleCategory } from './article-category.entity';

// 文章狀態列舉
export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// Editor.js 內容介面（簡化版）
export interface ArticleContent {
  time?: number;
  blocks: Array<{
    id?: string;
    type: string;
    data: any;
  }>;
  version?: string;
}

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  subtitle: string;

  @Column({ type: 'varchar', length: 200, unique: true, nullable: false })
  @Index()
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverImage: string;

  // 使用 JSONB 儲存 Editor.js 格式的內容
  @Column({ type: 'jsonb', nullable: false })
  content: ArticleContent;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  // 分類關聯
  @Column({ type: 'uuid', nullable: true })
  categoryId: string;

  @ManyToOne(() => ArticleCategory, (category) => category.articles, {
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: ArticleCategory;

  // 標籤（使用字串陣列）
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  // 發布狀態
  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status: ArticleStatus;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  // SEO 相關
  @Column({ type: 'varchar', length: 200, nullable: true })
  metaTitle: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  metaDescription: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  canonicalUrl: string;

  // 社交分享
  @Column({ type: 'varchar', length: 500, nullable: true })
  socialImage: string;

  // 統計數據
  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  readingTime: number; // 預估閱讀時間（分鐘）

  // 作者關聯
  @Column({ type: 'uuid', nullable: false })
  authorId: string;

  @ManyToOne(() => Author, (author) => author.articles, { nullable: false })
  @JoinColumn({ name: 'authorId' })
  author: Author;

  // 推薦商品 ID 陣列
  @Column({ type: 'text', array: true, default: [] })
  featuredProducts: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
