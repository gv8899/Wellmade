'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Text } from '@/design-system';
import { colors } from '@/design-system';
import { Article, ArticleCategory } from '@/types/blog';
import { articleService, categoryService, formatDate, formatReadingTime, generateExcerpt } from '@/services/blog';

const BlogPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 載入文章和相關資料
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 並行載入數據
        const [articlesResponse, featuredResponse, categoriesResponse] = await Promise.all([
          articleService.getArticles({ 
            page: currentPage, 
            limit: 12,
            categoryId: selectedCategory || undefined,
            status: 'published' as any
          }),
          articleService.getFeaturedArticles(3),
          categoryService.getCategories(),
        ]);

        setArticles(articlesResponse.data);
        setTotalPages(articlesResponse.meta.totalPages);
        setFeaturedArticles(featuredResponse);
        setCategories(categoriesResponse);
        
      } catch (err) {
        setError('載入文章失敗');
        console.error('Error loading blog data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, selectedCategory]);

  // 分類篩選處理
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  // 分頁處理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Text variant="body" color={colors.neutral.secondaryLabel}>
          載入中...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Text variant="body" color={colors.feedback.error}>
          {error}
        </Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Text variant="title1" className="mb-6">
            Wellmade 部落格
          </Text>
          <Text variant="headline" color={colors.neutral.secondaryLabel} className="mb-8">
            探索品質生活，分享美好事物
          </Text>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <Text variant="title2" className="mb-8 text-center">
              精選文章
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredArticles.map((article) => (
                <Link key={article.id} href={`/blog/${article.slug}`}>
                  <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {article.coverImage && (
                      <div className="aspect-video relative">
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-3">
                        <Text variant="caption1" color={colors.neutral.secondaryLabel}>
                          {formatDate(article.publishedAt || article.createdAt)}
                        </Text>
                        <Text variant="caption1" color={colors.neutral.secondaryLabel}>
                          {formatReadingTime(article.readingTime)}
                        </Text>
                      </div>
                      <Text variant="headline" className="mb-3">
                        {article.title}
                      </Text>
                      {article.excerpt && (
                        <Text variant="body" color={colors.neutral.secondaryLabel} className="mb-4">
                          {article.excerpt}
                        </Text>
                      )}
                      <div className="flex items-center justify-between">
                        <Text variant="caption1" color={colors.neutral.tertiaryLabel}>
                          {article.author.name}
                        </Text>
                        {article.category && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {article.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {articles.map((article) => (
                  <Link key={article.id} href={`/blog/${article.slug}`}>
                    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {article.coverImage && (
                        <div className="aspect-video relative">
                          <Image
                            src={article.coverImage}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-3">
                          <Text variant="caption1" color={colors.neutral.secondaryLabel}>
                            {formatDate(article.publishedAt || article.createdAt)}
                          </Text>
                          <Text variant="caption1" color={colors.neutral.secondaryLabel}>
                            {formatReadingTime(article.readingTime)}
                          </Text>
                        </div>
                        <Text variant="headline" className="mb-3">
                          {article.title}
                        </Text>
                        {(article.excerpt || article.content) && (
                          <Text variant="body" color={colors.neutral.secondaryLabel} className="mb-4">
                            {article.excerpt || generateExcerpt(article.content)}
                          </Text>
                        )}
                        <div className="flex items-center justify-between">
                          <Text variant="caption1" color={colors.neutral.tertiaryLabel}>
                            {article.author.name}
                          </Text>
                          {article.category && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {article.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded transition-colors ${
                        currentPage === page
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Text variant="headline" color={colors.neutral.secondaryLabel}>
                目前沒有文章
              </Text>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;