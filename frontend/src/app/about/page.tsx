import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

// 🎯 導入設計系統
import { Text, Card } from '@/design-system';
import { colors } from '@/design-system';

export const metadata: Metadata = {
  title: '關於 Wellmade | 精選好物，用心生活',
  description: '了解 Wellmade 的品牌故事，我們致力於為您精選高品質的生活用品，讓每一天都能用心生活。',
};

export default function AboutPage() {
  const colorMode = 'light';

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* 麵包屑導航 */}
      <nav className="mb-8">
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
            關於我們
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
          關於 Wellmade
        </Text>
        <Text 
          variant="title3" 
          color={colors.neutral.secondaryLabel} 
          colorMode={colorMode}
          style={{ maxWidth: '600px', margin: '0 auto', display: 'block' }}
        >
          精選好物，用心生活
        </Text>
      </div>

      {/* 內容區域 */}
      <div className="space-y-6">
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            我們的故事
          </Text> 
          <div className="space-y-6">
            <Text 
              variant="body" 
              color={colors.neutral.label} 
              colorMode={colorMode}
              style={{ lineHeight: '1.7' }}
            >
              Wellmade 誕生於對美好生活的嚮往。我們相信，生活中的每一個細節都值得被精心對待，
              每一件物品都應該承載著品質與美感的完美融合。
            </Text>
            <Text 
              variant="body" 
              color={colors.neutral.label} 
              colorMode={colorMode}
              style={{ lineHeight: '1.7' }}
            >
              我們致力於為您精選來自世界各地的優質商品，從日常餐具到居家用品，
              從精品咖啡到健康食品，每一樣商品都經過我們嚴格的品質把關。
            </Text>
          </div>
        </Card>

        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold' }}
          >
            我們的理念
          </Text>
          <div className="space-y-6 mt-6">
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                品質第一
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.secondaryLabel} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                我們只選擇最優質的商品，確保每一件產品都能為您的生活帶來真正的價值。
              </Text>
            </div>
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                用心服務
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.secondaryLabel} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                從商品選擇到售後服務，我們用心對待每一位客戶，提供最貼心的購物體驗。
              </Text>
            </div>
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                生活美學
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.secondaryLabel} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                我們相信美好的生活源於對細節的重視，每一件商品都融入了我們對美學的堅持。
              </Text>
            </div>
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                永續發展
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.secondaryLabel} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                我們關注環境保護，優先選擇環保材料和可持續發展的品牌合作。
              </Text>
            </div>
          </div>
        </Card>

        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold' }}
          >
            聯絡我們
          </Text>
          <div className="space-y-6 mt-6">
            <Text 
              variant="body" 
              color={colors.neutral.label} 
              colorMode={colorMode}
              style={{ lineHeight: '1.7' }}
            >
              如果您對我們的商品或服務有任何問題，歡迎隨時與我們聯繫。
              我們的客服團隊將竭誠為您服務。
            </Text>
            <div className="flex items-center gap-2">
              <Text 
                variant="body" 
                color={colors.neutral.secondaryLabel} 
                colorMode={colorMode}
              >
                客服信箱：
              </Text>
              <a 
                href="mailto:wellmadegood@gmail.com"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Text 
                  variant="body" 
                  color={colors.primary} 
                  colorMode={colorMode}
                >
                  wellmadegood@gmail.com
                </Text>
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}