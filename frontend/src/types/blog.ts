// 文章狀態列舉
export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// Editor.js 內容介面
export interface ArticleContent {
  time?: number;
  blocks: Array<{
    id?: string;
    type: string;
    data: any;
  }>;
  version?: string;
}

// 社交連結介面
export interface SocialLinks {
  website?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
}

// 作者介面
export interface Author {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  email?: string;
  socialLinks?: SocialLinks;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

// 文章分類介面
export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  parentId?: string;
  parent?: ArticleCategory;
  children?: ArticleCategory[];
  metaTitle?: string;
  metaDescription?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 文章介面
export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  coverImage?: string;
  content: ArticleContent;
  excerpt?: string;
  categoryId?: string;
  category?: ArticleCategory;
  tags: string[];
  status: ArticleStatus;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  socialImage?: string;
  viewCount: number;
  readingTime: number;
  authorId: string;
  author: Author;
  featuredProducts: string[];
  createdAt: string;
  updatedAt: string;
}

// API 回應介面
export interface ArticleListResponse {
  data: Article[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 查詢參數介面
export interface ArticleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  authorId?: string;
  status?: ArticleStatus;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// 創建文章 DTO
export interface CreateArticleDto {
  title: string;
  subtitle?: string;
  slug: string;
  coverImage?: string;
  content: ArticleContent;
  excerpt?: string;
  categoryId?: string;
  tags?: string[];
  status?: ArticleStatus;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  socialImage?: string;
  authorId: string;
  featuredProducts?: string[];
}

// 更新文章 DTO
export interface UpdateArticleDto extends Partial<CreateArticleDto> {
  readingTime?: number;
  publishedAt?: string;
}

// 創建分類 DTO
export interface CreateArticleCategoryDto {
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  parentId?: string;
  metaTitle?: string;
  metaDescription?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// 更新分類 DTO
export interface UpdateArticleCategoryDto extends Partial<CreateArticleCategoryDto> {}

// 創建作者 DTO
export interface CreateAuthorDto {
  name: string;
  bio?: string;
  avatar?: string;
  email?: string;
  socialLinks?: SocialLinks;
  userId?: string;
}

// 更新作者 DTO
export interface UpdateAuthorDto extends Partial<CreateAuthorDto> {}