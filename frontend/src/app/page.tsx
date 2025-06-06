'use client';
import Link from "next/link";
import Image from "next/image";
import { ChangeEvent } from 'react';

// 商品列表資料來源由 API 取得
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  cover: string;
  category: string;
  style: string;
}

import React, { useState } from "react";
import CartIconButton from "../components/CartIconButton";

export default function Home() {
  // Banner 圖片路徑
  const [bannerUrl] = useState("/forest-banner.jpg");
  // 篩選狀態
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [style, setStyle] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 取得商品資料
  React.useEffect(() => {
    setLoading(true);
    setError("");
    fetch("/api/mock-product/list")
      .then(res => {
        if (!res.ok) throw new Error("API 錯誤");
        return res.json();
      })
      .then(data => {
  if (Array.isArray(data)) setProducts(data);
  else setError("API 回傳格式錯誤");
})
      .catch(() => setError("商品資料載入失敗，請稍後再試。"))
      .finally(() => setLoading(false));
  }, []);

  // 自動產生分類、風格選項
  const categories = Array.from(new Set(products.map(p => p.category)));
  const styles = Array.from(new Set(products.map(p => p.style)));

  // 依篩選條件過濾商品
  const filteredProducts = products.filter(p => {
    let pass = true;
    if (category && p.category !== category) pass = false;
    if (style && p.style !== style) pass = false;
    if (price) {
      const [min, max] = price.split("-").map(Number);
      if (p.price < min || p.price > max) pass = false;
    }
    return pass;
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 relative font-sans">
      <CartIconButton />
      <div className="max-w-6xl mx-auto py-12 px-4">
        <section className="w-full relative h-[32vh] rounded-xl overflow-hidden mb-16 shadow-none">
          <Image
            src={bannerUrl}
            alt="banner"
            fill
            priority
            className="object-cover rounded-none"
            sizes="100vw"
          />
        </section>
        {/* 篩選條件區塊 */}
        <section className="mb-12 flex flex-wrap gap-8 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-extrabold text-3xl tracking-tight text-gray-900">商品列表</div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex gap-4 items-center">
              <div>
                <select
                  className="w-32 border border-gray-200 rounded-md px-3 py-1.5 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                  value={category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
                >
                  <option value="">分類</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="w-32 border border-gray-200 rounded-md px-3 py-1.5 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                  value={price}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPrice(e.target.value)}
                >
                  <option value="">價格</option>
                  <option value="0-500">$0-500</option>
                  <option value="501-1500">$501-1500</option>
                  <option value="1501-3000">$1501-3000</option>
                </select>
              </div>
              <div>
                <select
                  className="w-32 border border-gray-200 rounded-md px-3 py-1.5 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                  value={style}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStyle(e.target.value)}
                >
                  <option value="">風格</option>
                  {styles.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
        {/* 商品列表前顯示 loading/error 狀態 */}
        {loading && (
          <div className="text-center text-gray-400 py-16 text-lg">載入中...</div>
        )}
        {error && !loading && (
          <div className="text-center text-red-500 py-16 text-lg">{error}</div>
        )}
        {!loading && !error && (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-12 text-lg">查無符合條件的商品</div>
            )}
            {filteredProducts.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="block group rounded-2xl shadow-sm bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
                style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.05)' }}
              >
                <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center">
                  <Image
                    src={p.cover}
                    alt={p.name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="transition group-hover:scale-105 duration-300"
                  />
                </div>
                <div className="p-6 flex flex-col gap-2 items-center">
                  <div className="font-bold text-lg text-gray-900 line-clamp-1 text-center">{p.name}</div>
                  <div className="font-bold text-xl text-gray-900 text-center">${p.price}</div>
                  <div className="text-gray-400 text-base line-clamp-2 min-h-[2.5em]} text-center">{p.description}</div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

