'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Text } from '@/design-system';
import { ArticleStatus, ArticleCategory, Author } from '@/types/blog';
import RichTextEditor, { RichTextEditorRef, OutputData } from './RichTextEditor';
import '@/styles/medium-editor.css';

interface MediumStyleEditorProps {
  initialData?: {
    title: string;
    subtitle?: string;
    slug: string;
    excerpt?: string;
    coverImage?: string;
    categoryId?: string;
    authorId: string;
    status: ArticleStatus;
    tags: string[];
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    socialImage?: string;
    content: OutputData;
  };
  categories: ArticleCategory[];
  authors: Author[];
  onSave: (data: any, publishStatus: ArticleStatus) => Promise<void>;
  onPreview?: () => void;
  loading?: boolean;
}

export interface MediumStyleEditorRef {
  save: () => Promise<any>;
}

const MediumStyleEditor = forwardRef<MediumStyleEditorRef, MediumStyleEditorProps>(
  ({ initialData, categories, authors, onSave, onPreview, loading }, ref) => {
    const editorRef = useRef<RichTextEditorRef>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);

    // 文章基本資料
    const [title, setTitle] = useState(initialData?.title || '');
    const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
    const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
    const [authorId, setAuthorId] = useState(initialData?.authorId || '');
    const [status, setStatus] = useState<ArticleStatus>(initialData?.status || 'draft');
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [tagInput, setTagInput] = useState('');

    // SEO 設定
    const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
    const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');
    const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || '');
    const [socialImage, setSocialImage] = useState(initialData?.socialImage || '');

    // 富文本編輯器內容
    const [content, setContent] = useState<OutputData>(
      initialData?.content || {
        time: Date.now(),
        blocks: [],
        version: '2.22.2'
      }
    );

    useImperativeHandle(ref, () => ({
      save: async () => {
        let articleContent = content;
        if (editorRef.current) {
          articleContent = await editorRef.current.save();
        }

        return {
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          slug: slug.trim(),
          excerpt: excerpt.trim() || undefined,
          content: articleContent,
          coverImage: coverImage.trim() || undefined,
          categoryId: categoryId || undefined,
          authorId,
          status,
          tags,
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
          canonicalUrl: canonicalUrl.trim() || undefined,
          socialImage: socialImage.trim() || undefined,
        };
      }
    }));

    const addTag = () => {
      if (tagInput.trim() && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setTagInput('');
      }
    };

    const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handlePublish = async (publishStatus: ArticleStatus) => {
      if (!title.trim() || !authorId) {
        alert('請填寫標題和選擇作者');
        return;
      }

      const data = await ref?.current?.save();
      if (data) {
        await onSave(data, publishStatus);
        setShowPublishModal(false);
      }
    };

    const generateSlugFromTitle = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };

    const handleTitleChange = (value: string) => {
      setTitle(value);
      if (!slug || slug === generateSlugFromTitle(title)) {
        setSlug(generateSlugFromTitle(value));
      }
    };

    return (
      <div className="min-h-screen bg-white medium-style-editor">
        {/* Medium 風格頂部導航 */}
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Text variant="title3" className="text-gray-900">Wellmade</Text>
              <Text variant="caption1" className="text-gray-500">
                {status === 'published' ? '已發布' : '草稿'}
              </Text>
            </div>
            
            <div className="flex items-center space-x-4">
              {onPreview && (
                <button
                  onClick={onPreview}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  預覽
                </button>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                設定
              </button>
              <button
                onClick={() => setShowPublishModal(true)}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                發布
              </button>
            </div>
          </div>
        </header>

        {/* 主要編輯區域 */}
        <main className="pt-24 pb-16">
          <div className="max-w-3xl mx-auto px-6">
            {/* 大標題輸入框 */}
            <div className="mb-8">
              <textarea
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="標題"
                className="w-full title-input border-none outline-none resize-none bg-transparent leading-tight"
                style={{ minHeight: '60px' }}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
            </div>

            {/* 副標題 */}
            {subtitle || title ? (
              <div className="mb-8">
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="副標題（選填）"
                  className="w-full subtitle-input border-none outline-none resize-none bg-transparent leading-relaxed"
                  style={{ minHeight: '32px' }}
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
              </div>
            ) : null}

            {/* 分隔線 */}
            {title && <div className="w-16 h-0.5 bg-gray-200 mb-12"></div>}

            {/* 富文本編輯器 */}
            <div className="relative">
              {/* Medium 風格的浮動添加按鈕 */}
              <div className="absolute -left-12 top-4 opacity-0 hover:opacity-100 transition-opacity group">
                <button
                  className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors shadow-sm"
                  onClick={() => {
                    // 這裡可以添加內容塊添加功能
                    console.log('Add content block');
                  }}
                  title="添加內容塊"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* 編輯器容器 */}
              <div className="max-w-none">
                <RichTextEditor
                  ref={editorRef}
                  data={content}
                  onChange={setContent}
                  placeholder="開始撰寫您的故事..."
                />
              </div>

              {/* Medium 風格的快捷鍵提示 */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-4 text-xs text-gray-400">
                  <span>按 <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600">Tab</kbd> 縮排</span>
                  <span>按 <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600">/</kbd> 插入工具</span>
                  <span>按 <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600">Enter</kbd> 新段落</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 設定側邊欄 */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowSettings(false)}>
            <div 
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <Text variant="title3" className="text-gray-900">文章設定</Text>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* URL Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* 摘要 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      文章摘要
                    </label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* 作者選擇 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      作者
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
                      分類
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
                      標籤
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
                        placeholder="新增標籤"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={addTag}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SEO 設定 */}
                  <div className="border-t pt-6">
                    <Text variant="subhead" className="text-gray-700 mb-4">SEO 設定</Text>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SEO 標題
                        </label>
                        <input
                          type="text"
                          value={metaTitle}
                          onChange={(e) => setMetaTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SEO 描述
                        </label>
                        <textarea
                          value={metaDescription}
                          onChange={(e) => setMetaDescription(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 發布模態框 */}
        {showPublishModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <Text variant="title3" className="text-gray-900 mb-4">發布文章</Text>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    發布狀態
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="draft">草稿</option>
                    <option value="published">發布</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => handlePublish('draft')}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  儲存草稿
                </button>
                <button
                  onClick={() => handlePublish('published')}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  發布
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

MediumStyleEditor.displayName = 'MediumStyleEditor';

export default MediumStyleEditor;