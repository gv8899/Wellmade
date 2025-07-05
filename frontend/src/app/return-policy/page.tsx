import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

// 🎯 導入設計系統
import { Text, Card } from '@/design-system';
import { colors } from '@/design-system';

export const metadata: Metadata = {
  title: '退換貨政策 | Wellmade',
  description: '了解 Wellmade 的退換貨政策，包含退貨條件、退貨流程和注意事項。',
};

export default function ReturnPolicyPage() {
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
            退換貨政策
          </Text>
        </div>
      </nav>

      {/* 頁面標題 */}
      <div className="text-center mb-12">
        <Text 
          variant="title1" 
          color={colors.neutral.label} 
          colorMode={colorMode}
          style={{ fontWeight: 'bold', marginBottom: '1rem' }}
        >
          退換貨政策
        </Text>
        <Text 
          variant="title3" 
          color={colors.neutral.secondaryLabel} 
          colorMode={colorMode}
          style={{ maxWidth: '600px', margin: '0 auto' }}
        >
          為確保您的購物權益，請詳閱以下退換貨相關規定
        </Text>
      </div>

      {/* 內容區域 */}
      <div className="space-y-6">
        
        {/* 退貨條件 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            退貨條件
          </Text>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <Text 
                variant="body" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                商品須於收到商品後 7 天內提出退貨申請
              </Text>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <Text 
                variant="body" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                商品須保持全新狀態，包裝完整且未經使用
              </Text>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <Text 
                variant="body" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                需附上原購買憑證（訂單編號或發票）
              </Text>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <Text 
                variant="body" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                食品類商品基於衛生考量，恕不接受退貨
              </Text>
            </div>
          </div>
        </Card>

        {/* 退貨流程 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            退貨流程
          </Text>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                •
              </div>
              <div>
                <Text 
                  variant="headline" 
                  color={colors.neutral.label} 
                  colorMode={colorMode}
                  style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
                >
                  聯絡客服
                </Text>
                <Text 
                  variant="body" 
                  color={colors.neutral.secondaryLabel} 
                  colorMode={colorMode}
                  style={{ lineHeight: '1.6' }}
                >
                  寄信至 wellmadegood@gmail.com，說明退貨原因並提供訂單編號
                </Text>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                •
              </div>
              <div>
                <Text 
                  variant="headline" 
                  color={colors.neutral.label} 
                  colorMode={colorMode}
                  style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
                >
                  審核申請
                </Text>
                <Text 
                  variant="body" 
                  color={colors.neutral.secondaryLabel} 
                  colorMode={colorMode}
                  style={{ lineHeight: '1.6' }}
                >
                  我們將在 1-2 個工作天內審核您的退貨申請
                </Text>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                •
              </div>
              <div>
                <Text 
                  variant="headline" 
                  color={colors.neutral.label} 
                  colorMode={colorMode}
                  style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
                >
                  寄回商品
                </Text>
                <Text 
                  variant="body" 
                  color={colors.neutral.secondaryLabel} 
                  colorMode={colorMode}
                  style={{ lineHeight: '1.6' }}
                >
                  審核通過後，我們將提供退貨地址，請妥善包裝商品並寄回
                </Text>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                •
              </div>
              <div>
                <Text 
                  variant="headline" 
                  color={colors.neutral.label} 
                  colorMode={colorMode}
                  style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
                >
                  退款處理
                </Text>
                <Text 
                  variant="body" 
                  color={colors.neutral.secondaryLabel} 
                  colorMode={colorMode}
                  style={{ lineHeight: '1.6' }}
                >
                  收到商品並確認無誤後，將於 3-5 個工作天內退款至原付款方式
                </Text>
              </div>
            </div>
          </div>
        </Card>

        {/* 換貨說明 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            換貨說明
          </Text>
          <Text 
            variant="body" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ lineHeight: '1.6', marginBottom: '1rem' }}
          >
            如需換貨（例如尺寸、顏色不符），請按退貨流程辦理退貨，
            並重新下單購買所需商品。換貨運費由客戶自行負擔。
          </Text>
        </Card>

        {/* 注意事項 */}
        <Card variant="borderless" padding="large" colorMode={colorMode} className="bg-amber-50 border border-amber-200 rounded-lg">
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            重要提醒
          </Text>
          <div className="space-y-3">
            <Text 
              variant="body" 
              color={colors.neutral.label} 
              colorMode={colorMode}
              style={{ lineHeight: '1.6' }}
            >
              • 退貨運費由客戶自行負擔，建議使用有追蹤號碼的寄送方式
            </Text>
            <Text 
              variant="body" 
              color={colors.neutral.label} 
              colorMode={colorMode}
              style={{ lineHeight: '1.6' }}
            >
              • 如因商品瑕疵導致退換貨，運費由本公司負擔
            </Text>
            <Text 
              variant="body" 
              color={colors.neutral.label} 
              colorMode={colorMode}
              style={{ lineHeight: '1.6' }}
            >
              • 退款金額不包含原訂單之運費
            </Text>
          </div>
        </Card>

        {/* 聯絡資訊 */}
        <Card variant="borderless" padding="large" colorMode={colorMode} className="text-center">
          <Text 
            variant="title3" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', display: 'block', marginBottom: '1rem' }}
          >
            如有任何問題，歡迎聯絡我們
          </Text>
          <div className="flex justify-center items-center gap-2">
            <Text 
              variant="body" 
              color={colors.neutral.secondaryLabel} 
              colorMode={colorMode}
            >
              客服信箱：
            </Text>
            <a 
              href="mailto:wellmadegood@gmail.com"
              className="text-black hover:text-gray-800 transition-colors"
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
        </Card>
      </div>
    </div>
  );
}