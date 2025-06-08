"use client";
import React from "react";
import ProductHero from "./ProductHero";
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
    <React.Fragment>
      {/* 主視覺區：文案左、圖右 */}
      <ProductHero
        subtitle={product.category || ''}
        title={product.name}
        description={product.description}
        imageUrl={product.cover}
      />
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
    </React.Fragment>
  );
};

export default ProductDetailClient;
