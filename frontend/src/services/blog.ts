import api from './api';
import { 
  Article, 
  ArticleCategory, 
  Author, 
  ArticleListResponse, 
  ArticleQueryParams,
  CreateArticleDto,
  UpdateArticleDto,
  CreateArticleCategoryDto,
  UpdateArticleCategoryDto,
  CreateAuthorDto,
  UpdateAuthorDto
} from '../types/blog';

// 文章相關 API
export const articleService = {
  // 獲取文章列表
  async getArticles(params?: ArticleQueryParams): Promise<ArticleListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            searchParams.append(key, value.join(','));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const query = searchParams.toString();
    const url = query ? `/articles?${query}` : '/articles';
    
    const response = await api.get(url);
    return response.data;
  },

  // 獲取精選文章
  async getFeaturedArticles(limit?: number): Promise<Article[]> {
    const url = limit ? `/articles/featured?limit=${limit}` : '/articles/featured';
    const response = await api.get(url);
    return response.data;
  },

  // 根據 slug 獲取文章
  async getArticleBySlug(slug: string): Promise<Article> {
    const response = await api.get(`/articles/${slug}`);
    return response.data;
  },

  // 根據 ID 獲取文章
  async getArticleById(id: string): Promise<Article> {
    const response = await api.get(`/articles/id/${id}`);
    return response.data;
  },

  // 創建文章
  async createArticle(data: CreateArticleDto): Promise<Article> {
    const response = await api.post('/articles', data);
    return response.data;
  },

  // 更新文章
  async updateArticle(id: string, data: UpdateArticleDto): Promise<Article> {
    const response = await api.patch(`/articles/${id}`, data);
    return response.data;
  },

  // 刪除文章
  async deleteArticle(id: string): Promise<void> {
    await api.delete(`/articles/${id}`);
  },

  // 增加瀏覽次數
  async incrementViewCount(id: string): Promise<void> {
    await api.post(`/articles/${id}/view`);
  },

  // 獲取相關文章
  async getRelatedArticles(id: string, limit?: number): Promise<Article[]> {
    const url = limit ? `/articles/${id}/related?limit=${limit}` : `/articles/${id}/related`;
    const response = await api.get(url);
    return response.data;
  },
};

// 分類相關 API
export const categoryService = {
  // 獲取所有分類
  async getCategories(): Promise<ArticleCategory[]> {
    const response = await api.get('/article-categories');
    return response.data;
  },

  // 根據 slug 獲取分類
  async getCategoryBySlug(slug: string): Promise<ArticleCategory> {
    const response = await api.get(`/article-categories/${slug}`);
    return response.data;
  },

  // 獲取分類下的文章
  async getArticlesByCategory(slug: string, params?: ArticleQueryParams): Promise<ArticleListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            searchParams.append(key, value.join(','));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const query = searchParams.toString();
    const url = query ? `/article-categories/${slug}/articles?${query}` : `/article-categories/${slug}/articles`;
    
    const response = await api.get(url);
    return response.data;
  },

  // 創建分類
  async createCategory(data: CreateArticleCategoryDto): Promise<ArticleCategory> {
    const response = await api.post('/article-categories', data);
    return response.data;
  },

  // 更新分類
  async updateCategory(id: string, data: UpdateArticleCategoryDto): Promise<ArticleCategory> {
    const response = await api.patch(`/article-categories/${id}`, data);
    return response.data;
  },

  // 刪除分類
  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/article-categories/${id}`);
  },

  // 切換分類狀態
  async toggleCategoryStatus(id: string): Promise<ArticleCategory> {
    const response = await api.patch(`/article-categories/${id}/toggle-status`);
    return response.data;
  },
};

// 作者相關 API
export const authorService = {
  // 獲取所有作者
  async getAuthors(): Promise<Author[]> {
    const response = await api.get('/authors');
    return response.data;
  },

  // 根據 ID 獲取作者
  async getAuthorById(id: string): Promise<Author> {
    const response = await api.get(`/authors/${id}`);
    return response.data;
  },

  // 獲取作者的文章
  async getArticlesByAuthor(id: string, params?: ArticleQueryParams): Promise<ArticleListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            searchParams.append(key, value.join(','));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const query = searchParams.toString();
    const url = query ? `/authors/${id}/articles?${query}` : `/authors/${id}/articles`;
    
    const response = await api.get(url);
    return response.data;
  },

  // 創建作者
  async createAuthor(data: CreateAuthorDto): Promise<Author> {
    const response = await api.post('/authors', data);
    return response.data;
  },

  // 更新作者
  async updateAuthor(id: string, data: UpdateAuthorDto): Promise<Author> {
    const response = await api.patch(`/authors/${id}`, data);
    return response.data;
  },

  // 刪除作者
  async deleteAuthor(id: string): Promise<void> {
    await api.delete(`/authors/${id}`);
  },

  // 獲取作者統計
  async getAuthorStatistics(id: string): Promise<any> {
    const response = await api.get(`/authors/${id}/statistics`);
    return response.data;
  },
};

// 輔助函數：格式化日期
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 輔助函數：格式化閱讀時間
export const formatReadingTime = (minutes: number): string => {
  if (minutes < 1) return '不到 1 分鐘';
  return `${minutes} 分鐘閱讀`;
};

// 輔助函數：生成文章摘要
export const generateExcerpt = (content: any, maxLength: number = 150): string => {
  if (!content || !content.blocks) return '';
  
  let text = '';
  for (const block of content.blocks) {
    if (block.type === 'paragraph' && block.data?.text) {
      // 移除 HTML 標籤
      const plainText = block.data.text.replace(/<[^>]*>/g, '');
      text += plainText + ' ';
      
      if (text.length > maxLength) break;
    }
  }
  
  if (text.length > maxLength) {
    return text.substring(0, maxLength).trim() + '...';
  }
  
  return text.trim();
};