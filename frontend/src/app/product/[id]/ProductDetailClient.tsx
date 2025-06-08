"use client";
import React, { useRef } from "react";
import ProductHero from "./ProductHero";
import KeyFeatures from "./KeyFeatures";
import { FaBolt, FaTint, FaBatteryFull, FaRegLightbulb } from "react-icons/fa";
import { useCart } from '@/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  cover: string;
  category: string;
  style: string;
  media: {
    type: "image" | "video";
    src: string;
    alt?: string;
  }[];
}

interface ProductDetailClientProps {
  id: string;
}



const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ id }) => {
  // KeyFeatures 橫向捲動區塊的 scrollRef
  const keyFeaturesScrollRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = React.useState<Product | null>(null);
  const [collected, setCollected] = React.useState(false);
  const { cartItems, addToCart, removeFromCart } = useCart();

  // 狀態持久化（localStorage）
  React.useEffect(() => {
    // 讀取商品資料
    fetch(`/api/mock-product/${id}`)
      .then((res) => res.json())
      .then((data: Product) => setProduct(data));
    // 讀取本地狀態
    setCollected(localStorage.getItem(`collected_${id}`) === '1');
  }, [id]);

  const isInCart = product ? cartItems.some(item => item.id === id) : false;

  // 按鈕互動提示
  function showTip(msg: string) {
    if (window && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(msg);
    } else {
      // Fallback: alert
      alert(msg);
    }
  }

  // 加入購物車
  const handleCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        cover: product.cover,
      });
      showTip('已加入購物車');
    }
  };
  const handleCollected = () => {
    const next = !collected;
    setCollected(next);
    localStorage.setItem(`collected_${id}`, next ? '1' : '0');
    // 不顯示提示
  };

  if (!product) {
    return <div className="text-center py-16 text-gray-400 bg-white">載入中...</div>;
  }

  return (
    <>
      {/* 主視覺區：文案左、圖右 */}
      <ProductHero
        subtitle={product.category || ""}
        title={product.name}
        description={product.description}
        imageUrl={product.media && product.media.length > 0 ? product.media[0].src : product.cover}
      />
      {/* Key Features 區塊：Apple 風格，橫向排列 */}
      <div className="relative">
        <KeyFeatures
          features={[
            {
              image: "/sample1.jpg",
              title: "超高亮度",
              subtitle: "戶外也清晰",
              description: "最高200流明，夜間也清晰可見。"
            },
            {
              image: "/sample2.jpg",
              title: "防潑水設計",
              subtitle: "IPX4等級",
              description: "戶外露營、雨天皆可安心使用。"
            },
            {
              image: "/sample1v3.jpg",
              title: "長效電力",
              subtitle: "續航力滿分",
              description: "最長可連續使用48小時，戶外無憂。"
            },
            {
              image: "/sample12.jpg",
              title: "輕巧設計",
              subtitle: "僅60g",
              description: "小巧易攜，隨身帶著走。"
            },
          ]}
          // 傳入 scrollRef 以便父層控制
          scrollRef={keyFeaturesScrollRef}
        />
        {/* KeyFeatures 區塊下方置中圓形灰底箭頭按鈕 */}
        <div className="hidden md:flex flex-row gap-4 justify-center w-full mt-6">
          <button
            onClick={() => keyFeaturesScrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition shadow-md"
            aria-label="scroll left"
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="none" />
              <path d="M19.5 24L13 16.5L19.5 9" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => keyFeaturesScrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition shadow-md"
            aria-label="scroll right"
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="none" />
              <path d="M12.5 9L19 16.5L12.5 24" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      {/* 其餘內容區塊 */}
      <main className="max-w-4xl mx-auto px-4 pb-16">
        {/* 互動按鈕區（收藏、加入購物車） */}
        <section className="flex gap-4 justify-center mt-6">
          <button
            className={`px-7 py-2 rounded-lg transition font-semibold shadow-sm border border-gray-200 focus:ring-2 focus:ring-black/10 text-base ${isInCart ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 hover:bg-gray-100 active:scale-95'}`}
            onClick={handleCart}
          >
            {isInCart ? '已加入購物車' : '加入購物車'}
          </button>
          <button
            className={`px-7 py-2 rounded-lg transition font-semibold shadow-sm border border-gray-200 focus:ring-2 focus:ring-black/10 text-base ${collected ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-900 hover:bg-gray-100 active:scale-95'}`}
            onClick={handleCollected}
          >
            {collected ? '已收藏' : '收藏'}
          </button>
        </section>
      </main>
    </>
  );
};

export default ProductDetailClient;
