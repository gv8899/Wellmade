'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import BannerForm from '@/components/admin/banner/BannerForm';
import { FaArrowLeft } from 'react-icons/fa';

// 🎯 導入設計系統
import { Text } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

const CreateBannerPage: React.FC = () => {
  const [colorMode, setColorMode] = useState<ColorMode>('light');

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
          <Text variant="largeTitle" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
            新增 Banner
          </Text>
          <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
            創建新的網站橫幅或廣告內容
          </Text>
        </div>
      </div>

      {/* Banner 表單 */}
      <BannerForm mode="create" />
    </div>
  );
};

export default CreateBannerPage;