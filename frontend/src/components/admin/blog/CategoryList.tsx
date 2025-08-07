'use client';

import React, { useState } from 'react';
import { Text, Card } from '@/design-system';
import { ArticleCategory } from '@/types/blog';

interface CategoryListProps {
  categories: ArticleCategory[];
  onEdit: (category: ArticleCategory) => void;
  onDelete: (categoryId: string) => void;
  onToggleStatus: (categoryId: string) => void;
  loading?: boolean;
}

interface CategoryItemProps {
  category: ArticleCategory;
  level: number;
  onEdit: (category: ArticleCategory) => void;
  onDelete: (categoryId: string) => void;
  onToggleStatus: (categoryId: string) => void;
  children?: ArticleCategory[];
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  level,
  onEdit,
  onDelete,
  onToggleStatus,
  children = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = children.length > 0;

  const handleDelete = () => {
    if (hasChildren) {
      if (!confirm(`此分類下有 ${children.length} 個子分類，刪除後子分類也會被刪除。確定要繼續嗎？`)) {
        return;
      }
    } else {
      if (!confirm('確定要刪除這個分類嗎？此操作無法復原。')) {
        return;
      }
    }
    onDelete(category.id);
  };

  const handleToggleStatus = () => {
    const action = category.isActive ? '停用' : '啟用';
    if (confirm(`確定要${action}這個分類嗎？`)) {
      onToggleStatus(category.id);
    }
  };

  return (
    <div className="border-l-2 border-gray-100">
      <Card 
        variant="default" 
        padding="large" 
        className={`ml-${level * 4} mb-2 ${!category.isActive ? 'opacity-60' : ''}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* 分類標題和狀態 */}
            <div className="flex items-center space-x-3 mb-2">
              {/* 展開/摺疊按鈕 */}
              {hasChildren && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isExpanded ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              )}
              
              {/* 層級指示器 */}
              {level > 0 && (
                <div className="flex items-center space-x-1">
                  {Array.from({ length: level }).map((_, i) => (
                    <div key={i} className="w-3 h-px bg-gray-300" />
                  ))}
                  <Text variant="caption1" className="text-gray-400">└</Text>
                </div>
              )}

              <Text variant="headline" className="text-gray-900">
                {category.name}
              </Text>

              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                /{category.slug}
              </span>

              {category.isActive ? (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  啟用
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                  停用
                </span>
              )}

              {hasChildren && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                  {children.length} 個子分類
                </span>
              )}
            </div>

            {/* 分類描述 */}
            {category.description && (
              <Text variant="body" className="text-gray-600 mb-3">
                {category.description}
              </Text>
            )}

            {/* 封面圖片預覽 */}
            {category.coverImage && (
              <div className="mb-3">
                <img
                  src={category.coverImage}
                  alt={category.name}
                  className="w-24 h-16 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* SEO 預覽 */}
            {(category.metaTitle || category.metaDescription) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                <Text variant="caption1" className="text-gray-600 mb-1">SEO 預覽：</Text>
                <Text variant="subhead" className="text-blue-600">
                  {category.metaTitle || category.name}
                </Text>
                {category.metaDescription && (
                  <Text variant="caption1" className="text-gray-600 mt-1 line-clamp-2">
                    {category.metaDescription}
                  </Text>
                )}
              </div>
            )}

            {/* 分類資訊 */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>順序：{category.displayOrder}</span>
              <span>創建：{new Date(category.createdAt).toLocaleDateString('zh-TW')}</span>
              <span>更新：{new Date(category.updatedAt).toLocaleDateString('zh-TW')}</span>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onEdit(category)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              編輯
            </button>
            <button
              onClick={handleToggleStatus}
              className={`text-sm font-medium transition-colors ${
                category.isActive 
                  ? 'text-orange-600 hover:text-orange-700' 
                  : 'text-green-600 hover:text-green-700'
              }`}
            >
              {category.isActive ? '停用' : '啟用'}
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
            >
              刪除
            </button>
          </div>
        </div>
      </Card>

      {/* 子分類 */}
      {hasChildren && isExpanded && (
        <div className="ml-4 border-l border-gray-200 pl-4">
          {children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              children={[]} // 這裡需要從父組件傳入子分類的子分類
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEdit,
  onDelete,
  onToggleStatus,
  loading = false,
}) => {
  // 建立階層結構
  const buildCategoryTree = (categories: ArticleCategory[]): { roots: ArticleCategory[], childrenMap: Map<string, ArticleCategory[]> } => {
    const roots: ArticleCategory[] = [];
    const childrenMap = new Map<string, ArticleCategory[]>();

    // 初始化所有分類的子分類陣列
    categories.forEach(category => {
      childrenMap.set(category.id, []);
    });

    // 分類根分類和子分類
    categories.forEach(category => {
      if (!category.parentId) {
        roots.push(category);
      } else {
        const siblings = childrenMap.get(category.parentId) || [];
        siblings.push(category);
        childrenMap.set(category.parentId, siblings);
      }
    });

    // 按顯示順序排序
    const sortByDisplayOrder = (cats: ArticleCategory[]) => {
      return cats.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
    };

    roots.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
    childrenMap.forEach((children, parentId) => {
      childrenMap.set(parentId, sortByDisplayOrder(children));
    });

    return { roots, childrenMap };
  };

  const { roots, childrenMap } = buildCategoryTree(categories);

  // 遞歸渲染分類樹
  const renderCategoryTree = (categoryList: ArticleCategory[], level: number = 0): React.ReactNode => {
    return categoryList.map(category => {
      const children = childrenMap.get(category.id) || [];
      return (
        <div key={category.id}>
          <CategoryItem
            category={category}
            level={level}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            children={children}
          />
          {children.length > 0 && (
            <div className="ml-8">
              {renderCategoryTree(children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <Text variant="body" color="text-gray-500">載入中...</Text>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <Card variant="default" padding="large">
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <Text variant="body" color="text-gray-500" className="mb-2">
            還沒有任何分類
          </Text>
          <Text variant="caption1" color="text-gray-400">
            點擊上方的「新增分類」按鈕來創建第一個分類
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {/* 分類統計 */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <Text variant="title3" className="text-gray-900">{categories.length}</Text>
            <Text variant="caption1" className="text-gray-500">總分類數</Text>
          </div>
          <div className="text-center">
            <Text variant="title3" className="text-green-600">
              {categories.filter(cat => cat.isActive).length}
            </Text>
            <Text variant="caption1" className="text-gray-500">啟用中</Text>
          </div>
          <div className="text-center">
            <Text variant="title3" className="text-gray-600">
              {categories.filter(cat => !cat.isActive).length}
            </Text>
            <Text variant="caption1" className="text-gray-500">已停用</Text>
          </div>
          <div className="text-center">
            <Text variant="title3" className="text-purple-600">{roots.length}</Text>
            <Text variant="caption1" className="text-gray-500">根分類</Text>
          </div>
        </div>
      </div>

      {/* 分類樹 */}
      <div className="space-y-2">
        {renderCategoryTree(roots)}
      </div>
    </div>
  );
};