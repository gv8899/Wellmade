"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// 媒體類型定義
interface MediaItem {
  type: "image" | "video";
  src: string;
  alt?: string;
}

interface CarouselProps {
  media: MediaItem[];
}

const Carousel: React.FC<CarouselProps> = ({ media }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      className="h-80 rounded-lg"
    >
      {media.map((item, idx) => (
        <SwiperSlide key={idx} className="flex items-center justify-center bg-gray-100">
          {item.type === "image" ? (
            <img
              src={item.src}
              alt={item.alt || "商品圖片"}
              className="object-contain h-72 max-w-full rounded"
            />
          ) : (
            <video controls className="object-contain h-72 max-w-full rounded">
              <source src={item.src} />
              您的瀏覽器不支援影片播放
            </video>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Carousel;
