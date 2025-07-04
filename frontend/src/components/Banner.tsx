'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Banner, BannerLinkType, BannerPosition } from '@/types/banner';
import { BannerService } from '@/services/banner';

// 🎯 導入設計系統
import { Text } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

interface BannerComponentProps {
  position?: BannerPosition;
  className?: string;
  height?: string;
  fallbackImage?: string;
  showTitle?: boolean;
  showDescription?: boolean;
}

const BannerComponent: React.FC<BannerComponentProps> = ({
  position = BannerPosition.HOMEPAGE,
  className = '',
  height = '32vh',
  fallbackImage = '/forest-banner.jpg',
  showTitle = false,
  showDescription = false,
}) => {
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入 Banner 資料
  useEffect(() => {
    const loadBanners = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const bannerData = await BannerService.getPublicBanners(position);
        
        if (bannerData && bannerData.length > 0) {
          setBanners(bannerData);
          setCurrentBannerIndex(0);
        } else {
          setBanners([]);
        }
      } catch (error) {
        console.error('載入 Banner 失敗:', error);
        setError('載入 Banner 失敗');
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBanners();
  }, [position]);

  // 自動輪播（如果有多個 Banner）
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, 5000); // 5秒切換一次

    return () => clearInterval(interval);
  }, [banners.length]);

  // 如果正在載入，顯示載入狀態
  if (isLoading) {
    return (
      <section 
        className={`w-full relative overflow-hidden ${className}`}
        style={{ height }}
      >
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
            style={{
              borderTopColor: colors.primary.light,
              borderBottomColor: colors.primary.light
            }}
          ></div>
        </div>
      </section>
    );
  }

  // 獲取當前顯示的 Banner
  const currentBanner = banners.length > 0 ? banners[currentBannerIndex] : null;
  
  // 決定要顯示的圖片
  const imageUrl = currentBanner?.imageUrl || fallbackImage;
  
  // Banner 內容組件
  const BannerContent = () => (
    <section 
      className={`w-full relative overflow-hidden ${className}`}
      style={{ height }}
    >
      <Image
        src={imageUrl}
        alt={currentBanner?.title || 'Banner'}
        fill
        priority
        className="object-cover"
        sizes="100vw"
        onError={(e) => {
          // 如果 API Banner 圖片載入失敗，回退到預設圖片
          if (currentBanner && imageUrl !== fallbackImage) {
            e.currentTarget.src = fallbackImage;
          }
        }}
      />
      
      {/* Banner 文字覆蓋層（可選） */}
      {currentBanner && (showTitle || showDescription) && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            {showTitle && currentBanner.title && (
              <Text 
                variant="largeTitle" 
                color={colors.background.systemBackground} 
                colorMode="dark"
                style={{ 
                  fontWeight: 'bold', 
                  marginBottom: showDescription ? '1rem' : '0',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                {currentBanner.title}
              </Text>
            )}
            
            {showDescription && currentBanner.description && (
              <Text 
                variant="title3" 
                color={colors.background.systemBackground} 
                colorMode="dark"
                style={{ 
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}
              >
                {currentBanner.description}
              </Text>
            )}
          </div>
        </div>
      )}
      
      {/* 輪播指示器（如果有多個 Banner） */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentBannerIndex 
                  ? 'bg-white' 
                  : 'bg-white bg-opacity-50'
              }`}
              onClick={() => setCurrentBannerIndex(index)}
              aria-label={`切換到第 ${index + 1} 個 Banner`}
            />
          ))}
        </div>
      )}
      
      {/* 左右切換按鈕（如果有多個 Banner） */}
      {banners.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-all"
            onClick={() => setCurrentBannerIndex(prev => 
              prev === 0 ? banners.length - 1 : prev - 1
            )}
            aria-label="上一個 Banner"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-all"
            onClick={() => setCurrentBannerIndex(prev => 
              (prev + 1) % banners.length
            )}
            aria-label="下一個 Banner"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </>
      )}
    </section>
  );

  // 如果有連結，包裝在 Link 中
  if (currentBanner?.linkUrl && currentBanner.linkType !== BannerLinkType.NONE) {
    if (currentBanner.linkType === BannerLinkType.EXTERNAL) {
      return (
        <a 
          href={currentBanner.linkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <BannerContent />
        </a>
      );
    } else if (currentBanner.linkType === BannerLinkType.INTERNAL) {
      return (
        <Link href={currentBanner.linkUrl} className="block">
          <BannerContent />
        </Link>
      );
    }
  }

  return <BannerContent />;
};

export default BannerComponent;