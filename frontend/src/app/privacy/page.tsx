import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

// 🎯 導入設計系統
import { Text, Card } from '@/design-system';
import { colors } from '@/design-system';

export const metadata: Metadata = {
  title: '隱私權政策 | Wellmade',
  description: 'Wellmade 隱私權政策，說明我們如何收集、使用和保護您的個人資料。',
};

export default function PrivacyPage() {
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
            隱私權政策
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
          隱私權政策
        </Text>
        <Text 
          variant="title3" 
          color={colors.neutral.secondaryLabel} 
          colorMode={colorMode}
          style={{ maxWidth: '600px', margin: '0 auto', display: 'block', marginBottom: '0.5rem' }}
        >
          我們重視您的隱私權，本政策說明我們如何收集、使用和保護您的個人資料
        </Text>
        <Text 
          variant="footnote" 
          color={colors.neutral.tertiaryLabel} 
          colorMode={colorMode}
          style={{ marginTop: '0.5rem', display: 'block' }}
        >
          最後更新日期：2025年1月4日
        </Text>
      </div>

      {/* 內容區域 */}
      <div className="space-y-6">

        {/* 資料收集 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            資料收集
          </Text>
          <div className="space-y-4">
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                您主動提供的資料
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6', marginBottom: '0.5rem' }}
              >
                當您註冊帳戶、下訂單或聯絡我們時，可能需要提供以下資料：
              </Text>
              <div className="ml-4 space-y-1">
                <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>• 姓名、電子郵件地址</Text>
                <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>• 聯絡電話、配送地址</Text>
                <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>• 付款資訊（由第三方支付服務處理）</Text>
                <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>• 其他您選擇提供的資訊</Text>
              </div>
            </div>
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                自動收集的資料
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6', marginBottom: '0.5rem' }}
              >
                當您使用我們的網站時，我們可能自動收集：
              </Text>
              <div className="ml-4 space-y-1 gap-3">
                <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>• 瀏覽器類型和版本</Text>
                <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>• IP 地址和設備資訊</Text>
                <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>• 網站使用情況和偏好設定</Text>
                <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>• Cookie 和類似技術產生的資料</Text>
              </div>
            </div>
          </div>
        </Card>

        {/* 資料使用 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            資料使用
          </Text>
          <Text 
            variant="body" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ lineHeight: '1.6', marginBottom: '1rem' }}
          >
            我們使用您的個人資料用於以下目的：
          </Text>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <Text variant="body" color={colors.neutral.label} colorMode={colorMode} style={{ lineHeight: '1.6' }}>
                處理您的訂單和提供客戶服務
              </Text>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <Text variant="body" color={colors.neutral.label} colorMode={colorMode} style={{ lineHeight: '1.6' }}>
                改善我們的產品和服務
              </Text>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <Text variant="body" color={colors.neutral.label} colorMode={colorMode} style={{ lineHeight: '1.6' }}>
                發送重要通知和訂單更新
              </Text>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <Text variant="body" color={colors.neutral.label} colorMode={colorMode} style={{ lineHeight: '1.6' }}>
                個人化您的購物體驗
              </Text>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <Text variant="body" color={colors.neutral.label} colorMode={colorMode} style={{ lineHeight: '1.6' }}>
                遵守法律義務和保護合法權益
              </Text>
            </div>
          </div>
        </Card>

        {/* 資料分享 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            資料分享
          </Text>
          <Text 
            variant="body" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ lineHeight: '1.7', display: 'block', marginBottom: '0.5rem' }}
          >
            我們不會將您的個人資料出售給第三方。
          </Text>
          <Text 
            variant="body" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ lineHeight: '1.7', marginBottom: '1rem' }}
          >
            但在以下情況下，我們可能會分享您的資料：
          </Text>
          <div className="space-y-4">
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                服務提供商
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.secondaryLabel} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                與協助我們提供服務的可信賴第三方（如物流公司、支付處理商）
              </Text>
            </div>
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                法律要求
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.secondaryLabel} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                在法律要求或保護我們合法權益的必要情況下
              </Text>
            </div>
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                您的同意
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.secondaryLabel} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                在獲得您明確同意的情況下
              </Text>
            </div>
          </div>
        </Card>

        {/* 資料安全 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            資料安全
          </Text>
          <Text 
            variant="body" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ lineHeight: '1.7', display: 'block', marginBottom: '0.5rem' }}
          >
            我們採用適當的技術和組織措施來保護您的個人資料。
          </Text>
          <Text 
            variant="body" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ lineHeight: '1.7' }}
          >
            包含：
          </Text>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
              <Text variant="body" color={colors.neutral.label} colorMode={colorMode}>SSL 加密傳輸</Text>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
              <Text variant="body" color={colors.neutral.label} colorMode={colorMode}>安全的資料儲存</Text>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
              <Text variant="body" color={colors.neutral.label} colorMode={colorMode}>嚴格的存取控制</Text>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
              <Text variant="body" color={colors.neutral.label} colorMode={colorMode}>定期安全性評估</Text>
            </div>
          </div>
        </Card>

        {/* Cookie 政策 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            Cookie 政策
          </Text>
          <Text 
            variant="body" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ lineHeight: '1.7', display: 'block', marginBottom: '0.5rem' }}
          >
            我們使用 Cookie 和類似技術來改善您的網站體驗。
          </Text>
          <Text 
            variant="body" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ lineHeight: '1.7', marginBottom: '1rem' }}
          >
            Cookie 類型包含：
          </Text>
          <div className="space-y-3">
            <div>
              <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                必要 Cookie
              </Text>
              <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
                維持網站基本功能運作
              </Text>
            </div>
            <div>
              <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                功能性 Cookie
              </Text>
              <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
                記住您的偏好設定
              </Text>
            </div>
            <div>
              <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                分析 Cookie
              </Text>
              <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
                了解網站使用情況以改善服務
              </Text>
            </div>
          </div>
        </Card>

        {/* 您的權利 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            您的權利
          </Text>
          <Text 
            variant="body" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ lineHeight: '1.6', display: 'block', marginBottom: '0.5rem' }}
          >
            依據相關法律，您對自己的個人資料享有以下權利：
          </Text>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  查閱權
                </Text>
                <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
                  查閱我們持有的您的個人資料
                </Text>
              </div>
              <div>
                <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  更正權
                </Text>
                <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
                  要求更正不正確的資料
                </Text>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  刪除權
                </Text>
                <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
                  要求刪除您的個人資料
                </Text>
              </div>
              <div>
                <Text variant="headline" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  反對權
                </Text>
                <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
                  反對特定用途的資料處理
                </Text>
              </div>
            </div>
          </div>
        </Card>

        {/* 政策更新 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            政策更新
          </Text>
          <Text 
            variant="body" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ lineHeight: '1.7', display: 'block', marginBottom: '0.5rem' }}
          >
            我們可能會不定期更新本隱私權政策。重大變更將在網站上公告，並可能透過電子郵件通知您。
          </Text>
          <Text 
            variant="body" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ lineHeight: '1.7' }}
          >
            請定期查看本政策以了解最新資訊。
          </Text>
        </Card>

        {/* 聯絡資訊 */}
        <Card variant="borderless" padding="large" colorMode={colorMode} className="bg-green-50 border border-green-200 rounded-lg text-center">
          <Text 
            variant="title3" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1rem' }}
          >
            如對隱私權政策有任何疑問或需要行使您的權利
          </Text>
          <div className="flex justify-center items-center gap-2">
            <Text 
              variant="body" 
              color={colors.neutral.secondaryLabel} 
              colorMode={colorMode}
            >
              請聯絡我們：
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