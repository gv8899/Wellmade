'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Text, Card } from '@/design-system';
import { articleService, categoryService, authorService } from '@/services/blog';
import { ArticleCategory, Author, ArticleStatus, CreateArticleDto } from '@/types/blog';
import RichTextEditor, { RichTextEditorRef, OutputData } from '@/components/editor/RichTextEditor';

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const editorRef = useRef<RichTextEditorRef>(null);

  // 文章基本資料
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [status, setStatus] = useState<ArticleStatus>('draft');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // SEO 設定
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [socialImage, setSocialImage] = useState('');

  // 富文本編輯器內容
  const [content, setContent] = useState<OutputData>({
    time: Date.now(),
    blocks: [],
    version: '2.22.2'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  // 自動生成 slug
  useEffect(() => {
    if (title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [title, slug]);

  const loadInitialData = async () => {
    try {
      const [categoriesData, authorsData] = await Promise.all([
        categoryService.getCategories(),
        authorService.getAuthors(),
      ]);
      setCategories(categoriesData);
      setAuthors(authorsData);
      
      // 預設選擇第一個作者
      if (authorsData.length > 0) {
        setAuthorId(authorsData[0].id);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (publishStatus: ArticleStatus = status) => {
    if (!title.trim() || !slug.trim() || !authorId) {
      alert('請填寫必要欄位：標題、URL slug 和作者');
      return;
    }

    try {
      setLoading(true);

      // 從編輯器獲取內容
      let articleContent = content;
      if (editorRef.current) {
        articleContent = await editorRef.current.save();
      }

      const articleData: CreateArticleDto = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        slug: slug.trim(),
        excerpt: excerpt.trim() || undefined,
        content: articleContent,
        coverImage: coverImage.trim() || undefined,
        categoryId: categoryId || undefined,
        authorId,
        status: publishStatus,
        tags,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        canonicalUrl: canonicalUrl.trim() || undefined,
        socialImage: socialImage.trim() || undefined,
      };

      const createdArticle = await articleService.createArticle(articleData);
      
      // 跳轉到編輯頁面
      router.push(`/admin/blog/articles/${createdArticle.id}/edit`);
    } catch (error) {
      console.error('Failed to create article:', error);
      alert('創建文章失敗，請檢查輸入資料');
    } finally {
      setLoading(false);
    }
  };

  const validateSlug = (value: string) => {
    const validSlug = /^[a-z0-9-]+$/.test(value);
    return validSlug;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <Text variant="title2" className="text-gray-900">
          新增文章
        </Text>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            儲存草稿
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            發布文章
          </button>
        </div>
      </div>

      {/* 標籤頁導航 */}
      <Card variant="default" padding="none">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              內容編輯
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'seo'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              SEO 設定
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              發布設定
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* 文章標題 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文章標題 *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="輸入吸引人的文章標題..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 副標題 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  副標題
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="補充說明或引言..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">wellmade.select/blog/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    placeholder="url-friendly-slug"
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      slug && !validateSlug(slug) ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {slug && !validateSlug(slug) && (
                  <Text variant="caption1" className="text-red-600 mt-1">
                    Slug 只能包含小寫字母、數字和連字符
                  </Text>
                )}
              </div>

              {/* 文章摘要 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文章摘要
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="簡短描述文章內容，用於列表頁面和社交分享..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Text variant="caption1" className="text-gray-500 mt-1">
                  建議長度：120-160 字元
                </Text>
              </div>

              {/* 封面圖片 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  封面圖片 URL
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 文章內容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文章內容
                </label>
                <RichTextEditor
                  ref={editorRef}
                  data={content}
                  onChange={setContent}
                  placeholder="開始撰寫你的文章內容..."
                />
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <Text variant="subhead" className="text-blue-800 mb-2">
                  SEO 優化提示
                </Text>
                <Text variant="caption1" className="text-blue-700">
                  良好的 SEO 設定可以提高文章在搜尋引擎的排名，增加曝光度和流量。
                </Text>
              </div>

              {/* Meta Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO 標題 (Meta Title)
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title || "針對搜尋引擎優化的標題..."}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-between mt-1">
                  <Text variant="caption1" className="text-gray-500">
                    建議長度：50-60 字元，包含主要關鍵字
                  </Text>
                  <Text variant="caption1" className={metaTitle.length > 60 ? 'text-red-500' : 'text-gray-500'}>
                    {metaTitle.length}/60
                  </Text>
                </div>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO 描述 (Meta Description)
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={excerpt || "吸引人的描述，會出現在搜尋結果中..."}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-between mt-1">
                  <Text variant="caption1" className="text-gray-500">
                    建議長度：120-160 字元，簡潔說明文章價值
                  </Text>
                  <Text variant="caption1" className={metaDescription.length > 160 ? 'text-red-500' : 'text-gray-500'}>
                    {metaDescription.length}/160
                  </Text>
                </div>
              </div>

              {/* Canonical URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  標準網址 (Canonical URL)
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://wellmade.select/blog/your-article-slug"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Text variant="caption1" className="text-gray-500 mt-1">
                  避免重複內容問題，通常保留空白即可自動生成
                </Text>
              </div>

              {/* Social Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  社交分享圖片
                </label>
                <input
                  type="url"
                  value={socialImage}
                  onChange={(e) => setSocialImage(e.target.value)}
                  placeholder="https://example.com/social-image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Text variant="caption1" className="text-gray-500 mt-1">
                  建議尺寸：1200x630px，用於 Facebook、Twitter 等社交平台分享
                </Text>
              </div>

              {/* SEO 預覽 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <Text variant="subhead" className="text-gray-700 mb-3">
                  搜尋結果預覽
                </Text>
                <div className="bg-white border border-gray-200 rounded p-3">
                  <Text variant="subhead" className="text-blue-600 mb-1">
                    {metaTitle || title || '文章標題'}
                  </Text>
                  <Text variant="caption1" className="text-green-700 mb-2">
                    wellmade.select/blog/{slug || 'article-slug'}
                  </Text>
                  <Text variant="caption1" className="text-gray-600">
                    {metaDescription || excerpt || '文章描述會出現在這裡...'}
                  </Text>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* 作者選擇 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  作者 *
                </label>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">請選擇作者</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 分類選擇 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文章分類
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">無分類</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 標籤 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文章標籤
                </label>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="輸入標籤後按 Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    新增
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 發布狀態 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  發布狀態
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已發布</option>
                  <option value="archived">已封存</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}