import { Metadata } from 'next';
import Link from 'next/link';
import { Text } from '@/design-system';

export const metadata: Metadata = {
  title: '博客管理 - Wellmade Admin',
  description: 'Wellmade 博客內容管理系統',
};

interface BlogAdminLayoutProps {
  children: React.ReactNode;
}

export default function BlogAdminLayout({ children }: BlogAdminLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Blog Admin Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Text variant="title2" className="text-gray-900">
              博客管理
            </Text>
          </div>
          <Link
            href="/admin/blog/articles/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            新增文章
          </Link>
        </div>

        {/* 導航標籤 */}
        <nav className="flex space-x-1 bg-gray-50 p-1 rounded-lg">
          <Link
            href="/admin/blog/articles"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
          >
            文章管理
          </Link>
          <Link
            href="/admin/blog/categories"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
          >
            分類管理
          </Link>
          <Link
            href="/admin/blog/authors"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
          >
            作者管理
          </Link>
          <Link
            href="/admin/blog/seo"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
          >
            SEO 設定
          </Link>
        </nav>
      </div>

      {/* Blog Content */}
      <div>
        {children}
      </div>
    </div>
  );
}