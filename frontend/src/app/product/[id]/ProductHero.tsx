import React from "react";
import Image from "next/image";

interface ProductHeroProps {
  subtitle: string;
  title: string;
  description: string;
  imageUrl: string;
}

const ProductHero: React.FC<ProductHeroProps> = ({ subtitle, title, description, imageUrl }) => {
  return (
    <section className="w-full bg-white py-10 md:py-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16 px-4">
        {/* 左側文案 */}
        <div className="flex-1 w-full md:w-1/2 md:pr-6 text-left">
          <div className="text-sm text-gray-500 mb-2 tracking-wide">{subtitle}</div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">{title}</h1>
          <div className="text-base md:text-lg text-gray-700 mb-2 whitespace-pre-line">{description}</div>
        </div>
        {/* 右側主圖 */}
        <div className="flex-1 w-full md:w-1/2 flex justify-center items-center">
          <div className="w-full max-w-md aspect-square relative">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-contain rounded-xl shadow-md bg-gray-50"
                priority
                sizes="(max-width: 768px) 90vw, 40vw"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductHero;
