import React from "react";

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
  return (
    <section className="flex flex-col gap-16 w-full max-w-5xl mx-auto py-12 px-4 md:px-0">
      {details.map((item, idx) => {
        // 桌機左右交錯，手機皆為上下
        const isReverse = (item.direction === "right") || (item.direction === undefined && idx % 2 === 1);
        return (
          <div
            key={idx}
            className={`flex flex-col md:flex-row ${isReverse ? 'md:flex-row-reverse' : ''} items-center gap-8 md:gap-16`}
          >
            <div className="w-full md:w-1/2 flex justify-center">
              {item.type === "image" ? (
                <img src={item.src} alt={item.title} className="rounded-xl shadow-md max-h-80 object-cover w-full" />
              ) : (
                <video src={item.src} controls className="rounded-xl shadow-md max-h-80 object-cover w-full" />
              )}
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">{item.title}</h3>
              <p className="text-gray-700 text-lg leading-relaxed">{item.description}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default FeatureDetails;
