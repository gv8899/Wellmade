"use client";
import React from "react";
import Carousel from "./Carousel";
import { useCart } from '@/hooks/useCart';

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

import CartIconButton from "../../../components/CartIconButton";

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ id }) => {
  const [product, setProduct] = React.useState<Product | null>(null);
  const [collected, setCollected] = React.useState(false);
  const [liked, setLiked] = React.useState(false);
  const { cartItems, addToCart, removeFromCart } = useCart();

  // 狀態持久化（localStorage）
  React.useEffect(() => {
    // 讀取商品資料
    fetch(`/api/mock-product/${id}`)
      .then((res) => res.json())
      .then((data: Product) => setProduct(data));
    // 讀取本地狀態
    setCollected(localStorage.getItem(`collected_${id}`) === '1');
    setLiked(localStorage.getItem(`liked_${id}`) === '1');
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
  const handleLiked = () => {
    const next = !liked;
    setLiked(next);
    localStorage.setItem(`liked_${id}`, next ? '1' : '0');
    // 不顯示提示
  };

  if (!product) {
    return <div className="text-center py-16 text-gray-400 bg-white">載入中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-10 mt-12 relative font-sans">
      <CartIconButton />
      <main className="min-h-[60vh] bg-white flex items-center justify-center py-8">
        <div className="w-full max-w-2xl mx-auto p-0">
          {/* 圖片/影片輪播區 */}
          <section className="mb-8">
            <Carousel media={product.media ?? []} />
          </section>
          {/* 商品資訊區 */}
          <section className="mb-8">
            <h1 className="text-3xl font-extrabold mb-3 text-gray-900 text-center">{product.name}</h1>
            <div className="text-2xl font-bold mb-6 text-gray-900 text-center">${product.price}</div>
            <p className="text-gray-400 text-base mb-4 whitespace-pre-line min-h-[2.5em] text-center">{product.description}</p>
          </section>
          {/* 互動按鈕區（愛心、收藏、加入購物車） */}
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
            <button
              className={`px-7 py-2 rounded-lg transition font-semibold shadow-sm border border-gray-200 focus:ring-2 focus:ring-black/10 text-base flex items-center gap-1 ${liked ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-900 hover:bg-gray-100 active:scale-95'}`}
              onClick={handleLiked}
            >
              <span>{liked ? '❤️' : '🤍'}</span> 愛心
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailClient;
