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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [animationId, setAnimationId] = useState(0);

  // 準備圖片列表，如果沒有變體圖片就使用主圖
  const images = variantImages.length > 0 ? variantImages : [imageUrl];
  const currentImage = images[currentImageIndex] || imageUrl;

  // 輔助函數：設置滑動位置
  const setSliderPosition = () => {
    if (containerRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('設置位置:', currentTranslate);
      }
      containerRef.current.style.transform = `translateX(${currentTranslate}px)`;
    }
  };

  // 動畫函數
  const animation = () => {
    setSliderPosition();
    if (isDragging) {
      const id = requestAnimationFrame(animation);
      setAnimationId(id);
    }
  };

  // 獲取位置索引
  const getPositionX = (event: TouchEvent | MouseEvent) => {
    return event.type.includes('mouse') 
      ? (event as MouseEvent).clientX 
      : (event as TouchEvent).touches[0].clientX;
  };

  // 設置到指定索引
  const setPositionByIndex = (index: number) => {
    // 每個圖片的寬度是視窗寬度
    const slideWidth = window.innerWidth;
    setCurrentImageIndex(index);
    const translateValue = -index * slideWidth;
    setPrevTranslate(translateValue);
    setCurrentTranslate(translateValue);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('設置索引位置:', { 
        index, 
        slideWidth, 
        translateValue, 
        containerWidth: containerRef.current?.offsetWidth,
        imagesLength: images.length 
      });
    }
    
    // 直接設置 transform
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${translateValue}px)`;
    }
    
    if (onImageChange && images[index]) {
      onImageChange(images[index]);
    }
  };

  // 處理圓點點擊
  const handleDotClick = (index: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('點擊圓點:', index, '當前索引:', currentImageIndex);
    }
    setPositionByIndex(index);
  };

  // 開始拖拽
  const dragStart = (index: number) => (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    setStartX(getPositionX(e.nativeEvent));
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (containerRef.current) {
      containerRef.current.style.transition = 'none';
    }
    requestAnimationFrame(animation);
  };

  // 拖拽中
  const dragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const currentPosition = getPositionX(e.nativeEvent);
    const diff = currentPosition - startX;
    const newTranslate = prevTranslate + diff;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('滑動中:', { currentPosition, diff, newTranslate, prevTranslate });
    }
    setCurrentTranslate(newTranslate);
  };

  // 結束拖拽
  const dragEnd = () => {
    setIsDragging(false);
    if (animationId) {
      cancelAnimationFrame(animationId);
    }

    // 添加過渡動畫
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.3s ease-out';
    }

    const slideWidth = window.innerWidth;
    const movedBy = currentTranslate - prevTranslate;

    if (process.env.NODE_ENV === 'development') {
      console.log('拖拽結束:', { 
        movedBy, 
        currentTranslate, 
        prevTranslate, 
        currentImageIndex, 
        slideWidth,
        totalImages: images.length 
      });
    }

    // 如果移動距離大於閾值，切換到下一張/上一張
    if (movedBy < -100 && currentImageIndex < images.length - 1) {
      // 向左滑動，下一張
      setPositionByIndex(currentImageIndex + 1);
    } else if (movedBy > 100 && currentImageIndex > 0) {
      // 向右滑動，上一張
      setPositionByIndex(currentImageIndex - 1);
    } else {
      // 回彈到當前位置
      setPositionByIndex(currentImageIndex);
    }
  };

  // 觸摸事件處理
  const handleTouchStart = dragStart(currentImageIndex);
  const handleTouchMove = dragMove;
  const handleTouchEnd = dragEnd;

  // 滑鼠事件處理
  const handleMouseDown = dragStart(currentImageIndex);
  const handleMouseMove = dragMove;
  const handleMouseUp = dragEnd;
  const handleMouseLeave = dragEnd;

  // 初始化位置
  useEffect(() => {
    // 初始化
    setTimeout(() => {
      setPositionByIndex(0);
    }, 100);
  }, []);

  // 處理窗口大小變化
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setPositionByIndex(currentImageIndex);
      }
    };

    // 監聽窗口大小變化
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentImageIndex]);

  // 清理動畫
  useEffect(() => {
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [animationId]);

  // 當 currentTranslate 變化時立即更新 DOM
  useEffect(() => {
    setSliderPosition();
  }, [currentTranslate]);

  return (
    <section 
      className="relative w-full overflow-hidden"
      style={{ height: '70vh' }}
      data-testid="product-hero"
    >
      {/* 滑動容器 */}
      <div
        ref={containerRef}
        className="flex w-full h-full cursor-grab select-none"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="relative flex-shrink-0 h-full"
            style={{ width: '100vw' }}
          >
            <Image
              src={image}
              alt={`${title} - 圖片 ${index + 1}`}
              fill
              className="object-cover object-center"
              priority={index === 0}
              sizes="100vw"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* 圓點指示器 - 覆蓋在圖片底部 */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex gap-2">
            {images.map((_, index) => {
              const isActive = index === currentImageIndex;
              // 只在開發環境輸出調試信息
              if (process.env.NODE_ENV === 'development') {
                console.log(`圓點 ${index}: 激活狀態 = ${isActive}, 當前索引 = ${currentImageIndex}`);
              }
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
                  data-active={isActive} // 添加測試用的屬性
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
