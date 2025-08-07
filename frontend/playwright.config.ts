import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 配置文件
 * 專為測試 ProductHero 組件的手機端滑動體驗設計
 */
export default defineConfig({
  testDir: './tests',
  
  /* 並行運行測試 */
  fullyParallel: true,
  
  /* 在 CI 上失敗時不重試，在本地重試一次 */
  retries: process.env.CI ? 2 : 1,
  
  /* 在 CI 上選擇退出並行執行 */
  workers: process.env.CI ? 1 : undefined,
  
  /* 測試報告配置 */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['list']
  ],
  
  /* 全局設置 */
  use: {
    /* 基礎 URL */
    baseURL: 'http://localhost:3000',
    
    /* 收集失敗時的跟蹤 */
    trace: 'on-first-retry',
    
    /* 截圖設置 */
    screenshot: 'only-on-failure',
    
    /* 視頻錄製 */
    video: 'retain-on-failure',
    
    /* 忽略 HTTPS 錯誤 */
    ignoreHTTPSErrors: true,
  },

  /* 配置不同設備的測試項目 */
  projects: [
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        // 啟用觸摸支持
        hasTouch: true,
        // 設置視窗大小來模擬手機
        viewport: { width: 393, height: 851 },
        // 用戶代理
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36'
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        // 啟用觸摸支持
        hasTouch: true,
        // 設置視窗大小來模擬 iPhone
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'Mobile Chrome Landscape',
      use: { 
        ...devices['Pixel 5 landscape'],
        hasTouch: true,
        viewport: { width: 851, height: 393 },
      },
    },
  ],

  /* 在所有測試運行之前啟動開發伺服器 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});