'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';
import { Category, categoryApi } from '@/services/categories';

// 🎯 導入設計系統
import { Text } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

const Footer: React.FC = () => {
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 載入分類資料
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        // 只顯示啟用的分類，並限制顯示數量
        const activeCategories = response.categories
          .filter(cat => cat.isActive)
          .slice(0, 6); // 最多顯示6個分類
        setCategories(activeCategories);
      } catch (error) {
        console.error('載入分類失敗:', error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* 主要內容區域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          
          {/* 品牌區域 */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode} 
                style={{ fontWeight: 'bold', letterSpacing: '0.025em' }}
              >
                Wellmade<br />精選好物，用心生活
              </Text>
            </Link>
          </div>

          {/* 關於我們 */}
          <div>
            <Text 
              variant="callout" 
              color={colors.neutral.label} 
              colorMode={colorMode} 
              style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}
            >
              關於我們
            </Text>
            <ul className="space-y-1">
              <li>
                <Link 
                  href="/about"
                  className="transition-colors hover:opacity-80"
                >
                  <Text 
                    variant="footnote" 
                    color={colors.neutral.secondaryLabel} 
                    colorMode={colorMode}
                  >
                    關於 Wellmade
                  </Text>
                </Link>
              </li>
            </ul>
          </div>

          {/* 商品分類 */}
          <div>
            <Text 
              variant="callout" 
              color={colors.neutral.label} 
              colorMode={colorMode} 
              style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}
            >
              商品分類
            </Text>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <ul className="space-y-1">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/products?category=${category.slug}`}
                      className="transition-colors hover:opacity-80"
                    >
                      <Text 
                        variant="footnote" 
                        color={colors.neutral.secondaryLabel} 
                        colorMode={colorMode}
                      >
                        {category.name}
                      </Text>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 客戶服務 */}
          <div>
            <Text 
              variant="callout" 
              color={colors.neutral.label} 
              colorMode={colorMode} 
              style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}
            >
              客戶服務
            </Text>
            <ul className="space-y-1">
              <li>
                <a 
                  href="mailto:support@wellmade.select"
                  className="transition-colors hover:opacity-80"
                >
                  <Text 
                    variant="footnote" 
                    color={colors.neutral.secondaryLabel} 
                    colorMode={colorMode}
                  >
                    聯絡我們
                  </Text>
                </a>
              </li>
              <li>
                <Link 
                  href="/return-policy"
                  className="transition-colors hover:opacity-80"
                >
                  <Text 
                    variant="footnote" 
                    color={colors.neutral.secondaryLabel} 
                    colorMode={colorMode}
                  >
                    退換貨政策
                  </Text>
                </Link>
              </li>
            </ul>
          </div>

          {/* 條款與政策 */}
          <div>
            <Text 
              variant="callout" 
              color={colors.neutral.label} 
              colorMode={colorMode} 
              style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}
            >
              條款與政策
            </Text>
            <ul className="space-y-1">
              <li>
                <Link 
                  href="/terms"
                  className="transition-colors hover:opacity-80"
                >
                  <Text 
                    variant="footnote" 
                    color={colors.neutral.secondaryLabel} 
                    colorMode={colorMode}
                  >
                    會員服務條款
                  </Text>
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy"
                  className="transition-colors hover:opacity-80"
                >
                  <Text 
                    variant="footnote" 
                    color={colors.neutral.secondaryLabel} 
                    colorMode={colorMode}
                  >
                    隱私權政策
                  </Text>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 分隔線 */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* 社群連結 */}
            <div className="flex items-center gap-6">
              <Text 
                variant="footnote" 
                color={colors.neutral.secondaryLabel} 
                colorMode={colorMode}
                style={{ marginRight: '0.5rem' }}
              >
                追蹤我們
              </Text>
              <a 
                href="https://instagram.com/wellmade.select" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-colors hover:opacity-80"
                aria-label="Instagram"
              >
                <FaInstagram 
                  className="w-6 h-6" 
                  style={{ color: colors.neutral.secondaryLabel.light }}
                />
              </a>
              <a 
                href="https://threads.net/@wellmade.select" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-colors hover:opacity-80"
                aria-label="Threads"
              >
                <SiThreads 
                  className="w-6 h-6" 
                  style={{ color: colors.neutral.secondaryLabel.light }}
                />
              </a>
            </div>

            {/* 版權聲明 */}
            <Text 
              variant="footnote" 
              color={colors.neutral.tertiaryLabel} 
              colorMode={colorMode}
            >
              © 2025 Wellmade. All rights reserved.
            </Text>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;