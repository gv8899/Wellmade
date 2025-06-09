'use client';
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";

// 從 API 服務引入類型和方法
import { Product, getProducts, ProductQueryParams } from "@/services/api";

// 前端顯示用的產品類型 (與 API 格式可能略有不同)
interface DisplayProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  cover: string; // 我們使用 cover 作為顯示用主圖片
  category: string;
  style?: string;
}


export default function Home() {
  // Banner 圖片路徑
  const [bannerUrl] = useState("/forest-banner.jpg");
  // 篩選狀態
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [style, setStyle] = useState("");
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  
  // 分頁控制
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 9; // 每頁顯示商品數

  // 取得商品資料
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");
      
      // 建立查詢參數
      const queryParams: ProductQueryParams = {
        skip: currentPage * pageSize,
        take: pageSize
      };
      
      // 如果有分類篩選
      if (category) {
        queryParams.category = category;
      }
      
      // 如果有價格範圍
      if (price) {
        const [min, max] = price.split("-").map(Number);
        queryParams.minPrice = min;
        queryParams.maxPrice = max;
      }
      
      try {
        // 呼叫 API 服務
        const response = await getProducts(queryParams);
        
        // 將後端資料格式轉換為前端顯示格式
        const displayProducts: DisplayProduct[] = response.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          cover: item.imageUrl, // 使用 imageUrl 作為主圖
          category: item.category,
        }));
        
        setProducts(displayProducts);
        setTotalProducts(response.total);
      } catch (err: any) {
        setError(err.message || "商品資料載入失敗，請稍後再試。");
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [category, price, currentPage]);  // 依賴於篩選條件和分頁

  // 自動產生分類選項 (來自已載入的商品)
  const categories = Array.from(new Set(products.map(p => p.category)));
  
  // 價格範圍選項 (固定選項)
  const priceRanges = [
    { label: "全部", value: "" },
    { label: "$0-500", value: "0-500" },
    { label: "$501-1500", value: "501-1500" },
    { label: "$1501-3000", value: "1501-3000" },
    { label: "$3000以上", value: "3001-999999" }
  ];

  // 所有篩選已經在 API 查詢時處理，這裡直接使用 products

  return (
    <div className="min-h-screen bg-white text-gray-900 relative font-sans">
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
                  <option value="">所有分類</option>
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
                  {priceRanges.map((range) => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
              {/* 先移除風格篩選，直到有足夠資料 */}
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
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {products.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-12 text-lg">查無符合條件的商品</div>
              )}
              {products.map((p) => (
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
                    <div className="text-sm text-gray-500">{p.category}</div>
                  </div>
                </Link>
              ))}
            </section>
            
            {/* 分頁控制 */}
            {totalProducts > pageSize && (
              <div className="flex justify-center mt-10 gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className={`px-4 py-2 rounded-md ${currentPage === 0 ? 'bg-gray-200 text-gray-500' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                  上一頁
                </button>
                
                <span className="px-4 py-2 bg-gray-100 rounded-md">
                  第 {currentPage + 1} 頁，共 {Math.ceil(totalProducts / pageSize)} 頁
                </span>
                
                <button 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= Math.ceil(totalProducts / pageSize) - 1}
                  className={`px-4 py-2 rounded-md ${currentPage >= Math.ceil(totalProducts / pageSize) - 1 ? 'bg-gray-200 text-gray-500' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                  下一頁
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

