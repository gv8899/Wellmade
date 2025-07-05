"use client";
import { useEffect, useState } from "react";
import { adminApi, DashboardStats } from "@/services/admin";
import { FaBoxes, FaTags, FaUsers, FaEye, FaEyeSlash } from "react-icons/fa";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">總覽</h2>
        <p className="text-gray-600 mt-1">歡迎回到管理後台</p>
      </div>

      {/* 統計卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 產品統計 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">產品</p>
                <p className="text-3xl font-bold text-gray-900">{stats.products.total}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <FaEye className="w-3 h-3" />
                    {stats.products.active} 啟用
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <FaEyeSlash className="w-3 h-3" />
                    {stats.products.inactive} 停用
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaBoxes className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* 品牌統計 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">品牌</p>
                <p className="text-3xl font-bold text-gray-900">{stats.brands.total}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <FaEye className="w-3 h-3" />
                    {stats.brands.active} 啟用
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <FaEyeSlash className="w-3 h-3" />
                    {stats.brands.inactive} 停用
                  </span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaTags className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* 用戶統計 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">用戶</p>
                <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
                <p className="text-sm text-gray-500 mt-2">總註冊用戶數</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaUsers className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/products/new"
            className="flex flex-col items-center p-4 rounded-lg hover:bg-blue-50 transition-colors"
            style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)' }}
          >
            <FaBoxes className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">新增產品</span>
          </a>
          
          <a
            href="/admin/brands/new"
            className="flex flex-col items-center p-4 rounded-lg hover:bg-purple-50 transition-colors"
            style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)' }}
          >
            <FaTags className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">新增品牌</span>
          </a>
          
          <a
            href="/admin/products"
            className="flex flex-col items-center p-4 rounded-lg hover:bg-green-50 transition-colors"
            style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)' }}
          >
            <FaBoxes className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">管理產品</span>
          </a>
          
          <a
            href="/admin/users"
            className="flex flex-col items-center p-4 rounded-lg hover:bg-orange-50 transition-colors"
            style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)' }}
          >
            <FaUsers className="w-8 h-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">管理用戶</span>
          </a>
        </div>
      </div>
    </div>
  );
}