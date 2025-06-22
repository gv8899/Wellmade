"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { adminApi, Brand } from "@/services/admin";
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaSearch, FaTags } from "react-icons/fa";
import toast from "react-hot-toast";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const allBrands = await adminApi.getAllBrands();
      
      // 前端篩選和搜尋
      let filteredBrands = allBrands;
      
      if (searchTerm) {
        filteredBrands = filteredBrands.filter(brand => 
          brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      if (statusFilter) {
        const isActive = statusFilter === 'active';
        filteredBrands = filteredBrands.filter(brand => brand.isActive === isActive);
      }
      
      setBrands(filteredBrands);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      toast.error("載入品牌失敗");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleToggleStatus = async (brandId: string) => {
    try {
      await adminApi.toggleBrandStatus(brandId);
      toast.success("品牌狀態已更新");
      fetchBrands(); // 重新載入
    } catch (error) {
      console.error("Failed to toggle brand status:", error);
      toast.error("更新品牌狀態失敗");
    }
  };

  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    if (!confirm(`確定要刪除品牌 "${brandName}" 嗎？此操作無法復原。`)) {
      return;
    }

    try {
      await adminApi.deleteBrand(brandId);
      toast.success("品牌已刪除");
      fetchBrands(); // 重新載入
    } catch (error) {
      console.error("Failed to delete brand:", error);
      toast.error("刪除品牌失敗");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div>
      {/* 頁面標題和操作 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">品牌管理</h2>
          <p className="text-gray-600 mt-1">管理所有品牌的資訊和狀態</p>
        </div>
        <Link
          href="/admin/brands/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          新增品牌
        </Link>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜尋品牌名稱或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          >
            <option value="">所有狀態</option>
            <option value="active">啟用</option>
            <option value="inactive">停用</option>
          </select>
        </div>
      </div>

      {/* 品牌列表 */}
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
                品牌列表 ({brands.length} 個品牌)
              </h3>
            </div>

            {/* 表格內容 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      品牌
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      描述
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      狀態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      建立時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {brands.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <FaTags className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">暫無品牌</p>
                        <p className="text-sm">點擊「新增品牌」開始建立您的第一個品牌</p>
                      </td>
                    </tr>
                  ) : (
                    brands.map((brand) => (
                      <tr key={brand.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0">
                              {brand.logoUrl ? (
                                <Image
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={brand.logoUrl}
                                  alt={brand.name}
                                  width={48}
                                  height={48}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <FaTags className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {brand.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {brand.description || "無描述"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            brand.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {brand.isActive ? '啟用' : '停用'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(brand.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/brands/${brand.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                              title="編輯"
                            >
                              <FaEdit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleToggleStatus(brand.id)}
                              className={`${
                                brand.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                              }`}
                              title={brand.isActive ? '停用' : '啟用'}
                            >
                              {brand.isActive ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteBrand(brand.id, brand.name)}
                              className="text-red-600 hover:text-red-900"
                              title="刪除"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}