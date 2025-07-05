import { Metadata } from 'next';
import { categoryApi } from '@/services/categories';
import CategoriesPageClient from './CategoriesPageClient';

export const metadata: Metadata = {
  title: '商品分類 | Wellmade',
  description: '瀏覽 Wellmade 的所有商品分類，發現您感興趣的產品類別',
  openGraph: {
    title: '商品分類 | Wellmade',
    description: '瀏覽 Wellmade 的所有商品分類，發現您感興趣的產品類別',
  },
};

export default async function CategoriesPage() {
  try {
    // 獲取所有分類
    const response = await categoryApi.getAll();
    
    // 在前端過濾啟用的分類並排序
    const activeCategories = response.categories
      .filter(category => category.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    
    return <CategoriesPageClient categories={activeCategories} />;
  } catch (error) {
    console.error('載入分類列表失敗:', error);
    
    // 錯誤情況下顯示空列表
    return <CategoriesPageClient categories={[]} />;
  }
}