'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Banner, QueryBannerDto, BannerPosition } from '@/types/banner';
import { BannerService } from '@/services/banner';
import BannerList from '@/components/admin/banner/BannerList';
import { FaFilter, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// 🎯 導入設計系統
import { Text, Button } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

const BannersAdminPage: React.FC = () => {
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // 篩選狀態
  const [filters, setFilters] = useState<QueryBannerDto>({
    take: 50, // 一次載入更多，因為是管理界面
    skip: 0,
    includeInactive: true, // 預設顯示所有 Banner
  });

  // 載入 Banner 資料
  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const response = await BannerService.getBanners(filters);
      setBanners(response.items);
      setTotalCount(response.total);
    } catch (error) {
      console.error('載入 Banner 列表失敗:', error);
      toast.error('載入 Banner 列表失敗');
      setBanners([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始載入和篩選變更時重新載入
  useEffect(() => {
    loadBanners();
  }, [filters]);

  // 處理篩選變更
  const handleFilterChange = (newFilters: Partial<QueryBannerDto>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      skip: 0, // 篩選變更時重置分頁
    }));
  };

  // 處理 Banner 更新（重新載入列表）
  const handleBannerUpdate = () => {
    loadBanners();
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題和操作 */}
      <div className="flex justify-between items-start">
        <div>
          <Text variant="title1" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Banner 管理
          </Text>
          <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
            管理網站橫幅和廣告內容
            {totalCount > 0 && (
              <span className="ml-2">
                （共 {totalCount} 個 Banner）
              </span>
            )}
          </Text>
        </div>

        <Link href="/admin/banners/create">
          <Button variant="primary" size="large" colorMode={colorMode}>
            新增 Banner
          </Button>
        </Link>
      </div>

      {/* 篩選器 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-4 mb-4">
          <FaFilter className="w-5 h-5 text-gray-500" />
          <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'medium' }}>
            篩選條件
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 位置篩選 */}
          <div>
            <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ display: 'block', fontWeight: 'medium', marginBottom: '0.25rem' }}>
              顯示位置
            </Text>
            <select
              value={filters.position || ''}
              onChange={(e) => handleFilterChange({ 
                position: e.target.value ? e.target.value as BannerPosition : undefined 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              style={{
                borderColor: colors.neutral.tertiaryLabel.light,
              }}
            >
              <option value="">所有位置</option>
              <option value={BannerPosition.HOMEPAGE}>首頁主要</option>
              <option value={BannerPosition.HOMEPAGE_SECONDARY}>首頁次要</option>
              <option value={BannerPosition.CATEGORY_TOP}>分類頁頂部</option>
              <option value={BannerPosition.PRODUCT_DETAIL}>商品詳情頁</option>
            </select>
          </div>

          {/* 狀態篩選 */}
          <div>
            <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ display: 'block', fontWeight: 'medium', marginBottom: '0.25rem' }}>
              啟用狀態
            </Text>
            <select
              value={filters.isActive !== undefined ? (filters.isActive ? 'true' : 'false') : ''}
              onChange={(e) => handleFilterChange({ 
                isActive: e.target.value ? e.target.value === 'true' : undefined 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              style={{
                borderColor: colors.neutral.tertiaryLabel.light,
              }}
            >
              <option value="">全部狀態</option>
              <option value="true">已啟用</option>
              <option value="false">已停用</option>
            </select>
          </div>

          {/* 有效性篩選 */}
          <div>
            <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ display: 'block', fontWeight: 'medium', marginBottom: '0.25rem' }}>
              有效性
            </Text>
            <select
              value={filters.onlyCurrentlyActive ? 'current' : 'all'}
              onChange={(e) => handleFilterChange({ 
                onlyCurrentlyActive: e.target.value === 'current' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              style={{
                borderColor: colors.neutral.tertiaryLabel.light,
              }}
            >
              <option value="all">所有 Banner</option>
              <option value="current">僅當前有效</option>
            </select>
          </div>

          {/* 重置篩選 */}
          <div className="flex items-end">
            <Button
              variant="secondary"
              size="medium"
              colorMode={colorMode}
              onClick={() => setFilters({
                take: 50,
                skip: 0,
                includeInactive: true,
              })}
              style={{ width: '100%' }}
            >
              重置篩選
            </Button>
          </div>
        </div>
      </div>

      {/* Banner 列表 */}
      <BannerList 
        banners={banners}
        onBannerUpdate={handleBannerUpdate}
        isLoading={isLoading}
      />

      {/* 統計資訊 */}
      {!isLoading && banners.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode}>
                啟用中: {banners.filter(b => b.isActive).length}
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode}>
                已停用: {banners.filter(b => !b.isActive).length}
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode}>
                首頁: {banners.filter(b => b.position === BannerPosition.HOMEPAGE).length}
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode}>
                其他位置: {banners.filter(b => b.position !== BannerPosition.HOMEPAGE).length}
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersAdminPage;