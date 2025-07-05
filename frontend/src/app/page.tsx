'use client';
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";

// 從 API 服務引入類型和方法
import { Product, getProducts, getEnhancedProducts, ProductQueryParams, getActiveCategories, getProductCategoryName, getProductCategorySlug, Category } from "@/services/api";
import { EnhancedProduct, formatPriceRange } from "@/types/product";
import ProductStatusBadge from "@/components/product/ProductStatusBadge";
import ProductPriceDisplay from "@/components/product/ProductPriceDisplay";
import BannerComponent from "@/components/Banner";
import { BannerPosition } from "@/types/banner";

// 🎯 導入設計系統
import { Text, Button, Card } from "@/design-system";
import { colors } from "@/design-system";
import type { ColorMode } from "@/design-system";

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
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  // 篩選狀態
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [style, setStyle] = useState("");
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [enhancedProducts, setEnhancedProducts] = useState<EnhancedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  
  // 分類資料
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
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
        // 優先嘗試獲取增強產品信息
        try {
          const enhancedResponse = await getEnhancedProducts(queryParams);
          setEnhancedProducts(enhancedResponse.items);
          
          // 也設置基本產品信息用於回退顯示
          const displayProducts: DisplayProduct[] = enhancedResponse.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description,
            cover: item.imageUrl,
            category: item.category,
          }));
          
          setProducts(displayProducts);
          setTotalProducts(enhancedResponse.total);
        } catch (enhancedError) {
          console.warn('無法獲取增強產品信息，回退到基本產品列表:', enhancedError);
          
          // 回退到基本產品 API
          const response = await getProducts(queryParams);
          
          // 將後端資料格式轉換為前端顯示格式
          const displayProducts: DisplayProduct[] = response.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description,
            cover: item.imageUrl, // 使用 imageUrl 作為主圖
            category: getProductCategoryName(item), // 使用新的分類顯示函數
          }));
          
          setProducts(displayProducts);
          setEnhancedProducts([]); // 清空增強信息
          setTotalProducts(response.total);
        }
      } catch (err: any) {
        setError(err.message || "商品資料載入失敗，請稍後再試。");
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [category, price, currentPage]);  // 依賴於篩選條件和分頁

  // 載入分類資料
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const categoryData = await getActiveCategories();
        setCategories(categoryData);
      } catch (error) {
        console.error('載入分類失敗:', error);
        // 使用空陣列作為回退
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []); // 只在組件載入時執行一次

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
      {/* 動態 Banner */}
      <BannerComponent 
        position={BannerPosition.HOMEPAGE}
        height="32vh"
        className="mb-16"
        fallbackImage="/forest-banner.jpg"
        showTitle={false}
        showDescription={false}
      />
      
      <div className="max-w-6xl mx-auto py-0 px-4">
        {/* 篩選條件區塊 */}
        <section className="mb-12 flex flex-wrap gap-8 items-center justify-between">
          <div className="flex items-center gap-4">
            <Text variant="title3" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'light', letterSpacing: '-0.025em' }}>
              商品列表
            </Text>
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
                  {categoriesLoading ? (
                    <option disabled>載入中...</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))
                  )}
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
          <div className="text-center py-16">
            <Text variant="title3" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              載入中...
            </Text>
          </div>
        )}
        {error && !loading && (
          <div className="text-center py-16">
            <Text variant="title3" color={colors.danger} colorMode={colorMode}>
              {error}
            </Text>
          </div>
        )}
        {!loading && !error && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {products.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Text variant="title3" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
                    查無符合條件的商品
                  </Text>
                </div>
              )}
              {products.map((p) => {
                // 尋找對應的增強產品信息
                const enhancedProduct = enhancedProducts.find(ep => ep.id === p.id);
                
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="block group"
                  >
                    <div 
                      className="bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)' }}
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
                      {/* 產品狀態徽章 */}
                      {enhancedProduct && (
                        <div className="absolute top-2 left-2">
                          <ProductStatusBadge 
                            status={enhancedProduct.status} 
                            size="sm" 
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <Text 
                        variant="subhead" 
                        color={colors.neutral.label} 
                        colorMode={colorMode} 
                        style={{ fontWeight: 'bold', lineHeight: '1.2' }}
                      >
                        {p.name}
                      </Text>
                      
                      <div className="flex justify-end">
                        {/* 價格顯示 - 使用增強信息或基本價格 */}
                        {enhancedProduct ? (
                          <Text 
                            variant="subhead" 
                            color={colors.neutral.label} 
                            colorMode={colorMode} 
                            style={{ fontWeight: 'normal' }}
                          >
                            ${'price' in enhancedProduct.priceRange ? 
                              Math.round(enhancedProduct.priceRange.price).toLocaleString() : 
                              `${Math.round(enhancedProduct.priceRange.minPrice).toLocaleString()} - ${Math.round(enhancedProduct.priceRange.maxPrice).toLocaleString()}`
                            }
                          </Text>
                        ) : (
                          <Text 
                            variant="subhead" 
                            color={colors.neutral.label} 
                            colorMode={colorMode} 
                            style={{ fontWeight: 'normal' }}
                          >
                            ${Math.round(p.price).toLocaleString()}
                          </Text>
                        )}
                      </div>
                      
                      {/* 庫存狀態提示 */}
                      {enhancedProduct && enhancedProduct.availableVariantsCount === 0 && (
                        <Text variant="footnote" color={colors.danger} colorMode={colorMode} style={{ fontWeight: 'medium' }}>
                          暫時缺貨
                        </Text>
                      )}
                    </div>
                    </div>
                  </Link>
                );
              })}
            </section>
            
            {/* 分頁控制 */}
            {totalProducts > pageSize && (
              <div className="flex justify-center mt-10 mb-16 gap-2">
                <Button 
                  variant={currentPage === 0 ? "secondary" : "primary"}
                  size="medium"
                  colorMode={colorMode}
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                >
                  上一頁
                </Button>
                
                <Card 
                  variant="borderless" 
                  padding="medium" 
                  colorMode={colorMode}
                  className="bg-gray-100"
                >
                  <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode}>
                    第 {currentPage + 1} 頁，共 {Math.ceil(totalProducts / pageSize)} 頁
                  </Text>
                </Card>
                
                <Button 
                  variant={currentPage >= Math.ceil(totalProducts / pageSize) - 1 ? "secondary" : "primary"}
                  size="medium"
                  colorMode={colorMode}
                  disabled={currentPage >= Math.ceil(totalProducts / pageSize) - 1}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  下一頁
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

