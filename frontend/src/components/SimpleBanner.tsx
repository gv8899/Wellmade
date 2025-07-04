'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Banner, BannerLinkType, BannerPosition } from '@/types/banner';
import { BannerService } from '@/services/banner';

interface SimpleBannerProps {
  position: BannerPosition;
  className?: string;
  height?: string;
  fallbackImage?: string;
}

/**
 * 簡化版 Banner 組件
 * 用於分類頁、商品詳情頁等其他頁面
 * 只顯示第一個有效的 Banner，不包含輪播功能
 */
const SimpleBanner: React.FC<SimpleBannerProps> = ({
  position,
  className = '',
  height = '20vh',
  fallbackImage,
}) => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 載入 Banner 資料
  useEffect(() => {
    const loadBanner = async () => {
      setIsLoading(true);
      
      try {
        const banners = await BannerService.getPublicBanners(position);
        setBanner(banners.length > 0 ? banners[0] : null);
      } catch (error) {
        console.error('載入 Banner 失敗:', error);
        setBanner(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadBanner();
  }, [position]);

  // 如果沒有 Banner 且沒有預設圖片，不顯示任何內容
  if (!isLoading && !banner && !fallbackImage) {
    return null;
  }

  // 如果正在載入且沒有預設圖片，顯示載入狀態
  if (isLoading && !fallbackImage) {
    return (
      <section 
        className={`w-full relative overflow-hidden bg-gray-200 animate-pulse ${className}`}
        style={{ height }}
      />
    );
  }

  const imageUrl = banner?.imageUrl || fallbackImage;
  
  if (!imageUrl) return null;

  // Banner 內容
  const BannerContent = () => (
    <section 
      className={`w-full relative overflow-hidden ${className}`}
      style={{ height }}
    >
      <Image
        src={imageUrl}
        alt={banner?.title || 'Banner'}
        fill
        className="object-cover"
        sizes="100vw"
        onError={(e) => {
          if (fallbackImage && imageUrl !== fallbackImage) {
            e.currentTarget.src = fallbackImage;
          }
        }}
      />
    </section>
  );

  // 如果有連結，包裝在適當的連結組件中
  if (banner?.linkUrl && banner.linkType !== BannerLinkType.NONE) {
    if (banner.linkType === BannerLinkType.EXTERNAL) {
      return (
        <a 
          href={banner.linkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <BannerContent />
        </a>
      );
    } else if (banner.linkType === BannerLinkType.INTERNAL) {
      return (
        <Link href={banner.linkUrl} className="block">
          <BannerContent />
        </Link>
      );
    }
  }

  return <BannerContent />;
};

export default SimpleBanner;