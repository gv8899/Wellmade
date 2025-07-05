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
    // 獲取樹狀結構的分類數據
    const categories = await categoryApi.getTree();
    
    return <CategoriesPageClient categories={categories} />;
  } catch (error) {
    console.error('載入分類樹狀結構失敗:', error);
    
    // 錯誤情況下顯示空列表
    return <CategoriesPageClient categories={[]} />;
  }
}