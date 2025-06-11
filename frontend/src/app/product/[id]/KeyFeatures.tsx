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
    <section className="w-full py-8 bg-white px-4 md:px-0">
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
              <div className="w-full h-[300px] relative overflow-hidden">
                {/* 圖片完全填滿卡片頂部 */}
                <img
                  src={f.image}
                  alt={f.title}
                  className="object-cover w-full h-full rounded-t-3xl"
                  draggable={false}
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100?text=Image+Not+Found'; }}
                />
              </div>
              <div className="flex-1 flex flex-col justify-end p-5">
                {f.subtitle && (
                  <div className="text-xs md:text-sm text-gray-500 font-semibold mb-1 tracking-wide">
                    {f.subtitle}
                  </div>
                )}
                <div className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                  {f.title}
                </div>
                <div className="text-gray-600 text-base md:text-lg leading-snug mb-1 min-h-[48px]">
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
