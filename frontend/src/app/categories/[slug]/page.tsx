import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categoryApi } from '@/services/categories';
import CategoryPageClient from './CategoryPageClient';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// 動態生成 metadata
export async function generateMetadata(
  { params }: CategoryPageProps
): Promise<Metadata> {
  try {
    const { slug } = await params;
    const category = await categoryApi.getBySlug(slug);
    
    return {
      title: category.metaTitle || `${category.name} | Wellmade`,
      description: category.metaDescription || category.description || `探索 ${category.name} 分類的精選商品`,
      openGraph: {
        title: category.metaTitle || `${category.name} | Wellmade`,
        description: category.metaDescription || category.description || `探索 ${category.name} 分類的精選商品`,
        images: category.imageUrl ? [category.imageUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: '分類頁面 | Wellmade',
      description: '探索我們的精選商品分類',
    };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  try {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    
    // 獲取分類資訊
    const category = await categoryApi.getBySlug(slug);
    
    if (!category || !category.isActive) {
      notFound();
    }

    return (
      <Suspense fallback={<CategoryPageSkeleton />}>
        <CategoryPageClient 
          category={category} 
          searchParams={resolvedSearchParams}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('載入分類頁面失敗:', error);
    notFound();
  }
}

// 載入骨架屏組件
function CategoryPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 麵包屑骨架 */}
      <div className="mb-6 animate-pulse">
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
          <div className="h-4 bg-gray-200 rounded w-4"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>

      {/* 分類標題骨架 */}
      <div className="mb-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-96"></div>
      </div>

      {/* 商品網格骨架 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}