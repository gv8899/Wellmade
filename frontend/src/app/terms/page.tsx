import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

// 🎯 導入設計系統
import { Text, Card } from '@/design-system';
import { colors } from '@/design-system';

export const metadata: Metadata = {
  title: '會員服務條款 | Wellmade',
  description: 'Wellmade 會員服務條款，包含使用規範、權利義務等重要條款。',
};

export default function TermsPage() {
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
            會員服務條款
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
          會員服務條款
        </Text>
        <Text 
          variant="title3" 
          color={colors.neutral.secondaryLabel} 
          colorMode={colorMode}
          style={{ maxWidth: '600px', margin: '0 auto', display: 'block', marginBottom: '0.5rem' }}
        >
          歡迎使用 Wellmade 服務
        </Text>
        <Text 
          variant="body" 
          color={colors.neutral.secondaryLabel} 
          colorMode={colorMode}
          style={{ maxWidth: '600px', margin: '0 auto', display: 'block', marginBottom: '0.5rem' }}
        >
          請詳細閱讀以下條款，註冊會員即表示您同意並接受本條款
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

        {/* 服務說明 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            服務說明
          </Text>
          <div className="space-y-4">
            <Text 
              variant="body" 
              color={colors.neutral.label} 
              colorMode={colorMode}
              style={{ lineHeight: '1.7' }}
            >
              Wellmade 提供線上購物平台服務，包含商品瀏覽、購買、會員管理等功能。
              本服務僅限於合法使用，您不得將本服務用於任何非法或未經授權的目的。
            </Text>
          </div>
        </Card>

        {/* 會員註冊與帳戶 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            會員註冊與帳戶
          </Text>
          <div className="space-y-4">
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                註冊資格
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                您必須年滿 18 歲且具有完全行為能力，方可註冊成為會員。
                未滿 18 歲者需經法定代理人同意後方可使用本服務。
              </Text>
            </div>
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                帳戶安全
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                您有責任維護帳戶資訊的安全性，包含密碼的保密。
                如發現帳戶遭到未經授權使用，請立即通知我們。
              </Text>
            </div>
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                資料真實性
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                註冊時提供的所有資訊必須真實、準確且完整。
                如資訊有變更，請及時更新您的帳戶資料。
              </Text>
            </div>
          </div>
        </Card>

        {/* 購買條款 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            購買條款
          </Text>
          <div className="space-y-4">
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                訂單確認
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                訂單成立以我們寄出訂單確認信為準。我們保留接受或拒絕任何訂單的權利。
              </Text>
            </div>
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                價格與付款
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                商品價格如有變動，恕不另行通知。付款方式包含信用卡、LINE Pay 等，
                具體可用方式以結帳頁面顯示為準。
              </Text>
            </div>
            <div>
              <Text 
                variant="headline" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}
              >
                配送說明
              </Text>
              <Text 
                variant="body" 
                color={colors.neutral.label} 
                colorMode={colorMode}
                style={{ lineHeight: '1.6' }}
              >
                我們將盡力在預估時間內配送商品，但配送時間可能因不可抗力因素而延遲。
              </Text>
            </div>
          </div>
        </Card>

        {/* 使用規範 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            使用規範
          </Text>
          <div className="space-y-3">
            <Text 
              variant="body" 
              color={colors.neutral.label} 
              colorMode={colorMode}
              style={{ lineHeight: '1.6' }}
            >
              您同意不會進行以下行為：
            </Text>
            <div className="ml-4 space-y-2">
              <div className="flex items-start gap-2">
                <Text variant="body" color={colors.neutral.label} colorMode={colorMode}>•</Text>
                <Text variant="body" color={colors.neutral.label} colorMode={colorMode} style={{ lineHeight: '1.6' }}>
                  使用本服務進行任何非法活動
                </Text>
              </div>
              <div className="flex items-start gap-2">
                <Text variant="body" color={colors.neutral.label} colorMode={colorMode}>•</Text>
                <Text variant="body" color={colors.neutral.label} colorMode={colorMode} style={{ lineHeight: '1.6' }}>
                  干擾或破壞本服務的正常運作
                </Text>
              </div>
              <div className="flex items-start gap-2">
                <Text variant="body" color={colors.neutral.label} colorMode={colorMode}>•</Text>
                <Text variant="body" color={colors.neutral.label} colorMode={colorMode} style={{ lineHeight: '1.6' }}>
                  未經授權存取他人帳戶或資料
                </Text>
              </div>
              <div className="flex items-start gap-2">
                <Text variant="body" color={colors.neutral.label} colorMode={colorMode}>•</Text>
                <Text variant="body" color={colors.neutral.label} colorMode={colorMode} style={{ lineHeight: '1.6' }}>
                  發布虛假、誤導性或有害的內容
                </Text>
              </div>
            </div>
          </div>
        </Card>

        {/* 智慧財產權 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            智慧財產權
          </Text>
          <Text 
            variant="body" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ lineHeight: '1.7' }}
          >
            本網站的所有內容，包含但不限於文字、圖片、商標、設計等，均受智慧財產權法保護。
            未經我們書面同意，您不得複製、修改、分發或以其他方式使用這些內容。
          </Text>
        </Card>

        {/* 責任限制 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            責任限制
          </Text>
          <Text 
            variant="body" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ lineHeight: '1.7' }}
          >
            在法律允許的最大範圍內，我們不對因使用本服務而產生的任何直接、間接、
            偶然或特殊損害承擔責任。我們的責任限制不超過您為相關服務支付的金額。
          </Text>
        </Card>

        {/* 條款修訂 */}
        <Card variant="borderless" padding="large" colorMode={colorMode}>
          <Text 
            variant="title2" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            條款修訂
          </Text>
          <Text 
            variant="body" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ lineHeight: '1.7' }}
          >
            我們保留隨時修訂本條款的權利。重大變更將透過網站公告或電子郵件通知您。
            繼續使用本服務即表示您接受修訂後的條款。
          </Text>
        </Card>

        {/* 聯絡資訊 */}
        <Card variant="borderless" padding="large" colorMode={colorMode} className="bg-blue-50 border border-blue-200 rounded-lg text-center">
          <Text 
            variant="title3" 
            color={colors.neutral.label} 
            colorMode={colorMode}
            style={{ fontWeight: 'bold', display: 'block', marginBottom: '1rem' }}
          >
            如對本條款有任何疑問
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