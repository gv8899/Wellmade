'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/services/categories';
import { EnhancedProduct } from '@/types/product';
import { productApi } from '@/services/products';
import { Text, Card } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

interface CategoryPageClientProps {
  category: Category;
  searchParams: { [key: string]: string | string[] | undefined };
}

// 商品篩選參數
interface ProductFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brandId?: string;
  sortBy?: 'name' | 'price' | 'createdAt';
  order?: 'ASC' | 'DESC';
  page?: number;
  take?: number; // 每頁數量
}

export default function CategoryPageClient({ 
  category, 
  searchParams 
}: CategoryPageClientProps) {
  const [colorMode] = useState<ColorMode>('light');
  const [products, setProducts] = useState<EnhancedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    take: 12,
    sortBy: 'createdAt',
    order: 'DESC'
  });

  // 從 URL 參數初始化篩選器
  useEffect(() => {
    const initialFilters: ProductFilters = {
      search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
      brandId: typeof searchParams.brandId === 'string' ? searchParams.brandId : undefined,
      sortBy: (typeof searchParams.sortBy === 'string' ? searchParams.sortBy : 'createdAt') as 'name' | 'price' | 'createdAt',
      order: (typeof searchParams.order === 'string' ? searchParams.order : 'DESC') as 'ASC' | 'DESC',
      page: searchParams.page ? Number(searchParams.page) : 1,
      take: 12
    };
    setFilters(initialFilters);
    setCurrentPage(initialFilters.page || 1);
  }, [searchParams]);

  // 載入商品資料
  useEffect(() => {
    loadProducts();
  }, [category.id, filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // 計算 skip 值
      const skip = ((filters.page || 1) - 1) * (filters.take || 12);
      
      // 使用分類 slug 載入商品
      const response = await productApi.getByCategorySlug(category.slug, {
        skip,
        take: filters.take,
        sortBy: filters.sortBy,
        order: filters.order,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        brandId: filters.brandId
      });
      
      setProducts(response.products);
      setTotalProducts(response.total);
    } catch (err) {
      console.error('載入商品失敗:', err);
      setError('載入商品失敗，請稍後再試');
      // 在錯誤情況下設置空資料
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (sortBy: string) => {
    const newOrder = filters.sortBy === sortBy && filters.order === 'ASC' ? 'DESC' : 'ASC';
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy as 'name' | 'price' | 'createdAt',
      order: newOrder,
      page: 1
    }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalProducts / (filters.take || 12));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 麵包屑導航 */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm">
          <Link href="/" className="hover:underline">
            <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              首頁
            </Text>
          </Link>
          <Text variant="subhead" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
            /
          </Text>
          <Link href="/categories" className="hover:underline">
            <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              分類
            </Text>
          </Link>
          <Text variant="subhead" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
            /
          </Text>
          <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode}>
            {category.name}
          </Text>
        </div>
      </nav>

      {/* 分類標題區塊 */}
      <div className="mb-8">
        {category.imageUrl && (
          <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-6">
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                console.error('分類標題圖片載入失敗:', category.imageUrl);
              }}
            />
          </div>
        )}
        
        {/* 分類標題 - 統一顯示在圖片下方 */}
        <Text 
          variant="title1" 
          color={colors.neutral.label} 
          colorMode={colorMode}
          style={{ fontWeight: 'bold', display: 'block', marginBottom: '1rem' }}
        >
          {category.name}
        </Text>
        
        {category.description && (
          <Text 
            variant="body" 
            color={colors.neutral.secondaryLabel} 
            colorMode={colorMode}
            style={{ lineHeight: '1.6', maxWidth: '800px' }}
          >
            {category.description}
          </Text>
        )}
      </div>


      {/* 商品展示區域 */}
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
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Text variant="title3" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
                此分類暫無商品
              </Text>
              <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ marginTop: '1rem' }}>
                請稍後再來查看，或
                <Link href="/" className="text-black hover:underline ml-1">
                  瀏覽其他商品
                </Link>
              </Text>
            </div>
          ) : (
            <>
              {/* 商品網格 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="block group rounded-2xl bg-white hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
                    style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="transition group-hover:scale-105 duration-300"
                      />
                      
                      {/* 商品狀態徽章 */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'IN_STOCK' ? 'bg-green-100 text-green-800' :
                          product.status === 'PREORDER' ? 'bg-blue-100 text-blue-800' :
                          product.status === 'OUT_OF_STOCK' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.status === 'IN_STOCK' ? '現貨' :
                           product.status === 'PREORDER' ? '預購' :
                           product.status === 'OUT_OF_STOCK' ? '缺貨' : '停產'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 flex flex-col gap-2">
                      <Text 
                        variant="subhead" 
                        color={colors.neutral.label} 
                        colorMode={colorMode} 
                        style={{ fontWeight: 'bold', lineHeight: '1.2' }}
                      >
                        {product.name}
                      </Text>
                      
                      <div className="flex justify-end">
                        <Text 
                          variant="subhead" 
                          color={colors.neutral.label} 
                          colorMode={colorMode} 
                          style={{ fontWeight: 'normal' }}
                        >
                          ${'price' in product.priceRange ? 
                            Math.round(product.priceRange.price).toLocaleString() : 
                            `${Math.round(product.priceRange.minPrice).toLocaleString()} - ${Math.round(product.priceRange.maxPrice).toLocaleString()}`
                          }
                        </Text>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* 分頁控制 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                        setFilters(prev => ({ ...prev, page: currentPage - 1 }));
                      }
                    }}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一頁
                  </button>
                  
                  <span className="px-4 py-2">
                    <Text variant="body" color={colors.neutral.label} colorMode={colorMode}>
                      第 {currentPage} / {totalPages} 頁
                    </Text>
                  </span>
                  
                  <button
                    onClick={() => {
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1);
                        setFilters(prev => ({ ...prev, page: currentPage + 1 }));
                      }
                    }}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一頁
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}