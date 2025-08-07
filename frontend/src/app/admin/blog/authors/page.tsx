'use client';

import { useState, useEffect } from 'react';
import { Text } from '@/design-system';
import { authorService } from '@/services/blog';
import { Author, CreateAuthorDto, UpdateAuthorDto } from '@/types/blog';
import { 
  AuthorForm, 
  AuthorList, 
  AuthorStatistics, 
  ToastContainer, 
  useToast 
} from '@/components/admin/blog';

export default function AuthorsManagePage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [statisticsAuthor, setStatisticsAuthor] = useState<Author | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      const data = await authorService.getAuthors();
      setAuthors(data);
    } catch (error) {
      console.error('Failed to load authors:', error);
      showError('載入作者列表失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleShowForm = () => {
    setEditingAuthor(null);
    setShowForm(true);
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingAuthor(null);
    setShowForm(false);
  };

  const handleSubmitForm = async (data: CreateAuthorDto | UpdateAuthorDto) => {
    setSubmitting(true);
    try {
      if (editingAuthor) {
        await authorService.updateAuthor(editingAuthor.id, data as UpdateAuthorDto);
        showSuccess('作者更新成功');
      } else {
        await authorService.createAuthor(data as CreateAuthorDto);
        showSuccess('作者創建成功');
      }
      setShowForm(false);
      setEditingAuthor(null);
      await loadAuthors();
    } catch (error: any) {
      console.error('Failed to save author:', error);
      const errorMessage = error.response?.data?.message || '儲存作者失敗，請重試';
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (authorId: string) => {
    try {
      await authorService.deleteAuthor(authorId);
      showSuccess('作者刪除成功');
      await loadAuthors();
    } catch (error: any) {
      console.error('Failed to delete author:', error);
      const errorMessage = error.response?.data?.message || '刪除作者失敗，請重試';
      showError(errorMessage);
    }
  };

  const handleViewStatistics = (author: Author) => {
    setStatisticsAuthor(author);
  };

  const handleCloseStatistics = () => {
    setStatisticsAuthor(null);
  };

  // 篩選作者
  const filteredAuthors = authors.filter(author => {
    const matchesSearch = author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (author.email && author.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (author.bio && author.bio.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // 統計資訊
  const getAuthorStats = () => {
    return {
      total: authors.length,
      withEmail: authors.filter(author => author.email).length,
      withBio: authors.filter(author => author.bio).length,
      withSocialLinks: authors.filter(author => author.socialLinks && Object.keys(author.socialLinks).length > 0).length,
    };
  };

  const stats = getAuthorStats();

  return (
    <div className="space-y-6">
      {/* Toast 容器 */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* 頁面標題和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Text variant="title2" className="text-gray-900">
            作者管理
          </Text>
          <Text variant="body" className="text-gray-600 mt-1">
            管理 Blog 文章作者，包含個人資訊和統計分析
          </Text>
        </div>
        <button
          onClick={handleShowForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          disabled={loading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>新增作者</span>
        </button>
      </div>

      {/* 統計卡片 */}
      {!showForm && !statisticsAuthor && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Text variant="title3" className="text-blue-600 font-bold">
              {stats.total}
            </Text>
            <Text variant="caption1" className="text-blue-700 mt-1">
              總作者數
            </Text>
          </div>

          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Text variant="title3" className="text-green-600 font-bold">
              {stats.withEmail}
            </Text>
            <Text variant="caption1" className="text-green-700 mt-1">
              有郵箱資訊
            </Text>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Text variant="title3" className="text-purple-600 font-bold">
              {stats.withBio}
            </Text>
            <Text variant="caption1" className="text-purple-700 mt-1">
              有個人簡介
            </Text>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <Text variant="title3" className="text-orange-600 font-bold">
              {stats.withSocialLinks}
            </Text>
            <Text variant="caption1" className="text-orange-700 mt-1">
              有社交連結
            </Text>
          </div>
        </div>
      )}

      {/* 搜尋框 */}
      {!showForm && !statisticsAuthor && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
          {/* 搜尋框 */}
          <div className="flex-1">
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜尋作者姓名、郵箱或簡介..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* 搜尋結果統計 */}
          {searchTerm && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg">
              <span>找到 {filteredAuthors.length} 位作者</span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 主要內容區域 */}
      {showForm ? (
        <AuthorForm
          author={editingAuthor || undefined}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          loading={submitting}
        />
      ) : statisticsAuthor ? (
        <AuthorStatistics
          author={statisticsAuthor}
          onClose={handleCloseStatistics}
        />
      ) : (
        <AuthorList
          authors={filteredAuthors}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewStatistics={handleViewStatistics}
          loading={loading}
        />
      )}

      {/* 空狀態提示 */}
      {!showForm && !statisticsAuthor && !loading && searchTerm && filteredAuthors.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Text variant="headline" className="text-gray-900 mb-2">
            找不到符合條件的作者
          </Text>
          <Text variant="body" className="text-gray-600 mb-4">
            嘗試調整搜尋條件或新增一位新作者
          </Text>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              清除搜尋
            </button>
            <button
              onClick={handleShowForm}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              新增作者
            </button>
          </div>
        </div>
      )}

      {/* 操作說明 */}
      {!showForm && !statisticsAuthor && !loading && authors.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <Text variant="subhead" className="text-blue-900">
                操作提示
              </Text>
              <Text variant="body" className="text-blue-800 mt-1">
                點擊作者卡片上的編輯圖示可以修改作者資訊，統計圖示可以查看詳細的數據分析，刪除圖示可以移除作者（不會影響已發布的文章）。
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}