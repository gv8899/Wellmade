'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Banner, 
  BannerPosition, 
  BannerPositionLabels, 
  BannerLinkTypeLabels 
} from '@/types/banner';
import { BannerService } from '@/services/banner';
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// 🎯 導入設計系統
import { Text, Button } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

interface BannerListProps {
  banners: Banner[];
  onBannerUpdate: () => void;
  isLoading?: boolean;
}

const BannerList: React.FC<BannerListProps> = ({ 
  banners, 
  onBannerUpdate, 
  isLoading = false 
}) => {
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 切換 Banner 啟用狀態
  const handleToggleActive = async (id: string) => {
    if (processingId) return;
    
    setProcessingId(id);
    try {
      await BannerService.toggleBannerActive(id);
      toast.success('Banner 狀態已更新');
      onBannerUpdate();
    } catch (error) {
      console.error('切換 Banner 狀態失敗:', error);
      toast.error('切換狀態失敗');
    } finally {
      setProcessingId(null);
    }
  };

  // 刪除 Banner
  const handleDelete = async (id: string, title: string) => {
    if (processingId) return;
    
    if (!confirm(`確定要刪除 Banner「${title}」嗎？此操作無法撤銷。`)) {
      return;
    }

    setProcessingId(id);
    try {
      await BannerService.deleteBanner(id);
      toast.success('Banner 已刪除');
      onBannerUpdate();
    } catch (error) {
      console.error('刪除 Banner 失敗:', error);
      toast.error('刪除失敗');
    } finally {
      setProcessingId(null);
    }
  };

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '無限制';
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 檢查 Banner 是否當前有效
  const isCurrentlyActive = (banner: Banner) => {
    if (!banner.isActive) return false;
    
    const now = new Date();
    if (banner.startDate && now < new Date(banner.startDate)) return false;
    if (banner.endDate && now > new Date(banner.endDate)) return false;
    
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
          style={{
            borderTopColor: colors.primary.light,
            borderBottomColor: colors.primary.light
          }}
        ></div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="text-center py-12">
        <Text variant="title3" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
          目前沒有任何 Banner
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 按位置分組顯示 */}
      {Object.values(BannerPosition).map((position) => {
        const positionBanners = banners
          .filter(banner => banner.position === position)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        if (positionBanners.length === 0) return null;

        return (
          <div key={position} className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <Text variant="title3" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold' }}>
                {BannerPositionLabels[position]} ({positionBanners.length})
              </Text>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {positionBanners.map((banner) => {
                  const isActive = isCurrentlyActive(banner);
                  
                  return (
                    <div 
                      key={banner.id} 
                      className={`flex items-center gap-4 p-4 border rounded-lg transition-all ${
                        isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {/* Banner 縮圖 */}
                      <div className="w-24 h-16 relative flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Banner 資訊 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                              {banner.title}
                            </Text>
                            
                            {banner.description && (
                              <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ marginBottom: '0.5rem' }}>
                                {banner.description}
                              </Text>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Text variant="footnote" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
                                  排序:
                                </Text>
                                <Text variant="footnote" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'medium' }}>
                                  {banner.sortOrder}
                                </Text>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Text variant="footnote" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
                                  連結:
                                </Text>
                                <Text variant="footnote" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'medium' }}>
                                  {BannerLinkTypeLabels[banner.linkType]}
                                </Text>
                                {banner.linkUrl && (
                                  <a 
                                    href={banner.linkUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700"
                                  >
                                    <FaExternalLinkAlt className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Text variant="footnote" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
                                  開始:
                                </Text>
                                <Text variant="footnote" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'medium' }}>
                                  {formatDate(banner.startDate)}
                                </Text>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Text variant="footnote" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
                                  結束:
                                </Text>
                                <Text variant="footnote" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'medium' }}>
                                  {formatDate(banner.endDate)}
                                </Text>
                              </div>
                            </div>
                          </div>

                          {/* 狀態指示器 */}
                          <div className="flex items-center gap-2 ml-4">
                            <div 
                              className={`w-3 h-3 rounded-full ${
                                isActive ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                              title={isActive ? '啟用中' : '已停用'}
                            />
                            <Text variant="footnote" color={isActive ? colors.success : colors.neutral.tertiaryLabel} colorMode={colorMode} style={{ fontWeight: 'medium' }}>
                              {isActive ? '啟用中' : '已停用'}
                            </Text>
                          </div>
                        </div>
                      </div>

                      {/* 操作按鈕 */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* 編輯 */}
                        <Link href={`/admin/banners/${banner.id}/edit`}>
                          <Button variant="secondary" size="small" colorMode={colorMode}>
                            <FaEdit className="w-4 h-4" />
                          </Button>
                        </Link>

                        {/* 切換啟用狀態 */}
                        <Button
                          variant={banner.isActive ? "warning" : "info"}
                          size="small"
                          colorMode={colorMode}
                          disabled={processingId === banner.id}
                          onClick={() => handleToggleActive(banner.id)}
                        >
                          {banner.isActive ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                        </Button>

                        {/* 刪除 */}
                        <Button
                          variant="danger"
                          size="small"
                          colorMode={colorMode}
                          disabled={processingId === banner.id}
                          onClick={() => handleDelete(banner.id, banner.title)}
                        >
                          <FaTrash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BannerList;