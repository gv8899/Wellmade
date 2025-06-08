import React, { useRef } from "react";

export interface KeyFeatureCard {
  image: string; // 圖片路徑
  title: string;
  subtitle?: string;
  description: string;
}

interface KeyFeaturesProps {
  features: KeyFeatureCard[];
}

interface KeyFeaturesProps {
  features: KeyFeatureCard[];
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

const KeyFeatures: React.FC<KeyFeaturesProps> = ({ features, scrollRef }) => {
  return (
    <section className="w-full py-8 bg-white">
      <div className="max-w-6xl mx-auto relative">
        {/* 橫向捲動卡片列 */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 px-2 md:px-8 pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="min-w-[280px] max-w-xs flex-shrink-0 bg-white rounded-3xl shadow-md hover:shadow-xl transition p-0 snap-center flex flex-col overflow-hidden"
              style={{ height: 420 }}
            >
              <div className="h-2/3 w-full relative flex items-center justify-center bg-gray-100">
                {/* 圖片，建議使用 next/image 實際專案可替換 */}
                <img
                  src={f.image}
                  alt={f.title}
                  className="object-cover w-full h-full rounded-t-3xl"
                  style={{ maxHeight: 240 }}
                  draggable={false}
                />
              </div>
              <div className="flex-1 flex flex-col justify-between p-5">
                {f.subtitle && (
                  <div className="text-xs md:text-sm text-gray-500 font-semibold mb-1 tracking-wide">
                    {f.subtitle}
                  </div>
                )}
                <div className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                  {f.title}
                </div>
                <div className="text-gray-600 text-base md:text-lg leading-snug mb-1">
                  {f.description}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default KeyFeatures;
