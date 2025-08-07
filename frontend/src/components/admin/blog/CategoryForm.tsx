'use client';

import React, { useState, useEffect } from 'react';
import { Text, Card } from '@/design-system';
import { ArticleCategory, CreateArticleCategoryDto, UpdateArticleCategoryDto } from '@/types/blog';

interface CategoryFormProps {
  category?: ArticleCategory;
  categories: ArticleCategory[];
  onSubmit: (data: CreateArticleCategoryDto | UpdateArticleCategoryDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  categories,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    coverImage: '',
    parentId: '',
    metaTitle: '',
    metaDescription: '',
    displayOrder: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初始化表單資料
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        coverImage: category.coverImage || '',
        parentId: category.parentId || '',
        metaTitle: category.metaTitle || '',
        metaDescription: category.metaDescription || '',
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      });
    } else {
      // 重置為空表單
      setFormData({
        name: '',
        slug: '',
        description: '',
        coverImage: '',
        parentId: '',
        metaTitle: '',
        metaDescription: '',
        displayOrder: 0,
        isActive: true,
      });
    }
    setErrors({});
  }, [category]);

  // 自動生成 slug
  useEffect(() => {
    if (formData.name && !category) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, category]);

  // 處理輸入變更
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除對應的錯誤訊息
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 驗證表單
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '分類名稱為必填項目';
    } else if (formData.name.length > 100) {
      newErrors.name = '分類名稱長度不能超過100字符';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'URL Slug 為必填項目';
    } else if (formData.slug.length > 100) {
      newErrors.slug = 'URL Slug 長度不能超過100字符';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'URL Slug 只能包含小寫字母、數字和連字符';
    }

    // 檢查 slug 重複（排除自己）
    const existingCategory = categories.find(cat => 
      cat.slug === formData.slug && cat.id !== category?.id
    );
    if (existingCategory) {
      newErrors.slug = '此 URL Slug 已被使用';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = '描述長度不能超過500字符';
    }

    if (formData.coverImage && formData.coverImage.length > 500) {
      newErrors.coverImage = '封面圖片URL長度不能超過500字符';
    }

    if (formData.metaTitle && formData.metaTitle.length > 200) {
      newErrors.metaTitle = 'SEO標題長度不能超過200字符';
    }

    if (formData.metaDescription && formData.metaDescription.length > 300) {
      newErrors.metaDescription = 'SEO描述長度不能超過300字符';
    }

    // 檢查父分類循環引用
    if (formData.parentId && category) {
      const isCircular = checkCircularReference(formData.parentId, category.id);
      if (isCircular) {
        newErrors.parentId = '不能選擇自己或子分類作為父分類';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 檢查循環引用
  const checkCircularReference = (parentId: string, currentId: string): boolean => {
    if (parentId === currentId) return true;
    
    const parent = categories.find(cat => cat.id === parentId);
    if (!parent || !parent.parentId) return false;
    
    return checkCircularReference(parent.parentId, currentId);
  };

  // 獲取可用的父分類選項（排除自己和子分類）
  const getAvailableParentCategories = (): ArticleCategory[] => {
    if (!category) return categories;
    
    return categories.filter(cat => {
      // 排除自己
      if (cat.id === category.id) return false;
      // 排除子分類
      if (isDescendant(cat.id, category.id)) return false;
      return true;
    });
  };

  // 檢查是否為子分類
  const isDescendant = (categoryId: string, ancestorId: string): boolean => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat || !cat.parentId) return false;
    if (cat.parentId === ancestorId) return true;
    return isDescendant(cat.parentId, ancestorId);
  };

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        coverImage: formData.coverImage.trim() || undefined,
        parentId: formData.parentId || undefined,
        metaTitle: formData.metaTitle.trim() || undefined,
        metaDescription: formData.metaDescription.trim() || undefined,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('提交表單失敗:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableParentCategories = getAvailableParentCategories();

  return (
    <Card variant="elevated" padding="large">
      <div className="flex items-center justify-between mb-6">
        <Text variant="title3" className="text-gray-900">
          {category ? '編輯分類' : '新增分類'}
        </Text>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          disabled={isSubmitting}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本資訊 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 分類名稱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分類名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="輸入分類名稱..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <Text variant="caption1" className="text-red-600 mt-1">
                {errors.name}
              </Text>
            )}
          </div>

          {/* URL Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase())}
              placeholder="url-friendly-slug"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.slug ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.slug && (
              <Text variant="caption1" className="text-red-600 mt-1">
                {errors.slug}
              </Text>
            )}
          </div>
        </div>

        {/* 父分類選擇 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            父分類
          </label>
          <select
            value={formData.parentId}
            onChange={(e) => handleInputChange('parentId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.parentId ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          >
            <option value="">-- 選擇父分類（可選）--</option>
            {availableParentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.parentId && (
            <Text variant="caption1" className="text-red-600 mt-1">
              {errors.parentId}
            </Text>
          )}
        </div>

        {/* 分類描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分類描述
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="簡短描述這個分類的內容..."
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <Text variant="caption1" className="text-red-600">
                {errors.description}
              </Text>
            ) : (
              <Text variant="caption1" className="text-gray-500">
                建議長度：100-200 字元
              </Text>
            )}
            <Text variant="caption1" className={formData.description.length > 400 ? 'text-red-500' : 'text-gray-500'}>
              {formData.description.length}/500
            </Text>
          </div>
        </div>

        {/* 封面圖片 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            封面圖片 URL
          </label>
          <input
            type="url"
            value={formData.coverImage}
            onChange={(e) => handleInputChange('coverImage', e.target.value)}
            placeholder="https://example.com/category-image.jpg"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.coverImage ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.coverImage && (
            <Text variant="caption1" className="text-red-600 mt-1">
              {errors.coverImage}
            </Text>
          )}
        </div>

        {/* 設定選項 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 顯示順序 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              顯示順序
            </label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
            />
            <Text variant="caption1" className="text-gray-500 mt-1">
              數字越小排序越前面
            </Text>
          </div>

          {/* 啟用狀態 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              狀態
            </label>
            <div className="flex items-center space-x-4 mt-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={() => handleInputChange('isActive', true)}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                <Text variant="body" className="text-green-700">啟用</Text>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isActive"
                  checked={!formData.isActive}
                  onChange={() => handleInputChange('isActive', false)}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                <Text variant="body" className="text-gray-600">停用</Text>
              </label>
            </div>
          </div>
        </div>

        {/* SEO 設定 */}
        <div className="border-t pt-6">
          <Text variant="subhead" className="text-gray-900 mb-4">
            SEO 設定
          </Text>
          
          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO 標題
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                placeholder={formData.name || "分類頁面的 SEO 標題..."}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.metaTitle ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              <div className="flex justify-between mt-1">
                {errors.metaTitle ? (
                  <Text variant="caption1" className="text-red-600">
                    {errors.metaTitle}
                  </Text>
                ) : (
                  <Text variant="caption1" className="text-gray-500">
                    建議長度：50-60 字元
                  </Text>
                )}
                <Text variant="caption1" className={formData.metaTitle.length > 60 ? 'text-red-500' : 'text-gray-500'}>
                  {formData.metaTitle.length}/200
                </Text>
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO 描述
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                placeholder={formData.description || "分類頁面的 SEO 描述..."}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
                  errors.metaDescription ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              <div className="flex justify-between mt-1">
                {errors.metaDescription ? (
                  <Text variant="caption1" className="text-red-600">
                    {errors.metaDescription}
                  </Text>
                ) : (
                  <Text variant="caption1" className="text-gray-500">
                    建議長度：120-160 字元
                  </Text>
                )}
                <Text variant="caption1" className={formData.metaDescription.length > 160 ? 'text-red-500' : 'text-gray-500'}>
                  {formData.metaDescription.length}/300
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* 提交按鈕 */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            取消
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? '儲存中...' : (category ? '更新分類' : '創建分類')}
          </button>
        </div>
      </form>
    </Card>
  );
};