'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Text, Card } from '@/design-system';
import { articleService } from '@/services/blog';
import { Article, ArticleStatus } from '@/types/blog';
import { formatDate } from '@/services/blog';

export default function ArticlesManagePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ArticleStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadArticles();
  }, [filter, searchTerm]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: 50,
        sortBy: 'updatedAt',
        sortOrder: 'DESC' as const,
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await articleService.getArticles(params);
      setArticles(response.data);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (articleId: string, newStatus: ArticleStatus) => {
    try {
      await articleService.updateArticle(articleId, { status: newStatus });
      loadArticles(); // 重新載入列表
    } catch (error) {
      console.error('Failed to update article status:', error);
    }
  };

  const handleDelete = async (articleId: string) => {
    if (confirm('確定要刪除這篇文章嗎？此操作無法復原。')) {
      try {
        await articleService.deleteArticle(articleId);
        loadArticles(); // 重新載入列表
      } catch (error) {
        console.error('Failed to delete article:', error);
      }
    }
  };

  const getStatusBadge = (status: ArticleStatus) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800',
    };

    const labels = {
      draft: '草稿',
      published: '已發布',
      archived: '已封存',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Text variant="body" color="text-gray-500">載入中...</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <Text variant="title2" className="text-gray-900">
          文章管理
        </Text>
        <Link
          href="/admin/blog/articles/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          新增文章
        </Link>
      </div>

      {/* 篩選和搜尋 */}
      <Card variant="default" padding="large">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜尋文章標題或內容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Text variant="subhead" className="text-gray-700">狀態：</Text>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ArticleStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部</option>
              <option value="draft">草稿</option>
              <option value="published">已發布</option>
              <option value="archived">已封存</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 文章列表 */}
      <div className="space-y-4">
        {articles.length === 0 ? (
          <Card variant="default" padding="large">
            <div className="text-center py-12">
              <Text variant="body" color="text-gray-500">
                {searchTerm || filter !== 'all' ? '沒有找到符合條件的文章' : '還沒有任何文章'}
              </Text>
            </div>
          </Card>
        ) : (
          articles.map((article) => (
            <Card key={article.id} variant="elevated" padding="large">
              <div className="flex items-start gap-6">
                {/* 文章封面圖片 */}
                {article.coverImage && (
                  <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* 文章資訊 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Link
                        href={`/admin/blog/articles/${article.id}/edit`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {article.title}
                      </Link>
                      {article.subtitle && (
                        <Text variant="body" className="text-gray-600 mt-1">
                          {article.subtitle}
                        </Text>
                      )}
                    </div>
                    {getStatusBadge(article.status)}
                  </div>

                  {article.excerpt && (
                    <Text variant="body" className="text-gray-600 mb-3 line-clamp-2">
                      {article.excerpt}
                    </Text>
                  )}

                  {/* 元資訊 */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>作者：{article.author.name}</span>
                      <span>分類：{article.category?.name || '無分類'}</span>
                      <span>瀏覽：{article.viewCount}</span>
                      <span>更新：{formatDate(article.updatedAt)}</span>
                    </div>

                    {/* 操作按鈕 */}
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/blog/${article.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        預覽
                      </Link>
                      <Link
                        href={`/admin/blog/articles/${article.id}/edit`}
                        className="text-gray-600 hover:text-gray-700 text-sm"
                      >
                        編輯
                      </Link>
                      
                      {/* 狀態切換 */}
                      <select
                        value={article.status}
                        onChange={(e) => handleStatusChange(article.id, e.target.value as ArticleStatus)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="draft">草稿</option>
                        <option value="published">發布</option>
                        <option value="archived">封存</option>
                      </select>

                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        刪除
                      </button>
                    </div>
                  </div>

                  {/* SEO 預覽 */}
                  {article.metaTitle && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <Text variant="caption1" className="text-gray-600 mb-1">SEO 預覽：</Text>
                      <Text variant="subhead" className="text-blue-600">{article.metaTitle}</Text>
                      {article.metaDescription && (
                        <Text variant="caption1" className="text-gray-600 mt-1">
                          {article.metaDescription}
                        </Text>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}