"use client";
import React from "react";
import Carousel from "./Carousel";

interface ProductDetailClientProps {
  id: string;
}

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ id }) => {
  const [product, setProduct] = React.useState<any>(null);
  const [inCart, setInCart] = React.useState(false);
  const [collected, setCollected] = React.useState(false);
  const [liked, setLiked] = React.useState(false);

  // 狀態持久化（localStorage）
  React.useEffect(() => {
    // 讀取商品資料
    fetch(`/api/mock-product/${id}`)
      .then((res) => res.json())
      .then(setProduct);
    // 讀取本地狀態
    setInCart(localStorage.getItem(`cart_${id}`) === '1');
    setCollected(localStorage.getItem(`collected_${id}`) === '1');
    setLiked(localStorage.getItem(`liked_${id}`) === '1');
  }, [id]);

  // 按鈕互動提示
  function showTip(msg: string) {
    if (window && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(msg);
    } else {
      // Fallback: alert
      alert(msg);
    }
  }

  // 狀態切換並持久化
  const handleCart = () => {
    const next = !inCart;
    setInCart(next);
    localStorage.setItem(`cart_${id}`, next ? '1' : '0');
    showTip(next ? '已加入購物車' : '已從購物車移除');
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
    return <div className="text-center py-16 text-gray-400">載入中...</div>;
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center py-12">
      <div className="w-full max-w-3xl rounded-xl shadow-lg border border-gray-100 bg-white p-8">
        {/* 圖片/影片輪播區 */}
        <section className="mb-8">
          <Carousel media={product.media} />
        </section>

        {/* 商品資訊區 */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-3 text-gray-900">{product.name}</h1>
          <div className="text-xl font-bold mb-5" style={{ color: '#222' }}>${product.price}</div>
          <p className="text-gray-500 text-base mb-2 whitespace-pre-line min-h-[2.5em]">{product.description}</p>
        </section>

        {/* 互動按鈕區（愛心、收藏、加入購物車） */}
        <section className="flex gap-4">
          <button
            className={`px-6 py-2 rounded-lg transition font-medium shadow-sm border border-gray-200 focus:ring-2 focus:ring-black/10 text-base ${inCart ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 hover:bg-gray-100 active:scale-95'}`}
            onClick={handleCart}
          >
            {inCart ? '已加入購物車' : '加入購物車'}
          </button>
          <button
            className={`px-6 py-2 rounded-lg transition font-medium shadow-sm border border-gray-200 focus:ring-2 focus:ring-black/10 text-base ${collected ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-900 hover:bg-gray-100 active:scale-95'}`}
            onClick={handleCollected}
          >
            {collected ? '已收藏' : '收藏'}
          </button>
          <button
            className={`px-6 py-2 rounded-lg transition font-medium shadow-sm border border-gray-200 focus:ring-2 focus:ring-black/10 text-base flex items-center gap-1 ${liked ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-900 hover:bg-gray-100 active:scale-95'}`}
            onClick={handleLiked}
          >
            <span>{liked ? '❤️' : '🤍'}</span> 愛心
          </button>
        </section>
      </div>
    </main>
  );
};

export default ProductDetailClient;
