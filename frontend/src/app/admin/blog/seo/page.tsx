'use client';

import { useState } from 'react';
import { Text, Card } from '@/design-system';

export default function SEOSettingsPage() {
  // 全域 SEO 設定
  const [siteTitle, setSiteTitle] = useState('Wellmade Blog');
  const [siteDescription, setSiteDescription] = useState('探索生活美學，分享優質內容與品質生活');
  const [siteKeywords, setSiteKeywords] = useState('生活美學,品質生活,居家設計,精選好物');
  const [defaultOgImage, setDefaultOgImage] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('@wellmade_select');
  const [facebookAppId, setFacebookAppId] = useState('');

  // Google Analytics 和 Search Console
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [googleSearchConsole, setGoogleSearchConsole] = useState('');
  const [bingWebmaster, setBingWebmaster] = useState('');

  // Sitemap 設定
  const [enableSitemap, setEnableSitemap] = useState(true);
  const [sitemapPriority, setSitemapPriority] = useState('0.8');
  const [sitemapFrequency, setSitemapFrequency] = useState('weekly');

  // Robots.txt 設定
  const [robotsTxt, setRobotsTxt] = useState(`User-agent: *
Allow: /

Sitemap: https://wellmade.select/sitemap.xml`);

  const handleSave = async () => {
    try {
      const settings = {
        siteTitle,
        siteDescription,
        siteKeywords,
        defaultOgImage,
        twitterHandle,
        facebookAppId,
        googleAnalyticsId,
        googleSearchConsole,
        bingWebmaster,
        enableSitemap,
        sitemapPriority,
        sitemapFrequency,
        robotsTxt,
      };

      // 這裡需要實作保存設定的 API
      console.log('Save SEO settings:', settings);
      alert('SEO 設定已儲存！（需要實作後端 API）');
    } catch (error) {
      console.error('Failed to save SEO settings:', error);
      alert('儲存失敗，請稍後再試');
    }
  };

  const generateSitemap = async () => {
    try {
      // 這裡需要實作生成 sitemap 的 API
      console.log('Generate sitemap');
      alert('Sitemap 已重新生成！（需要實作後端 API）');
    } catch (error) {
      console.error('Failed to generate sitemap:', error);
      alert('生成失敗，請稍後再試');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <Text variant="title2" className="text-gray-900">
          SEO 設定
        </Text>
        <div className="flex items-center space-x-4">
          <button
            onClick={generateSitemap}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            重新生成 Sitemap
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            儲存設定
          </button>
        </div>
      </div>

      {/* 基本 SEO 設定 */}
      <Card variant="elevated" padding="large">
        <Text variant="title3" className="text-gray-900 mb-6">
          基本 SEO 設定
        </Text>

        <div className="space-y-4">
          {/* 網站標題 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              網站標題
            </label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="Wellmade Blog"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Text variant="caption1" className="text-gray-500 mt-1">
              會出現在瀏覽器標題欄和搜尋結果中
            </Text>
          </div>

          {/* 網站描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              網站描述
            </label>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="探索生活美學，分享優質內容與品質生活"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-between mt-1">
              <Text variant="caption1" className="text-gray-500">
                建議長度：120-160 字元
              </Text>
              <Text variant="caption1" className={siteDescription.length > 160 ? 'text-red-500' : 'text-gray-500'}>
                {siteDescription.length}/160
              </Text>
            </div>
          </div>

          {/* 關鍵字 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              網站關鍵字
            </label>
            <input
              type="text"
              value={siteKeywords}
              onChange={(e) => setSiteKeywords(e.target.value)}
              placeholder="生活美學,品質生活,居家設計,精選好物"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Text variant="caption1" className="text-gray-500 mt-1">
              用逗號分隔，建議 5-10 個主要關鍵字
            </Text>
          </div>

          {/* 預設 OG 圖片 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              預設社交分享圖片
            </label>
            <input
              type="url"
              value={defaultOgImage}
              onChange={(e) => setDefaultOgImage(e.target.value)}
              placeholder="https://wellmade.select/images/og-default.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Text variant="caption1" className="text-gray-500 mt-1">
              建議尺寸：1200x630px，當文章沒有指定圖片時使用
            </Text>
          </div>
        </div>
      </Card>

      {/* 社交媒體設定 */}
      <Card variant="elevated" padding="large">
        <Text variant="title3" className="text-gray-900 mb-6">
          社交媒體設定
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Twitter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twitter 帳號
            </label>
            <input
              type="text"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              placeholder="@wellmade_select"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Facebook App ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook App ID
            </label>
            <input
              type="text"
              value={facebookAppId}
              onChange={(e) => setFacebookAppId(e.target.value)}
              placeholder="123456789012345"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* 分析工具設定 */}
      <Card variant="elevated" padding="large">
        <Text variant="title3" className="text-gray-900 mb-6">
          分析工具設定
        </Text>

        <div className="space-y-4">
          {/* Google Analytics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Analytics ID (GA4)
            </label>
            <input
              type="text"
              value={googleAnalyticsId}
              onChange={(e) => setGoogleAnalyticsId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Google Search Console */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Search Console 驗證碼
            </label>
            <input
              type="text"
              value={googleSearchConsole}
              onChange={(e) => setGoogleSearchConsole(e.target.value)}
              placeholder="google-site-verification=xxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bing Webmaster */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bing Webmaster 驗證碼
            </label>
            <input
              type="text"
              value={bingWebmaster}
              onChange={(e) => setBingWebmaster(e.target.value)}
              placeholder="msvalidate.01=xxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Sitemap 設定 */}
      <Card variant="elevated" padding="large">
        <Text variant="title3" className="text-gray-900 mb-6">
          Sitemap 設定
        </Text>

        <div className="space-y-4">
          {/* 啟用 Sitemap */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableSitemap"
              checked={enableSitemap}
              onChange={(e) => setEnableSitemap(e.target.checked)}
              className="mr-3"
            />
            <label htmlFor="enableSitemap" className="text-sm font-medium text-gray-700">
              自動生成 Sitemap
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 優先級 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文章優先級
              </label>
              <select
                value={sitemapPriority}
                onChange={(e) => setSitemapPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1.0">1.0 (最高)</option>
                <option value="0.9">0.9</option>
                <option value="0.8">0.8 (建議)</option>
                <option value="0.7">0.7</option>
                <option value="0.6">0.6</option>
                <option value="0.5">0.5 (一般)</option>
              </select>
            </div>

            {/* 更新頻率 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                更新頻率
              </label>
              <select
                value={sitemapFrequency}
                onChange={(e) => setSitemapFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">每日</option>
                <option value="weekly">每週</option>
                <option value="monthly">每月</option>
                <option value="yearly">每年</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <Text variant="subhead" className="text-gray-700 mb-2">
              Sitemap URL
            </Text>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value="https://wellmade.select/sitemap.xml"
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-600"
              />
              <button
                onClick={() => window.open('https://wellmade.select/sitemap.xml', '_blank')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                查看
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Robots.txt 設定 */}
      <Card variant="elevated" padding="large">
        <Text variant="title3" className="text-gray-900 mb-6">
          Robots.txt 設定
        </Text>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Robots.txt 內容
          </label>
          <textarea
            value={robotsTxt}
            onChange={(e) => setRobotsTxt(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <div className="flex justify-between items-center mt-2">
            <Text variant="caption1" className="text-gray-500">
              控制搜尋引擎爬蟲的訪問規則
            </Text>
            <button
              onClick={() => window.open('https://wellmade.select/robots.txt', '_blank')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              查看當前 robots.txt
            </button>
          </div>
        </div>
      </Card>

      {/* SEO 檢查清單 */}
      <Card variant="elevated" padding="large">
        <Text variant="title3" className="text-gray-900 mb-6">
          SEO 檢查清單
        </Text>

        <div className="space-y-3">
          <div className="flex items-center">
            <span className="text-green-500 mr-3">✓</span>
            <Text variant="body" className="text-gray-700">
              設定了網站標題和描述
            </Text>
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-3">✓</span>
            <Text variant="body" className="text-gray-700">
              配置了預設社交分享圖片
            </Text>
          </div>
          <div className="flex items-center">
            <span className="text-yellow-500 mr-3">⚠</span>
            <Text variant="body" className="text-gray-700">
              設定 Google Analytics（可選）
            </Text>
          </div>
          <div className="flex items-center">
            <span className="text-yellow-500 mr-3">⚠</span>
            <Text variant="body" className="text-gray-700">
              驗證 Google Search Console（建議）
            </Text>
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-3">✓</span>
            <Text variant="body" className="text-gray-700">
              啟用自動生成 Sitemap
            </Text>
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-3">✓</span>
            <Text variant="body" className="text-gray-700">
              配置了 Robots.txt
            </Text>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Text variant="subhead" className="text-blue-800 mb-2">
            SEO 優化建議
          </Text>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• 確保每篇文章都有獨特的 meta title 和 description</li>
            <li>• 使用適當的標題層級結構 (H1, H2, H3)</li>
            <li>• 為圖片添加 alt 屬性</li>
            <li>• 保持 URL slug 簡潔且有意義</li>
            <li>• 定期更新和優化內容</li>
            <li>• 建立內部連結提升網站結構</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}