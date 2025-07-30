import React from "react";

// 🎯 導入設計系統
import { Text } from "@/design-system";
import { colors } from "@/design-system";
import type { ColorMode } from "@/design-system";

export interface FeatureDetail {
  type: "image" | "video";
  src: string;
  title: string;
  description: string;
  direction?: "left" | "right"; // 決定桌機時圖在左或右
}

interface FeatureDetailsProps {
  details: FeatureDetail[];
}

const FeatureDetails: React.FC<FeatureDetailsProps> = ({ details }) => {
  const [colorMode] = React.useState<ColorMode>('light');
  
  // 除錯日誌
  React.useEffect(() => {
    console.log('🎯 FeatureDetails 接收到的資料:', details);
    details.forEach((detail, index) => {
      console.log(`Feature ${index}:`, {
        type: detail.type,
        src: detail.src,
        title: detail.title,
        description: detail.description
      });
    });
  }, [details]);
  
  return (
    <section className="flex flex-col gap-8 w-full py-12">
      {details.map((item, idx) => {
        return (
          <div key={idx} className="w-full">
            {/* 文字內容 - 在圖片上方的外部區域 */}
            <div className="flex flex-col items-center text-center px-6 md:px-12 mb-6">
              <Text 
                variant="title2" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                className="mb-4 max-w-4xl"
              >
                {item.title}
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.secondaryLabel} 
                colorMode={colorMode}
                className="max-w-3xl leading-relaxed"
              >
                {item.description}
              </Text>
            </div>
            
            {/* 圖片區域 - 手機版填滿寬度，桌機版使用容器限制寬度保持比例 */}
            <div className="w-full md:max-w-2xl md:mx-auto">
              <div className="w-full h-[400px] overflow-hidden">
              {item.type === "image" ? (
                <img 
                  src={item.src} 
                  alt={item.title} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    console.error(`❌ 圖片載入失敗: ${item.src}`);
                    console.error('錯誤詳情:', e);
                  }}
                  onLoad={() => {
                    console.log(`✅ 圖片載入成功: ${item.src}`);
                  }}
                />
              ) : (
                <video 
                  src={item.src} 
                  controls 
                  className="w-full h-full object-cover" 
                />
              )}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default FeatureDetails;
