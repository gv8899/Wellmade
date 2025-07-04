import React, { useState } from "react";
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
  return (
    <section className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* 背景主圖 */}
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover object-center w-full h-full z-0"
          priority
          sizes="100vw"
        />
      )}

      {/* 置中文字區塊 */}
      <div className="relative z-20 w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center px-4 py-12 h-full pt-2">
        {subtitle && (
          <Text 
            variant="headline" 
            color={colors.info} 
            colorMode={colorMode}
            style={{ 
              marginBottom: '0.5rem', 
              letterSpacing: '0.025em', 
              fontWeight: 'medium' 
            }}
          >
            {subtitle}
          </Text>
        )}
        <Text 
          variant="largeTitle" 
          color={colors.neutral.label} 
          colorMode={colorMode}
          style={{ 
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 'bold', 
            marginBottom: '1rem', 
            lineHeight: '1.1' 
          }}
        >
          {title}
        </Text>
        {description && (
          <Text 
            variant="title3" 
            color={colors.neutral.secondaryLabel} 
            colorMode={colorMode}
            style={{ 
              marginBottom: '2rem', 
              whiteSpace: 'pre-line' 
            }}
          >
            {description}
          </Text>
        )}

      </div>

      {/* 變體圖片選擇器 */}
      {variantImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <div className="flex gap-2">
              {variantImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => onImageChange?.(image)}
                  className="w-12 h-12 rounded-lg overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: image === imageUrl 
                      ? colors.primary.light 
                      : colors.neutral.tertiaryLabel.light,
                    boxShadow: image === imageUrl 
                      ? `0 0 0 2px ${colors.primary.light}20`
                      : 'none'
                  }}
                >
                  <Image
                    src={image}
                    alt={`變體圖片 ${index + 1}`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductHero;
