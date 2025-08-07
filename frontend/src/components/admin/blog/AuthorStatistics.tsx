'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Text, Card } from '@/design-system';
import { Author, Article } from '@/types/blog';
import { authorService, articleService } from '@/services/blog';

interface AuthorStatisticsProps {
  author: Author;
  onClose: () => void;
}

interface AuthorStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  averageViews: number;
  recentArticles: Article[];
  popularArticles: Article[];
  monthlyData?: {
    month: string;
    articles: number;
    views: number;
  }[];
}

export const AuthorStatistics: React.FC<AuthorStatisticsProps> = ({
  author,
  onClose,
}) => {
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAuthorStatistics();
  }, [author.id]);

  const loadAuthorStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      // 獲取作者統計資料
      const statisticsData = await authorService.getAuthorStatistics(author.id);
      
      // 獲取作者的文章列表（用於顯示最近文章和熱門文章）
      const articlesResponse = await authorService.getArticlesByAuthor(author.id, {
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });

      const popularArticlesResponse = await authorService.getArticlesByAuthor(author.id, {
        limit: 5,
        sortBy: 'viewCount',
        sortOrder: 'DESC'
      });

      setStats({
        totalArticles: statisticsData.totalArticles || 0,
        publishedArticles: statisticsData.publishedArticles || 0,
        draftArticles: statisticsData.draftArticles || 0,
        totalViews: statisticsData.totalViews || 0,
        averageViews: statisticsData.averageViews || 0,
        recentArticles: articlesResponse.data.slice(0, 5),
        popularArticles: popularArticlesResponse.data,
        monthlyData: statisticsData.monthlyData || [],
      });
    } catch (err) {
      console.error('Failed to load author statistics:', err);
      setError('載入統計資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getPublishRate = (): number => {
    if (!stats || stats.totalArticles === 0) return 0;
    return Math.round((stats.publishedArticles / stats.totalArticles) * 100);
  };

  if (loading) {
    return (
      <Card variant="elevated" padding="large">
        <div className="flex items-center justify-between mb-6">
          <Text variant="title3" className="text-gray-900">
            作者統計資料
          </Text>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="elevated" padding="large">
        <div className="flex items-center justify-between mb-6">
          <Text variant="title3" className="text-gray-900">
            作者統計資料
          </Text>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <Text variant="headline" className="text-gray-900 mb-2">
            載入失敗
          </Text>
          <Text variant="body" className="text-gray-600 mb-4">
            {error}
          </Text>
          <button
            onClick={loadAuthorStatistics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新載入
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="large" className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* 作者頭像 */}
          <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gray-200">
            {author.avatar ? (
              <Image
                src={author.avatar}
                alt={author.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                <Text variant="headline" className="text-white font-semibold">
                  {author.name.charAt(0).toUpperCase()}
                </Text>
              </div>
            )}
          </div>
          <div>
            <Text variant="title3" className="text-gray-900">
              {author.name} 的統計資料
            </Text>
            <Text variant="body" className="text-gray-600">
              詳細分析數據和文章表現
            </Text>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        {/* 關鍵指標 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Text variant="title2" className="text-blue-600 font-bold">
              {stats?.totalArticles || 0}
            </Text>
            <Text variant="caption1" className="text-blue-700 mt-1">
              總文章數
            </Text>
          </div>

          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Text variant="title2" className="text-green-600 font-bold">
              {stats?.publishedArticles || 0}
            </Text>
            <Text variant="caption1" className="text-green-700 mt-1">
              已發布
            </Text>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <Text variant="title2" className="text-yellow-600 font-bold">
              {stats?.draftArticles || 0}
            </Text>
            <Text variant="caption1" className="text-yellow-700 mt-1">
              草稿數
            </Text>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Text variant="title2" className="text-purple-600 font-bold">
              {formatNumber(stats?.totalViews || 0)}
            </Text>
            <Text variant="caption1" className="text-purple-700 mt-1">
              總瀏覽數
            </Text>
          </div>
        </div>

        {/* 詳細統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 發布統計 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <Text variant="subhead" className="text-gray-900 mb-4">
              發布統計
            </Text>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text variant="body" className="text-gray-600">發布率</Text>
                <Text variant="body" className="text-gray-900 font-medium">
                  {getPublishRate()}%
                </Text>
              </div>
              <div className="flex justify-between">
                <Text variant="body" className="text-gray-600">平均瀏覽數</Text>
                <Text variant="body" className="text-gray-900 font-medium">
                  {Math.round(stats?.averageViews || 0)}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text variant="body" className="text-gray-600">創建時間</Text>
                <Text variant="body" className="text-gray-900 font-medium">
                  {new Date(author.createdAt).toLocaleDateString('zh-TW')}
                </Text>
              </div>
            </div>
          </div>

          {/* 表現指標 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <Text variant="subhead" className="text-gray-900 mb-4">
              表現指標
            </Text>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text variant="body" className="text-gray-600">最高瀏覽文章</Text>
                <Text variant="body" className="text-gray-900 font-medium">
                  {stats?.popularArticles && stats.popularArticles.length > 0 
                    ? formatNumber(stats.popularArticles[0].viewCount)
                    : '0'
                  }
                </Text>
              </div>
              <div className="flex justify-between">
                <Text variant="body" className="text-gray-600">活躍度</Text>
                <Text variant="body" className="text-gray-900 font-medium">
                  {stats && stats.totalArticles > 0 ? '活躍' : '較少活躍'}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* 熱門文章 */}
        {stats?.popularArticles && stats.popularArticles.length > 0 && (
          <div>
            <Text variant="subhead" className="text-gray-900 mb-4">
              熱門文章 Top 5
            </Text>
            <div className="space-y-3">
              {stats.popularArticles.map((article, index) => (
                <div key={article.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text variant="body" className="text-gray-900 truncate">
                        {article.title}
                      </Text>
                      <Text variant="caption1" className="text-gray-500">
                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString('zh-TW')}
                      </Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text variant="subhead" className="text-gray-900">
                      {formatNumber(article.viewCount)}
                    </Text>
                    <Text variant="caption1" className="text-gray-500">瀏覽</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 最近文章 */}
        {stats?.recentArticles && stats.recentArticles.length > 0 && (
          <div>
            <Text variant="subhead" className="text-gray-900 mb-4">
              最近文章
            </Text>
            <div className="space-y-3">
              {stats.recentArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex-1 min-w-0">
                    <Text variant="body" className="text-gray-900 truncate">
                      {article.title}
                    </Text>
                    <div className="flex items-center space-x-4 mt-1">
                      <Text variant="caption1" className="text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString('zh-TW')}
                      </Text>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        article.status === 'published' 
                          ? 'bg-green-100 text-green-800'
                          : article.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {article.status === 'published' ? '已發布' : 
                         article.status === 'draft' ? '草稿' : '其他'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <Text variant="subhead" className="text-gray-900">
                      {formatNumber(article.viewCount)}
                    </Text>
                    <Text variant="caption1" className="text-gray-500">瀏覽</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空狀態 */}
        {(!stats?.recentArticles || stats.recentArticles.length === 0) && 
         (!stats?.popularArticles || stats.popularArticles.length === 0) && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <Text variant="headline" className="text-gray-900 mb-2">
              還沒有文章
            </Text>
            <Text variant="body" className="text-gray-600">
              這位作者還沒有創建任何文章
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
};