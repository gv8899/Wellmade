'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Banner } from '@/types/banner';
import { BannerService } from '@/services/banner';
import BannerForm from '@/components/admin/banner/BannerForm';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// 🎯 導入設計系統
import { Text } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

const EditBannerPage: React.FC = () => {
  const params = useParams();
  const bannerId = params?.id as string;
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入 Banner 資料
  useEffect(() => {
    const loadBanner = async () => {
      if (!bannerId) {
        setError('無效的 Banner ID');
        setIsLoading(false);
        return;
      }

      try {
        const bannerData = await BannerService.getBanner(bannerId);
        setBanner(bannerData);
      } catch (error) {
        console.error('載入 Banner 失敗:', error);
        setError('載入 Banner 失敗，請稍後再試');
        toast.error('載入 Banner 失敗');
      } finally {
        setIsLoading(false);
      }
    };

    loadBanner();
  }, [bannerId]);

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{
            borderTopColor: colors.primary.light,
            borderBottomColor: colors.primary.light
          }}
        ></div>
      </div>
    );
  }

  // 錯誤狀態
  if (error || !banner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/banners"
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          
          <div>
            <Text variant="title1" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
              編輯 Banner
            </Text>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Text variant="title3" color={colors.danger} colorMode={colorMode} style={{ marginBottom: '1rem' }}>
            {error || '找不到指定的 Banner'}
          </Text>
          <Link href="/admin/banners">
            <Text variant="subhead" color={colors.primary.light} colorMode={colorMode} style={{ textDecoration: 'underline' }}>
              返回 Banner 列表
            </Text>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題和導航 */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/banners"
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        
        <div>
          <Text variant="title1" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
            編輯 Banner
          </Text>
          <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
            修改「{banner.title}」的設定
          </Text>
        </div>
      </div>

      {/* Banner 表單 */}
      <BannerForm banner={banner} mode="edit" />
    </div>
  );
};

export default EditBannerPage;