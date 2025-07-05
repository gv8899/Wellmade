'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/services/categories';
import { Text, Card } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

interface CategoriesPageClientProps {
  categories: Category[];
}

export default function CategoriesPageClient({ categories }: CategoriesPageClientProps) {
  const [colorMode] = useState<ColorMode>('light');

  // 將分類分組為父分類和子分類
  const parentCategories = categories.filter(cat => !cat.parentId);
  const childCategories = categories.filter(cat => cat.parentId);

  const getCategoryChildren = (parentId: string) => {
    return childCategories.filter(cat => cat.parentId === parentId);
  };

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
          <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode}>
            商品分類
          </Text>
        </div>
      </nav>

      {/* 頁面標題 */}
      <div className="text-center mb-12">
        <Text 
          variant="title1" 
          color={colors.neutral.label} 
          colorMode={colorMode}
          style={{ fontWeight: 'bold', display: 'block', marginBottom: '1rem' }}
        >
          商品分類
        </Text>
        <Text 
          variant="title3" 
          color={colors.neutral.secondaryLabel} 
          colorMode={colorMode}
          style={{ maxWidth: '600px', margin: '0 auto', display: 'block' }}
        >
          探索我們精心整理的商品分類，找到您感興趣的產品
        </Text>
      </div>

      {/* 分類展示 */}
      {categories.length === 0 ? (
        <div className="text-center py-16">
          <Text variant="title3" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
            暫無可用分類
          </Text>
          <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ marginTop: '1rem' }}>
            <Link href="/" className="text-black hover:underline">
              返回首頁瀏覽商品
            </Link>
          </Text>
        </div>
      ) : (
        <div className="space-y-12">
          {/* 主分類 */}
          {parentCategories.length > 0 && (
            <section>
              <Text 
                variant="title2" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '2rem' }}
              >
                主要分類
              </Text>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {parentCategories.map((category) => {
                  const children = getCategoryChildren(category.id);
                  
                  return (
                    <div 
                      key={category.id} 
                      className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)' }}
                    >
                      <Link href={`/categories/${category.slug}`}>
                        {/* 分類圖片 - 增加高度 */}
                        <div className="relative w-full h-64">
                          {category.imageUrl ? (
                            <img
                              src={category.imageUrl}
                              alt={category.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                console.error('圖片載入失敗:', category.imageUrl);
                                console.error('錯誤詳情:', e);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center group-hover:from-blue-100 group-hover:via-purple-100 group-hover:to-pink-100 transition-all duration-300">
                              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                                <Text variant="title1" color={colors.background.systemBackground} colorMode="dark" style={{ fontWeight: 'bold' }}>
                                  {category.name.charAt(0)}
                                </Text>
                              </div>
                              <Text 
                                variant="title2" 
                                color={colors.neutral.label} 
                                colorMode={colorMode}
                                style={{ fontWeight: 'bold' }}
                              >
                                {category.name}
                              </Text>
                            </div>
                          )}
                        </div>
                        
                        {/* 分類資訊 - 顯示標題和子分類 */}
                        <div className="p-6">
                          <Text 
                            variant="title3" 
                            color={colors.neutral.label} 
                            colorMode={colorMode}
                            style={{ 
                              fontWeight: 'bold',
                              marginBottom: children.length > 0 ? '1rem' : '0'
                            }}
                          >
                            {category.name}
                          </Text>
                          
                          {/* 子分類 */}
                          {children.length > 0 && (
                            <div>
                              <Text 
                                variant="footnote" 
                                color={colors.neutral.tertiaryLabel} 
                                colorMode={colorMode}
                                style={{ marginBottom: '0.5rem' }}
                              >
                                子分類:
                              </Text>
                              <div className="flex flex-wrap gap-1">
                                {children.slice(0, 3).map((child) => (
                                  <span
                                    key={child.id}
                                    className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                                  >
                                    {child.name}
                                  </span>
                                ))}
                                {children.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                                    +{children.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 所有分類（扁平列表） */}
          <section>
            <Text 
              variant="title2" 
              color={colors.neutral.label} 
              colorMode={colorMode}
              style={{ fontWeight: 'bold', display: 'block', marginBottom: '2rem' }}
            >
              所有分類
            </Text>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="block group"
                >
                  <div 
                    className="bg-white rounded-xl p-4 text-center hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1"
                    style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)' }}
                  >
                    {category.imageUrl ? (
                      <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden">
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('小圖片載入失敗:', category.imageUrl);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Text variant="title3" color={colors.background.systemBackground} colorMode="dark" style={{ fontWeight: 'bold' }}>
                          {category.name.charAt(0)}
                        </Text>
                      </div>
                    )}
                    
                    <Text 
                      variant="subhead" 
                      color={colors.neutral.label} 
                      colorMode={colorMode}
                      style={{ 
                        fontWeight: 'medium',
                        textAlign: 'center',
                        lineHeight: '1.2'
                      }}
                    >
                      {category.name}
                    </Text>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}