'use client';

import { useState, useEffect } from 'react';
import { Text } from '@/design-system';
import { categoryService } from '@/services/blog';
import { ArticleCategory, CreateArticleCategoryDto, UpdateArticleCategoryDto } from '@/types/blog';
import { CategoryForm } from '@/components/admin/blog/CategoryForm';
import { CategoryList } from '@/components/admin/blog/CategoryList';
import { ToastContainer, useToast } from '@/components/admin/blog/Toast';

export default function CategoriesManagePage() {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ArticleCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [submitting, setSubmitting] = useState(false);

  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      showError('載入分類列表失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleShowForm = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category: ArticleCategory) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleSubmitForm = async (data: CreateArticleCategoryDto | UpdateArticleCategoryDto) => {
    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, data as UpdateArticleCategoryDto);
        showSuccess('分類更新成功');
      } else {
        await categoryService.createCategory(data as CreateArticleCategoryDto);
        showSuccess('分類創建成功');
      }
      setShowForm(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      const errorMessage = error.response?.data?.message || '儲存分類失敗，請重試';
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await categoryService.deleteCategory(categoryId);
      showSuccess('分類刪除成功');
      await loadCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      const errorMessage = error.response?.data?.message || '刪除分類失敗，請重試';
      showError(errorMessage);
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    try {
      await categoryService.toggleCategoryStatus(categoryId);
      showSuccess('分類狀態更新成功');
      await loadCategories();
    } catch (error: any) {
      console.error('Failed to toggle category status:', error);
      const errorMessage = error.response?.data?.message || '更新分類狀態失敗，請重試';
      showError(errorMessage);
    }
  };

  // 篩選分類
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && category.isActive) ||
                         (statusFilter === 'inactive' && !category.isActive);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast 容器 */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* 頁面標題和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Text variant="title2" className="text-gray-900">
            分類管理
          </Text>
          <Text variant="body" className="text-gray-600 mt-1">
            管理 Blog 文章分類，支援階層結構和 SEO 設定
          </Text>
        </div>
        <button
          onClick={handleShowForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          新增分類
        </button>
      </div>

      {/* 搜尋和篩選 */}
      {!showForm && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
          {/* 搜尋框 */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜尋分類名稱、slug 或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* 狀態篩選 */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部狀態</option>
              <option value="active">啟用中</option>
              <option value="inactive">已停用</option>
            </select>
          </div>
        </div>
      )}

      {/* 表單或列表 */}
      {showForm ? (
        <CategoryForm
          category={editingCategory || undefined}
          categories={categories}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          loading={submitting}
        />
      ) : (
        <CategoryList
          categories={filteredCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      )}
    </div>
  );
}