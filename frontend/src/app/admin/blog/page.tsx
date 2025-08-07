'use client';

import Link from 'next/link';
import { Text, Card } from '@/design-system';
import { 
  FaPen, 
  FaList, 
  FaFolder, 
  FaUser, 
  FaCog,
  FaArrowRight,
  FaPlus
} from 'react-icons/fa';

const blogModules = [
  {
    title: '文章管理',
    description: '建立、編輯和管理部落格文章',
    href: '/admin/blog/articles',
    icon: FaPen,
    color: 'bg-blue-100 text-blue-600',
    actions: [
      { label: '查看所有文章', href: '/admin/blog/articles' },
      { label: '建立新文章', href: '/admin/blog/articles/new' },
    ]
  },
  {
    title: '分類管理',
    description: '管理文章分類和標籤',
    href: '/admin/blog/categories',
    icon: FaFolder,
    color: 'bg-green-100 text-green-600',
    actions: [
      { label: '管理分類', href: '/admin/blog/categories' },
    ]
  },
  {
    title: '作者管理',
    description: '管理部落格作者資訊',
    href: '/admin/blog/authors',
    icon: FaUser,
    color: 'bg-purple-100 text-purple-600',
    actions: [
      { label: '管理作者', href: '/admin/blog/authors' },
    ]
  },
  {
    title: 'SEO 設定',
    description: '網站 SEO 優化和搜尋引擎設定',
    href: '/admin/blog/seo',
    icon: FaCog,
    color: 'bg-orange-100 text-orange-600',
    actions: [
      { label: 'SEO 設定', href: '/admin/blog/seo' },
    ]
  },
];

export default function BlogAdminPage() {
  return (
    <div className="p-6">
      {/* 頁面標題 */}
      <div className="mb-8">
        <Text variant="title1" className="text-gray-900 mb-2">
          Blog 管理中心
        </Text>
        <Text variant="body" className="text-gray-600">
          管理部落格內容、作者和 SEO 設定
        </Text>
      </div>

      {/* 快速操作 */}
      <div className="mb-8">
        <Card variant="elevated" padding="large">
          <div className="flex items-center justify-between">
            <div>
              <Text variant="headline" className="text-gray-900 mb-2">
                快速開始
              </Text>
              <Text variant="body" className="text-gray-600">
                開始建立你的第一篇部落格文章
              </Text>
            </div>
            <Link
              href="/admin/blog/articles/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              建立新文章
            </Link>
          </div>
        </Card>
      </div>

      {/* 功能模組 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogModules.map((module) => (
          <Card key={module.title} variant="elevated" padding="large">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${module.color}`}>
                <module.icon className="w-6 h-6" />
              </div>
            </div>
            
            <Text variant="headline" className="text-gray-900 mb-2">
              {module.title}
            </Text>
            
            <Text variant="body" className="text-gray-600 mb-4">
              {module.description}
            </Text>

            <div className="space-y-2">
              {module.actions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <Text variant="subhead">{action.label}</Text>
                  <FaArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* 統計摘要 */}
      <div className="mt-8">
        <Card variant="elevated" padding="large">
          <Text variant="headline" className="text-gray-900 mb-4">
            部落格統計
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Text variant="title2" className="text-blue-600 mb-1">3</Text>
              <Text variant="caption1" className="text-gray-500">總文章數</Text>
            </div>
            <div className="text-center">
              <Text variant="title2" className="text-green-600 mb-1">3</Text>
              <Text variant="caption1" className="text-gray-500">已發布</Text>
            </div>
            <div className="text-center">
              <Text variant="title2" className="text-yellow-600 mb-1">0</Text>
              <Text variant="caption1" className="text-gray-500">草稿</Text>
            </div>
            <div className="text-center">
              <Text variant="title2" className="text-purple-600 mb-1">3</Text>
              <Text variant="caption1" className="text-gray-500">分類數</Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}