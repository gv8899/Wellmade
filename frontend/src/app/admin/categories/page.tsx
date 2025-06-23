"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { categoryApi, Category } from "@/services/categories";
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaSearch, FaSitemap, FaSort } from "react-icons/fa";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      if (viewMode === 'list') {
        const response = await categoryApi.getAll({
          page: currentPage,
          limit: 20,
          search: searchTerm || undefined,
          sortBy: 'sortOrder',
          sortOrder: 'ASC',
        });
        
        setCategories(response.categories);
        setTotalCategories(response.total);
        setTotalPages(response.totalPages);
      } else {
        const treeData = await categoryApi.getTree();
        setCategories(treeData);
        setTotalCategories(treeData.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("載入分類失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm, viewMode]);

  const handleToggleStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      await categoryApi.update(categoryId, { isActive: !currentStatus });
      toast.success("分類狀態已更新");
      fetchCategories();
    } catch (error) {
      console.error("Failed to toggle category status:", error);
      toast.error("更新分類狀態失敗");
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`確定要刪除分類 "${categoryName}" 嗎？此操作無法復原。`)) {
      return;
    }

    // 設置載入狀態
    setDeleteLoading(categoryId);

    try {
      await categoryApi.delete(categoryId);
      toast.success(`分類 "${categoryName}" 已成功刪除`);
      fetchCategories();
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      
      // 處理網路錯誤
      if (!error.response) {
        toast.error("網路連線錯誤，請檢查網路狀態後重試");
      } else {

      const status = error.response.status;
      const errorMessage = error.response?.data?.message || error.message || "未知錯誤";

      switch (status) {
        case 400:
          // 業務邏輯錯誤
          if (errorMessage.includes('子分類') || errorMessage.includes('children')) {
            toast.error("無法刪除含有子分類的分類，請先刪除所有子分類");
          } else if (errorMessage.includes('產品') || errorMessage.includes('product')) {
            toast.error("無法刪除有產品關聯的分類，請先將產品移至其他分類或刪除相關產品");
          } else if (errorMessage.includes('constraint') || errorMessage.includes('foreign key')) {
            toast.error("無法刪除此分類，因為存在相關聯的資料");
          } else {
            toast.error(`刪除失敗：${errorMessage}`);
          }
          break;
          
        case 401:
          toast.error("身份驗證失敗，請重新登入");
          break;
          
        case 403:
          toast.error("您沒有權限執行此操作");
          break;
          
        case 404:
          toast.error("找不到要刪除的分類，可能已被其他用戶刪除");
          // 重新載入分類列表
          fetchCategories();
          break;
          
        case 409:
          toast.error("分類正在被其他操作使用中，請稍後再試");
          break;
          
        case 500:
          toast.error("伺服器內部錯誤，請稍後再試或聯繫系統管理員");
          break;
          
        default:
          toast.error(`刪除失敗 (錯誤代碼: ${status})：${errorMessage}`);
      }
      }
    } finally {
      // 清除載入狀態
      setDeleteLoading(null);
    }
  };

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map((category) => (
      <tr key={category.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {category.name}
              </div>
              <div className="text-sm text-gray-500">
                {category.slug}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {category.parent?.name || "無"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {category.sortOrder}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            category.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {category.isActive ? '啟用' : '停用'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/categories/${category.id}/edit`}
              className="text-blue-600 hover:text-blue-900"
              title="編輯"
            >
              <FaEdit className="w-4 h-4" />
            </Link>
            <button
              onClick={() => handleToggleStatus(category.id, category.isActive)}
              className={`${
                category.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
              }`}
              title={category.isActive ? '停用' : '啟用'}
            >
              {category.isActive ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id, category.name)}
              disabled={deleteLoading === category.id}
              className={`${
                deleteLoading === category.id 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-red-600 hover:text-red-900'
              }`}
              title={deleteLoading === category.id ? "刪除中..." : "刪除"}
            >
              {deleteLoading === category.id ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FaTrash className="w-4 h-4" />
              )}
            </button>
          </div>
        </td>
        {category.children && category.children.length > 0 && renderCategoryTree(category.children, level + 1)}
      </tr>
    ));
  };

  return (
    <div>
      {/* 頁面標題和操作 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">分類管理</h2>
          <p className="text-gray-600 mt-1">管理產品分類的層級結構</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          新增分類
        </Link>
      </div>

      {/* 搜尋和檢視模式切換 */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜尋分類名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaSort className="w-4 h-4" />
              列表檢視
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                viewMode === 'tree' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaSitemap className="w-4 h-4" />
              樹狀檢視
            </button>
          </div>
        </div>
      </div>

      {/* 分類列表 */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* 表格標題 */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                分類列表 ({totalCategories} 個分類)
              </h3>
            </div>

            {/* 表格內容 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分類名稱
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      父分類
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      排序
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      狀態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {viewMode === 'tree' ? (
                    renderCategoryTree(categories)
                  ) : (
                    categories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {category.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {category.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {category.parent?.name || "無"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {category.sortOrder}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {category.isActive ? '啟用' : '停用'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/categories/${category.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                              title="編輯"
                            >
                              <FaEdit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleToggleStatus(category.id, category.isActive)}
                              className={`${
                                category.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                              }`}
                              title={category.isActive ? '停用' : '啟用'}
                            >
                              {category.isActive ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id, category.name)}
                              disabled={deleteLoading === category.id}
                              className={`${
                                deleteLoading === category.id 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-red-600 hover:text-red-900'
                              }`}
                              title={deleteLoading === category.id ? "刪除中..." : "刪除"}
                            >
                              {deleteLoading === category.id ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FaTrash className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 分頁 */}
            {viewMode === 'list' && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  顯示第 {(currentPage - 1) * 20 + 1} - {Math.min(currentPage * 20, totalCategories)} 筆，共 {totalCategories} 筆
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    上一頁
                  </button>
                  <span className="px-3 py-1 text-sm">
                    第 {currentPage} 頁，共 {totalPages} 頁
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    下一頁
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}