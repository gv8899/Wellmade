import React from "react";
import Image from "next/image";

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
}

const ProductHero: React.FC<ProductHeroProps> = ({
  subtitle,
  title,
  description,
  imageUrl,
  onPrimaryAction,
  onSecondaryAction,
  primaryText = "立即購買",
  secondaryText = "了解更多"
}) => {
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
          <div className="text-base md:text-lg text-blue-200 mb-2 tracking-wide font-medium ">
            {subtitle}
          </div>
        )}
        <h1 className="text-3xl md:text-5xl font-extrabold text-black mb-4 leading-tight ">
          {title}
        </h1>
        {description && (
          <div className="text-lg md:text-xl text-black/90 mb-8 whitespace-pre-line ">
            {description}
          </div>
        )}

      </div>
    </section>
  );
};

export default ProductHero;
