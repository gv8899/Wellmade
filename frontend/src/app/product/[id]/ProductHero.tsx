import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

// 🎯 導入設計系統
import { Text } from "@/design-system";
import { colors } from "@/design-system";
import type { ColorMode } from "@/design-system";

interface ProductHeroProps {
  subtitle: string;
  title: string;
  description: string;
  imageUrl: string;
  // 可擴充按鈕 props
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryText?: string;
  secondaryText?: string;
  // 變體圖片相關
  variantImages?: string[];
  onImageChange?: (imageUrl: string) => void;
}

const ProductHero: React.FC<ProductHeroProps> = ({
  subtitle,
  title,
  description,
  imageUrl,
  onPrimaryAction,
  onSecondaryAction,
  primaryText = "立即購買",
  secondaryText = "了解更多",
  variantImages = [],
  onImageChange
}) => {
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 準備圖片列表，如果沒有變體圖片就使用主圖
  const images = variantImages.length > 0 ? variantImages : [imageUrl];
  const currentImage = images[currentImageIndex] || imageUrl;

  // 處理圓點點擊
  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
    if (onImageChange && images[index]) {
      onImageChange(images[index]);
    }
  };

  // 處理觸摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    // 不要阻止預設行為，讓觸摸滑動正常運作
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const endX = e.changedTouches[0].clientX;
    const moveX = endX - startX;
    const threshold = 50; // 滑動閾值

    if (Math.abs(moveX) > threshold) {
      if (moveX > 0 && currentImageIndex > 0) {
        // 向右滑動，顯示上一張
        const newIndex = currentImageIndex - 1;
        setCurrentImageIndex(newIndex);
        if (onImageChange && images[newIndex]) {
          onImageChange(images[newIndex]);
        }
      } else if (moveX < 0 && currentImageIndex < images.length - 1) {
        // 向左滑動，顯示下一張
        const newIndex = currentImageIndex + 1;
        setCurrentImageIndex(newIndex);
        if (onImageChange && images[newIndex]) {
          onImageChange(images[newIndex]);
        }
      }
    }
  };

  // 處理滑鼠事件（桌面版）
  const handleMouseStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
  };

  const handleMouseEnd = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const moveX = e.clientX - startX;
    const threshold = 50;

    if (Math.abs(moveX) > threshold) {
      if (moveX > 0 && currentImageIndex > 0) {
        const newIndex = currentImageIndex - 1;
        setCurrentImageIndex(newIndex);
        if (onImageChange && images[newIndex]) {
          onImageChange(images[newIndex]);
        }
      } else if (moveX < 0 && currentImageIndex < images.length - 1) {
        const newIndex = currentImageIndex + 1;
        setCurrentImageIndex(newIndex);
        if (onImageChange && images[newIndex]) {
          onImageChange(images[newIndex]);
        }
      }
    }
  };

  return (
    <section 
      className="relative w-full overflow-hidden cursor-grab select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseStart}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseEnd}
      onMouseLeave={handleMouseEnd}
      style={{ 
        cursor: isDragging ? 'grabbing' : 'grab',
        height: '70vh'
      }}
    >
      {/* 背景主圖 */}
      {currentImage && (
        <Image
          src={currentImage}
          alt={title}
          fill
          className="object-cover object-center w-full h-full z-0 transition-opacity duration-300"
          priority
          sizes="100vw"
        />
      )}

      {/* 圓點指示器 - 覆蓋在圖片底部 */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex gap-2">
            {images.map((_, index) => {
              const isActive = index === currentImageIndex;
              return (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className="transition-all duration-200 hover:scale-110"
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: isActive 
                      ? 'rgba(255, 255, 255, 1)' 
                      : 'rgba(255, 255, 255, 0.5)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  aria-label={`切換到圖片 ${index + 1}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductHero;
