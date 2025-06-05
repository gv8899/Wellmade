'use client';
import Link from "next/link";
import Image from "next/image";


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

import React from "react";

import { useState } from "react";

export default function Home() {
  // Banner 圖片路徑
  const [bannerUrl, setBannerUrl] = useState("/forest-banner.jpg");
  // 篩選狀態
  const [category, setCategory] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [style, setStyle] = React.useState("");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  // 取得商品資料
  React.useEffect(() => {
    setLoading(true);
    setError("");
    fetch("/api/mock-product/list")
      .then(res => {
        if (!res.ok) throw new Error("API 錯誤");
        return res.json();
      })
      .then(data => setProducts(data))
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
    <div className="min-h-screen bg-white">
      {/* Banner 區塊全寬 */}
      <section className="w-full min-h-[18vh] sm:min-h-[32vh] shadow-md border-0 mb-12">
        <img src={bannerUrl} alt="banner" className="w-full h-full min-h-[18vh] sm:min-h-[32vh] object-cover rounded-none" />
      </section>
      <div className="max-w-7xl mx-auto px-4 pt-0 pb-14">

        {/* 篩選條件區塊 */}
        <section className="mb-10 flex flex-wrap gap-6 items-center justify-between">
          <div className="font-bold text-2xl tracking-tight text-gray-900">商品列表</div>
          <div className="flex gap-3 items-center">
            {/* 分類篩選 */}
            <select
              className="border border-gray-300 rounded px-3 py-1 bg-white text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">全部分類</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {/* 價格篩選 */}
            <select
              className="border border-gray-300 rounded px-3 py-1 bg-white text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={price}
              onChange={e => setPrice(e.target.value)}
            >
              <option value="">全部價格</option>
              <option value="0-500">$0-500</option>
              <option value="501-1500">$501-1500</option>
              <option value="1501-3000">$1501-3000</option>
            </select>
            {/* 風格篩選 */}
            <select
              className="border border-gray-300 rounded px-3 py-1 bg-white text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={style}
              onChange={e => setStyle(e.target.value)}
            >
              <option value="">全部風格</option>
              {styles.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </section>
        {/* 商品列表 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-12 text-lg">查無符合條件的商品</div>
          )}
          {filteredProducts.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="block group rounded-lg shadow-md bg-white border border-gray-100 hover:shadow-xl transition overflow-hidden"
              style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.05)' }}
            >
              <div className="relative w-full aspect-square bg-gray-50">
                <Image
                  src={p.cover}
                  alt={p.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="transition group-hover:scale-105 duration-300"
                />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <div className="font-semibold text-lg text-gray-900 line-clamp-1">{p.name}</div>
                <div className="font-bold text-xl" style={{ color: '#222' }}>${p.price}</div>
                <div className="text-gray-500 text-base line-clamp-2 min-h-[2.5em]">{p.description}</div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

