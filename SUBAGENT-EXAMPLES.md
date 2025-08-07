# Subagent 使用範例集

本文件提供 Wellmade 專案中各種實際使用場景的 Subagent 範例。

## 🏗️ 開發場景範例

### 範例 1: 開發商品評論功能

**情境**: 需要為商品頁面添加評論和評分系統

**步驟 1: 後端 API 開發**
```
使用 Task tool:
- subagent_type: general-purpose
- description: 開發商品評論API
- prompt: 你是 Wellmade 專案的後端開發專家，專精於 NestJS、PostgreSQL 和 TypeORM。

任務: 開發商品評論和評分系統的後端 API

技術背景:
- 框架: NestJS + TypeScript
- 資料庫: PostgreSQL + TypeORM
- 認證: JWT + Passport + Google OAuth
- 架構: RESTful API 設計

功能需求:
1. 用戶可以對商品發表評論和評分 (1-5 星)
2. 查詢商品的所有評論 (支援分頁和排序)
3. 用戶可以編輯/刪除自己的評論
4. 計算商品平均評分和評論數量
5. 管理員可以管理所有評論

資料庫設計:
- reviews 表: id, productId, userId, rating, comment, createdAt, updatedAt
- 關聯: Product (一對多), User (一對多)
- 索引: productId, userId, rating, createdAt

API 端點設計:
- POST /reviews - 新增評論
- GET /reviews?productId=xxx - 查詢商品評論
- PUT /reviews/:id - 更新評論
- DELETE /reviews/:id - 刪除評論
- GET /products/:id/reviews/stats - 評論統計

請提供:
1. 完整的資料庫遷移檔案
2. Review Entity 和相關 DTO
3. ReviewsController 和 ReviewsService
4. 適當的驗證和錯誤處理
5. API 測試範例
```

**步驟 2: 前端元件開發**
```
使用 Task tool:
- subagent_type: general-purpose  
- description: 實作評論前端元件
- prompt: 你是 Wellmade 專案的前端開發專家，專精於 Next.js、React 和現代前端技術。

任務: 基於已完成的評論 API，開發前端評論功能

技術背景:
- 框架: Next.js App Router + React 18+
- 狀態: React Context + TanStack Query
- 認證: NextAuth.js + Google OAuth
- 樣式: Tailwind CSS + 設計系統

功能需求:
1. 商品詳情頁顯示評論列表和統計
2. 已登入用戶可以發表評論
3. 評分系統 (星星評分)
4. 評論分頁載入
5. 用戶可以編輯自己的評論

元件設計:
- ReviewsList: 評論列表顯示
- ReviewForm: 評論表單 (新增/編輯)
- StarRating: 星星評分元件
- ReviewStats: 評論統計顯示

設計系統規範:
- 使用 Text 元件 (headline, body, caption 等變體)
- 使用 Card 元件包裝評論項目
- 使用統一的色彩系統 (colors.neutral.*)
- 響應式設計支援

請提供:
1. 完整的 React 元件程式碼
2. useReviews Hook 實作
3. 評論相關的 API 服務層
4. 使用範例和整合方法
5. 樣式和響應式處理
```

### 範例 2: 診斷支付失敗問題

**情境**: 用戶回報支付成功但訂單狀態未更新

```
使用 Task tool:
- subagent_type: general-purpose
- description: 診斷支付狀態異常
- prompt: 你是 Wellmade 專案的系統診斷專家，具備全棧除錯和問題分析能力。

問題描述: 
用戶回報以下支付相關問題:
1. 藍新金流顯示支付成功，但訂單狀態仍為 "pending"
2. 用戶收到扣款簡訊，但網站顯示支付失敗
3. 部分訂單出現重複支付記錄

用戶案例:
- 訂單編號: ORD-20250802-00123
- 支付金額: NT$ 2,150
- 支付時間: 2025-08-02 10:30
- 藍新金流交易號: 23456789

系統環境:
- 前端: Next.js + React (port 3000)
- 後端: NestJS (port 3003)
- 資料庫: PostgreSQL
- 支付: 藍新金流 (Newebpay)

診斷重點:
1. 藍新金流回調 (Notify URL) 處理
2. 訂單狀態更新邏輯
3. 支付記錄表資料一致性
4. 交易驗證機制 (SHA256 簽章)
5. 錯誤處理和重試機制

請執行以下診斷步驟:
1. 檢查指定訂單的資料庫記錄狀態
2. 分析後端支付回調日誌
3. 驗證藍新金流 Webhook 設定
4. 測試支付 API 端點功能
5. 檢查交易簽章驗證邏輯

請提供詳細的根因分析、修復建議和預防措施。
```

### 範例 3: 優化商品搜尋效能

**情境**: 商品搜尋回應時間過長，影響使用者體驗

```
使用 Task tool:
- subagent_type: general-purpose
- description: 優化商品搜尋效能
- prompt: 你是 Wellmade 專案的效能優化專家，專精於全棧效能分析和優化。

效能問題:
當前商品搜尋功能存在以下問題:
1. 搜尋回應時間 3-8 秒 (目標 < 1 秒)
2. 資料庫查詢 CPU 使用率高
3. 前端搜尋結果載入緩慢
4. 手機端體驗特別差

當前實作分析:
- 後端: 使用 LIKE 查詢搜尋商品名稱和描述
- 前端: 每次輸入都觸發 API 請求
- 資料庫: 沒有全文搜尋索引
- 快取: 沒有實作搜尋結果快取

優化目標:
- 搜尋回應時間 < 1 秒
- 支援模糊搜尋和搜尋建議
- 改善手機端搜尋體驗
- 降低資料庫負載

技術要求:
1. 後端搜尋優化:
   - 實作全文搜尋索引 (PostgreSQL FTS)
   - 添加搜尋結果快取 (Redis 或記憶體快取)
   - 優化資料庫查詢和索引
   - 實作搜尋建議功能

2. 前端搜尋優化:
   - 實作搜尋防抖 (debounce)
   - 添加搜尋結果快取
   - 實作無限滾動分頁
   - 改善載入狀態顯示

3. 效能監控:
   - 添加搜尋效能指標
   - 實作查詢分析和優化建議

請提供完整的優化方案，包括:
1. 具體的效能瓶頸分析
2. 後端搜尋優化實作
3. 前端搜尋體驗改善
4. 效能測試和對比結果
5. 監控和維護建議
```

## 🐛 問題排查範例

### 範例 4: 購物車數據同步問題

```
使用 Task tool:
- subagent_type: general-purpose
- description: 診斷購物車同步異常
- prompt: 你是 Wellmade 專案的系統診斷專家，具備全棧除錯和問題分析能力。

問題描述:
用戶回報購物車相關問題:
1. 訪客模式添加商品後，登入時部分商品消失
2. 同一商品出現重複項目，數量計算錯誤
3. 更新商品數量後，重新整理頁面數量變回原值
4. 偶爾出現"商品已下架"但商品實際可購買

用戶操作流程:
1. 訪客模式瀏覽，添加 A、B、C 三個商品
2. 進行 Google 登入
3. 檢查購物車，只剩商品 A，B、C 消失
4. 重新添加商品 B，出現兩個商品 B 項目

技術背景:
- 前端: CartContext.tsx 管理購物車狀態
- 後端: 購物車 API 支援訪客 (sessionId) 和會員 (userId)
- 本地: localStorage 儲存訪客購物車
- 同步: 登入時合併 localStorage 到後端

診斷要求:
1. 檢查 CartContext 中的 mergeGuestCart 邏輯
2. 分析 localStorage 和後端資料同步機制
3. 驗證購物車 API 的去重處理
4. 檢查商品 ID 和變體 ID 的處理邏輯
5. 測試認證狀態變化時的購物車處理

請提供:
1. 完整的問題重現步驟
2. 詳細的根因分析
3. 具體的修復方案
4. 測試驗證方法
5. 類似問題的預防建議

使用可用工具檢查實際的程式碼和資料狀態。
```

### 範例 5: 認證狀態異常診斷

```
使用 Task tool:
- subagent_type: general-purpose
- description: 診斷認證狀態問題
- prompt: 你是 Wellmade 專案的系統診斷專家，專精於認證系統和 OAuth 流程分析。

問題描述:
用戶回報認證相關問題:
1. Google 登入後顯示已登入，但 API 請求返回 401
2. 頁面重新整理後認證狀態消失
3. backendToken 有時為空或失效
4. 部分用戶無法正常登出

認證架構:
- 前端: NextAuth.js + Google OAuth
- 後端: NestJS + JWT + Passport
- 流程: Google OAuth → NextAuth → 後端同步 → JWT 發放

具體案例:
- 用戶郵箱: test@example.com
- 登入時間: 2025-08-02 11:00
- 問題: 前端顯示已登入，但購物車 API 返回 401
- Console 錯誤: "未找到有效的認證令牌"

診斷重點:
1. NextAuth session 狀態和 JWT callback
2. 後端 /oauth-sync 端點處理
3. backendToken 的生成和存儲
4. API 請求的認證標頭處理
5. JWT token 的有效期和刷新機制

請執行診斷:
1. 檢查 NextAuth 配置和 callback 處理
2. 分析後端認證同步邏輯
3. 驗證 JWT token 生成和驗證
4. 測試 API 認證流程
5. 檢查 session 存儲和管理

請提供問題分析和修復建議。
```

## 🧪 測試場景範例

### 範例 6: E2E 測試規劃

```
使用 Task tool:
- subagent_type: general-purpose
- description: 規劃E2E測試策略
- prompt: 你是 Wellmade 專案的測試專家，負責品質保證和測試策略制定。

測試任務: 為 Wellmade 電商平台建立全面的 E2E 測試策略

測試範圍:
1. 用戶註冊和登入流程
2. 商品瀏覽和搜尋功能
3. 購物車完整流程 (訪客 → 登入 → 結帳)
4. 支付流程 (藍新金流整合)
5. 訂單管理和狀態追蹤
6. 管理員功能測試

關鍵測試場景:
1. 完整購買流程:
   - 訪客瀏覽商品 → 添加到購物車
   - Google 登入 → 購物車合併
   - 填寫收件資訊 → 選擇付款方式
   - 完成支付 → 訂單確認
   - 查看訂單狀態

2. 異常情況處理:
   - 網路中斷時的處理
   - 支付失敗的重試機制
   - 商品庫存不足的提示
   - 認證過期的重新登入

測試工具和方法:
- 手動測試: 完整使用者流程測試
- API 測試: 各端點功能和邊界測試  
- 瀏覽器測試: 跨瀏覽器相容性
- 行動裝置測試: 響應式設計驗證

請提供:
1. 詳細的測試用例清單
2. 測試腳本和自動化方案
3. 測試資料準備和清理
4. 測試結果報告模板
5. 回歸測試檢查清單

確保測試覆蓋所有關鍵業務流程和異常情況。
```

## 🔧 維護場景範例

### 範例 7: 程式碼重構建議

```
使用 Task tool:
- subagent_type: general-purpose
- description: 程式碼重構分析
- prompt: 你是 Wellmade 專案的程式碼品質專家，專精於程式碼重構和架構優化。

重構任務: 分析 Wellmade 專案的程式碼品質，提供重構建議

分析重點:
1. 程式碼複雜度和可維護性
2. 重複程式碼識別和消除
3. 函數和元件的單一職責
4. 型別安全和錯誤處理
5. 效能最佳化機會

重點檢查區域:
- CartContext.tsx: 購物車狀態管理邏輯
- 商品相關 API 服務層
- 認證流程處理
- 支付整合邏輯
- 共用元件和 Hook

重構目標:
1. 提高程式碼可讀性和維護性
2. 減少程式碼重複，增加復用性
3. 改善錯誤處理和使用者體驗
4. 優化效能和記憶體使用
5. 增強型別安全

請提供:
1. 程式碼品質分析報告
2. 具體的重構建議和優先級
3. 重構前後的程式碼對比
4. 重構對系統的影響評估
5. 重構實施計劃和風險評估

確保重構不影響現有功能的正確性。
```

### 範例 8: 安全性審查

```
使用 Task tool:
- subagent_type: general-purpose
- description: 安全性漏洞審查
- prompt: 你是 Wellmade 專案的安全專家，專精於 Web 應用安全和漏洞分析。

安全審查任務: 對 Wellmade 電商平台進行全面的安全性評估

安全檢查範圍:
1. 認證和授權機制
2. 資料驗證和清理
3. SQL 注入防護
4. XSS 攻擊防護
5. CSRF 保護機制
6. 敏感資料處理

重點審查區域:
- 用戶認證流程 (Google OAuth + JWT)
- 支付資料處理 (藍新金流整合)
- 用戶輸入驗證 (表單、搜尋、評論)
- API 端點授權檢查
- 敏感資料存儲和傳輸
- Session 和 Cookie 安全

安全標準:
- OWASP Top 10 安全風險
- 支付卡行業資料安全標準 (PCI DSS)
- 個人資料保護相關規範
- API 安全最佳實踐

請執行:
1. 程式碼安全漏洞掃描
2. API 端點安全測試
3. 認證機制強度評估
4. 資料保護措施檢查
5. 第三方服務整合安全性

請提供:
1. 安全風險評估報告
2. 發現的漏洞和風險等級
3. 具體的修復建議和實作
4. 安全防護措施改善方案
5. 安全監控和預警機制建議
```

## 📊 效能優化範例

### 範例 9: 全站效能診斷

```
使用 Task tool:
- subagent_type: general-purpose
- description: 全站效能分析優化
- prompt: 你是 Wellmade 專案的效能優化專家，專精於全棧效能分析和優化。

效能優化任務: 對 Wellmade 電商平台進行全面的效能評估和優化

效能問題現況:
1. 首頁載入時間 4-6 秒 (目標 < 2 秒)
2. 商品詳情頁圖片載入緩慢
3. 購物車操作回應延遲
4. 手機端滑動卡頓
5. 搜尋功能回應慢

效能分析範圍:
- 前端效能: Core Web Vitals, 載入速度, 互動回應
- 後端效能: API 回應時間, 資料庫查詢效能
- 網路效能: 資源大小, 請求數量, 快取策略
- 資料庫效能: 查詢優化, 索引設計, 連接池

優化目標:
- 首頁 LCP < 2 秒
- 所有頁面 FID < 100ms
- API 回應時間 < 500ms
- 圖片載入優化 50%
- 手機端體驗流暢度提升

請執行效能分析:
1. 使用 Lighthouse 分析各頁面效能
2. 檢查資料庫查詢效能和索引使用
3. 分析網路請求和資源載入
4. 評估圖片優化和 CDN 配置
5. 測試不同網路環境下的表現

請提供:
1. 詳細的效能瓶頸分析報告
2. 具體的優化方案和實作步驟
3. 優化前後的效能對比數據
4. 長期效能監控策略
5. 效能回歸預防措施

使用實際工具測量並驗證優化效果。
```

## 🤝 協作場景範例

### 範例 10: 跨角色協作 - 新功能完整開發

**情境**: 開發商品願望清單功能，需要多個專家協作

**階段 1: 需求分析和技術設計**
```
Task: "需求分析和技術架構設計"
Role: Backend Developer + Frontend Developer

分析商品願望清單功能的完整需求和技術實作方案:
1. 功能需求分析
2. 資料庫設計方案
3. API 介面設計
4. 前端 UI/UX 規劃
5. 技術架構和整合點
```

**階段 2: 後端開發**
```
Task: "開發願望清單後端 API"
Role: Backend Developer

基於階段 1 的設計，實作後端功能...
```

**階段 3: 前端開發**
```
Task: "實作願望清單前端功能"
Role: Frontend Developer

基於已完成的後端 API，開發前端功能...
```

**階段 4: 整合測試**
```
Task: "願望清單功能整合測試"
Role: Test Expert

對完成的願望清單功能進行全面測試...
```

**階段 5: 效能優化**
```
Task: "願望清單效能優化"
Role: Performance Optimizer

分析並優化願望清單功能的效能表現...
```

## 📋 快速參考

### 常用 Prompt 開頭模板

**後端開發**:
```
你是 Wellmade 專案的後端開發專家，專精於 NestJS、PostgreSQL 和 TypeORM。

任務: [具體任務]

技術背景:
- 框架: NestJS + TypeScript
- 資料庫: PostgreSQL + TypeORM
- 認證: JWT + Passport + Google OAuth
```

**前端開發**:
```
你是 Wellmade 專案的前端開發專家，專精於 Next.js、React 和現代前端技術。

任務: [具體任務]

技術背景:
- 框架: Next.js App Router + React 18+
- 狀態: React Context + TanStack Query
- 認證: NextAuth.js + Google OAuth
```

**問題診斷**:
```
你是 Wellmade 專案的系統診斷專家，具備全棧除錯和問題分析能力。

問題描述: [具體問題]

系統環境:
- 前端: Next.js + React (port 3000)
- 後端: NestJS (port 3003)
- 資料庫: PostgreSQL
```

**測試專家**:
```
你是 Wellmade 專案的測試專家，負責品質保證和測試策略制定。

測試任務: [具體測試需求]

測試範圍: [功能範圍]
```

**效能優化**:
```
你是 Wellmade 專案的效能優化專家，專精於全棧效能分析和優化。

效能問題: [具體效能問題]

分析目標: [效能目標]
```

### 任務類型快速選擇

| 任務類型 | 建議角色 | 關鍵字 |
|---------|---------|--------|
| 新增 API 功能 | Backend Developer | API, 資料庫, CRUD |
| UI 元件開發 | Frontend Developer | 元件, 頁面, 樣式 |
| 系統錯誤 | Debugger | 錯誤, 異常, 問題 |
| 功能測試 | Test Expert | 測試, 驗證, 品質 |
| 載入緩慢 | Performance Optimizer | 效能, 優化, 速度 |
| 第三方整合 | Integration Specialist | 支付, OAuth, API |

---

*這些範例涵蓋了 Wellmade 專案的典型開發場景，可以根據實際需求調整和組合使用。*