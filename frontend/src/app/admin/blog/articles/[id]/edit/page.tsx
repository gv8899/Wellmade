'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { articleService, categoryService, authorService } from '@/services/blog';
import { Article, ArticleCategory, Author, ArticleStatus, UpdateArticleDto } from '@/types/blog';
import MediumStyleEditor, { MediumStyleEditorRef } from '@/components/editor/MediumStyleEditor';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<MediumStyleEditorRef>(null);

  useEffect(() => {
    loadArticleData();
    loadInitialData();
  }, [resolvedParams.id]);

  const loadArticleData = async () => {
    try {
      const articleData = await articleService.getArticleById(resolvedParams.id);
      setArticle(articleData);
    } catch (error) {
      console.error('Failed to load article:', error);
      router.push('/admin/blog/articles');
    }
  };

  const loadInitialData = async () => {
    try {
      const [categoriesData, authorsData] = await Promise.all([
        categoryService.getCategories(),
        authorService.getAuthors(),
      ]);
      setCategories(categoriesData);
      setAuthors(authorsData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleSave = async (data: any, publishStatus: ArticleStatus) => {
    try {
      setLoading(true);

      const updateData: UpdateArticleDto = {
        ...data,
        status: publishStatus,
      };

      await articleService.updateArticle(resolvedParams.id, updateData);
      
      // 重新載入文章數據
      await loadArticleData();
      
      alert('文章已成功更新！');
    } catch (error) {
      console.error('Failed to update article:', error);
      alert('更新文章失敗，請檢查輸入資料');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (article) {
      window.open(`/blog/${article.slug}`, '_blank');
    }
  };

  if (!article || categories.length === 0 || authors.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  const initialData = {
    title: article.title,
    subtitle: article.subtitle || '',
    slug: article.slug,
    excerpt: article.excerpt || '',
    coverImage: article.coverImage || '',
    categoryId: article.categoryId || '',
    authorId: article.authorId,
    status: article.status,
    tags: article.tags,
    metaTitle: article.metaTitle || '',
    metaDescription: article.metaDescription || '',
    canonicalUrl: article.canonicalUrl || '',
    socialImage: article.socialImage || '',
    content: article.content || {
      time: Date.now(),
      blocks: [],
      version: '2.22.2'
    }
  };

  return (
    <MediumStyleEditor
      ref={editorRef}
      initialData={initialData}
      categories={categories}
      authors={authors}
      onSave={handleSave}
      onPreview={handlePreview}
      loading={loading}
    />
  );
}