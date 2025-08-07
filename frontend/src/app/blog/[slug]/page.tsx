'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Text } from '@/design-system';
import { colors } from '@/design-system';
import { Article } from '@/types/blog';
import { articleService, formatDate, formatReadingTime } from '@/services/blog';

// 簡單的內容渲染器（後續可以擴展為完整的 Editor.js 渲染器）
const ArticleContentRenderer: React.FC<{ content: any }> = ({ content }) => {
  if (!content || !content.blocks) {
    return null;
  }

  return (
    <div className="prose prose-lg max-w-none">
      {content.blocks.map((block: any, index: number) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <div key={index} className="mb-6">
                <Text 
                  variant="body" 
                  style={{ 
                    fontSize: '1.125rem', 
                    lineHeight: '1.7',
                    color: colors.neutral.label 
                  }}
                  dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
                />
              </div>
            );
          
          case 'header':
            const HeadingComponent = block.data.level === 1 ? 'h1' : 
                                   block.data.level === 2 ? 'h2' : 'h3';
            return (
              <div key={index} className="mb-6">
                <Text 
                  variant={block.data.level === 1 ? 'title2' : 'headline'} 
                  className="font-bold"
                  as={HeadingComponent}
                >
                  {block.data.text}
                </Text>
              </div>
            );
          
          case 'image':
            return (
              <div key={index} className="mb-8">
                <div className="relative w-full h-96">
                  <Image
                    src={block.data.file?.url || block.data.url}
                    alt={block.data.caption || ''}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                {block.data.caption && (
                  <Text variant="caption1" color={colors.neutral.secondaryLabel} className="mt-2 text-center">
                    {block.data.caption}
                  </Text>
                )}
              </div>
            );
          
          case 'quote':
            return (
              <blockquote key={index} className="border-l-4 border-gray-300 pl-6 my-8">
                <Text 
                  variant="headline" 
                  style={{ fontStyle: 'italic' }}
                  color={colors.neutral.secondaryLabel}
                >
                  {block.data.text}
                </Text>
                {block.data.caption && (
                  <Text variant="body" className="mt-2">
                    — {block.data.caption}
                  </Text>
                )}
              </blockquote>
            );
          
          case 'list':
            return (
              <div key={index} className="mb-6">
                {block.data.style === 'ordered' ? (
                  <ol className="list-decimal list-inside space-y-2">
                    {block.data.items.map((item: string, itemIndex: number) => (
                      <li key={itemIndex}>
                        <Text variant="body" style={{ display: 'inline' }}>
                          {item}
                        </Text>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ul className="list-disc list-inside space-y-2">
                    {block.data.items.map((item: string, itemIndex: number) => (
                      <li key={itemIndex}>
                        <Text variant="body" style={{ display: 'inline' }}>
                          {item}
                        </Text>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          
          default:
            return (
              <div key={index} className="mb-6">
                <Text variant="body" color={colors.neutral.secondaryLabel}>
                  [不支援的內容類型: {block.type}]
                </Text>
              </div>
            );
        }
      })}
    </div>
  );
};

const ArticlePage: React.FC = () => {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadArticle = async () => {
      try {
        setLoading(true);
        
        // 載入文章詳情
        const articleData = await articleService.getArticleBySlug(slug);
        setArticle(articleData);
        
        // 增加瀏覽次數
        await articleService.incrementViewCount(articleData.id);
        
        // 載入相關文章
        const relatedData = await articleService.getRelatedArticles(articleData.id, 3);
        setRelatedArticles(relatedData);
        
      } catch (err) {
        setError('載入文章失敗');
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Text variant="body" color={colors.neutral.secondaryLabel}>
          載入中...
        </Text>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Text variant="headline" className="mb-4">
            {error || '文章不存在'}
          </Text>
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            <Text variant="body">
              返回部落格
            </Text>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Article Header */}
      <header className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/blog" className="text-blue-600 hover:text-blue-800">
                部落格
              </Link>
              <span className="text-gray-400">/</span>
              {article.category && (
                <>
                  <Link 
                    href={`/blog?category=${article.category.slug}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {article.category.name}
                  </Link>
                  <span className="text-gray-400">/</span>
                </>
              )}
              <span className="text-gray-600">{article.title}</span>
            </div>
          </nav>

          {/* Article Meta */}
          <div className="mb-6">
            {article.category && (
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-4">
                {article.category.name}
              </span>
            )}
          </div>

          {/* Title */}
          <Text variant="title1" className="mb-4">
            {article.title}
          </Text>

          {/* Subtitle */}
          {article.subtitle && (
            <Text variant="headline" color={colors.neutral.secondaryLabel} className="mb-6">
              {article.subtitle}
            </Text>
          )}

          {/* Article Info */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              {/* Author */}
              <div className="flex items-center space-x-3">
                {article.author.avatar && (
                  <div className="w-10 h-10 relative rounded-full overflow-hidden">
                    <Image
                      src={article.author.avatar}
                      alt={article.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <Text variant="callout">
                    {article.author.name}
                  </Text>
                  {article.author.bio && (
                    <Text variant="caption1" color={colors.neutral.secondaryLabel}>
                      {article.author.bio}
                    </Text>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              <span>•</span>
              <span>{formatReadingTime(article.readingTime)}</span>
              <span>•</span>
              <span>{article.viewCount} 次瀏覽</span>
            </div>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {article.coverImage && (
        <div className="mb-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* Article Content */}
      <main className="pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <ArticleContentRenderer content={article.content} />

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Text variant="callout" className="mb-4">
                標籤
              </Text>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <Text variant="title2" className="mb-8 text-center">
              相關文章
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map((relatedArticle) => (
                <Link key={relatedArticle.id} href={`/blog/${relatedArticle.slug}`}>
                  <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {relatedArticle.coverImage && (
                      <div className="aspect-video relative">
                        <Image
                          src={relatedArticle.coverImage}
                          alt={relatedArticle.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-3">
                        <Text variant="caption1" color={colors.neutral.secondaryLabel}>
                          {formatDate(relatedArticle.publishedAt || relatedArticle.createdAt)}
                        </Text>
                        <Text variant="caption1" color={colors.neutral.secondaryLabel}>
                          {formatReadingTime(relatedArticle.readingTime)}
                        </Text>
                      </div>
                      <Text variant="headline" className="mb-3">
                        {relatedArticle.title}
                      </Text>
                      <div className="flex items-center justify-between">
                        <Text variant="caption1" color={colors.neutral.tertiaryLabel}>
                          {relatedArticle.author.name}
                        </Text>
                        {relatedArticle.category && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {relatedArticle.category.name}
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
    </div>
  );
};

export default ArticlePage;