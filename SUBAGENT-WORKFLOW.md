# Subagent 開發工作流程指南

本文件詳細說明如何在 Wellmade 專案中有效使用 subagent 進行協作開發。

## 🚀 開始使用 Subagent

### 系統限制說明
目前 Claude Code 只支援 `general-purpose` subagent 類型，但我們可以透過明確的角色指定和任務描述來模擬專業化 subagent 的效果。

### 基本語法
```
使用 Task tool 啟動 subagent：
- subagent_type: general-purpose (目前唯一選項)
- description: 簡短任務描述 (3-5 個字)  
- prompt: 扮演特定角色 + 詳細任務指示
```

## 📋 任務分配策略

### 1. 後端開發任務 (Backend Developer 角色)

**觸發時機:**
- 需要新增 API 端點
- 資料庫設計或遷移
- 業務邏輯實作
- 第三方服務整合

**Prompt 模板:**
```
你是 Wellmade 專案的後端開發專家，專精於 NestJS、PostgreSQL 和 TypeORM。

任務: [具體任務描述]

技術背景:
- 框架: NestJS + TypeScript
- 資料庫: PostgreSQL + TypeORM  
- 認證: JWT + Passport + Google OAuth
- 支付: 藍新金流整合
- 架構: RESTful API 設計

開發要求:
1. 遵循現有程式碼風格和架構
2. 使用 TypeORM 遷移管理資料庫變更
3. 實作適當的驗證和錯誤處理
4. 添加必要的日誌記錄
5. 確保 API 安全性 (JWT 保護)

請提供完整的實作程式碼和測試方法。
```

### 2. 前端開發任務 (Frontend Developer 角色)

**觸發時機:**
- UI 元件開發
- 頁面功能實作
- 狀態管理改進
- 使用者體驗優化

**Prompt 模板:**
```
你是 Wellmade 專案的前端開發專家，專精於 Next.js、React 和現代前端技術。

任務: [具體任務描述]

技術背景:
- 框架: Next.js App Router + React 18+
- 狀態: React Context + TanStack Query
- 認證: NextAuth.js + Google OAuth
- 樣式: Tailwind CSS + 設計系統
- 工具: TypeScript + ESLint

設計系統規範:
- 使用統一的 Text 元件變體 (title1, headline, body 等)
- 使用 Card 元件 (elevated, borderless 等變體)
- 價格格式化使用 @/utils/format.ts
- 遵循響應式設計原則

開發要求:
1. 符合現有設計系統規範
2. 實作適當的載入和錯誤狀態
3. 使用 TanStack Query 管理 API 狀態
4. 確保響應式設計和無障礙性
5. 整合現有的認證系統

請提供完整的元件程式碼和使用範例。
```

### 3. 問題診斷任務 (Debugger 角色)

**觸發時機:**
- 系統異常或錯誤
- 效能問題分析
- 使用者回報問題
- 整合問題排查

**Prompt 模板:**
```
你是 Wellmade 專案的系統診斷專家，具備全棧除錯和問題分析能力。

問題描述: [具體問題內容]

系統環境:
- 前端: Next.js + React (port 3000)
- 後端: NestJS (port 3003)  
- 資料庫: PostgreSQL
- 認證: NextAuth.js + JWT
- 支付: 藍新金流

診斷重點:
1. 問題根因分析
2. 系統狀態檢查 (服務、資料庫、網路)
3. 日誌分析 (前後端 Console)
4. API 端點測試
5. 資料完整性驗證

請提供:
1. 詳細的問題診斷步驟
2. 根因分析結果
3. 修復建議和優先級
4. 預防措施建議
5. 如需其他專家協助的建議

使用可用工具進行實際檢查和驗證。
```

### 4. 測試任務 (Test Expert 角色)

**觸發時機:**
- 新功能測試規劃
- 回歸測試執行
- 測試自動化建立
- 品質保證檢查

**Prompt 模板:**
```
你是 Wellmade 專案的測試專家，負責品質保證和測試策略制定。

測試任務: [具體測試需求]

測試範圍:
- 功能測試: API 端點、UI 元件、使用者流程
- 整合測試: 前後端整合、第三方服務
- 效能測試: 載入速度、回應時間
- 安全測試: 認證、授權、資料驗證

工具和框架:
- API 測試: curl, Postman
- 前端測試: Jest, Testing Library
- E2E 測試: 手動測試流程
- 效能測試: 瀏覽器 DevTools

請提供:
1. 完整的測試策略和測試用例
2. 測試腳本和自動化方案
3. 測試結果報告和分析
4. 品質改進建議
5. 回歸測試檢查清單

確保測試覆蓋關鍵業務流程。
```

### 5. 效能優化任務 (Performance Optimizer 角色)

**觸發時機:**
- 載入速度問題
- 系統效能瓶頸
- 資源使用優化
- 使用者體驗改善

**Prompt 模板:**
```
你是 Wellmade 專案的效能優化專家，專精於全棧效能分析和優化。

效能問題: [具體效能問題描述]

優化領域:
- 前端效能: 載入速度、渲染效能、圖片優化
- 後端效能: API 回應時間、資料庫查詢、快取策略
- 網路效能: 請求數量、資源大小、CDN 配置
- 使用者體驗: 互動回應、視覺穩定性

分析工具:
- 前端: Chrome DevTools, Lighthouse
- 後端: 查詢分析器、效能監控
- 資料庫: PostgreSQL EXPLAIN
- 網路: Network 面板分析

請提供:
1. 詳細的效能瓶頸分析
2. 具體的優化方案和實作
3. 預期效能改善指標
4. 優化前後對比測試
5. 長期效能監控建議

使用實際工具進行效能測量和驗證。
```

### 6. 整合專家任務 (Integration Specialist 角色)

**觸發時機:**
- 第三方服務整合
- 支付系統問題
- OAuth 認證問題
- API 串接異常

**Prompt 模板:**
```
你是 Wellmade 專案的整合專家，專精於第三方服務整合和系統間溝通。

整合任務: [具體整合需求]

專業領域:
- 支付整合: 藍新金流 API、Webhook 處理
- 認證整合: Google OAuth 2.0、JWT 管理
- API 串接: RESTful API、錯誤處理
- 資料同步: 系統間資料一致性

技術重點:
- 加密解密: AES、SHA256 簽章驗證
- 錯誤重試: 指數退避、斷路器模式
- 資料轉換: 格式標準化、驗證機制
- 監控警報: 服務狀態檢查、異常通知

請提供:
1. 整合架構設計和最佳實踐
2. 完整的實作程式碼
3. 錯誤處理和重試機制
4. 測試和驗證方法
5. 監控和維護建議

確保整合的穩定性和可靠性。
```

## 🔄 多 Agent 協作流程

### 典型開發流程

1. **需求分析** → 選擇主責 Agent
2. **開發實作** → Backend/Frontend Agent
3. **整合測試** → Integration Specialist
4. **問題診斷** → Debugger (如有問題)
5. **品質保證** → Test Expert  
6. **效能優化** → Performance Optimizer (如需要)

### 協作範例：新功能開發

**階段 1: 後端開發**
```
Task (general-purpose): "開發商品收藏 API"
Prompt: [使用後端開發 Prompt 模板]
```

**階段 2: 前端開發**
```
Task (general-purpose): "實作商品收藏前端"
Prompt: [使用前端開發 Prompt 模板 + 後端 API 資訊]
```

**階段 3: 整合測試**
```
Task (general-purpose): "測試收藏功能整合"
Prompt: [使用測試專家 Prompt 模板]
```

### 問題處理流程

**階段 1: 問題診斷**
```
Task (general-purpose): "診斷購物車同步問題"
Prompt: [使用 Debugger Prompt 模板]
```

**階段 2: 具體修復**
```
Task (general-purpose): "修復購物車邏輯"
Prompt: [使用相關開發角色 + Debugger 的診斷結果]
```

**階段 3: 驗證測試**
```
Task (general-purpose): "驗證修復結果"
Prompt: [使用測試專家 Prompt 模板]
```

## 📊 任務優先級和分配指南

### 高優先級 (立即處理)
- 系統崩潰或嚴重錯誤 → **Debugger**
- 支付流程異常 → **Integration Specialist + Debugger**
- 安全性漏洞 → **Backend Developer + Test Expert**

### 中優先級 (計劃處理)
- 新功能開發 → **Backend/Frontend Developer**
- 效能優化需求 → **Performance Optimizer**
- 測試覆蓋改善 → **Test Expert**

### 低優先級 (有空處理)
- UI/UX 改善 → **Frontend Developer**
- 程式碼重構 → **相關 Developer**
- 文檔更新 → **任何 Agent**

## 🛠️ 最佳實踐

### Do's ✅
1. **明確角色定義**: 在 Prompt 開頭明確指定專家角色
2. **提供完整上下文**: 包含技術背景、需求細節、限制條件
3. **指定具體產出**: 明確期望的交付物和格式
4. **包含測試要求**: 要求提供測試方法和驗證步驟
5. **考慮後續維護**: 要求提供監控和維護建議

### Don'ts ❌
1. **避免模糊指示**: 不要使用"做一些改進"等模糊要求
2. **不要忽略現有架構**: 必須遵循現有的程式碼風格和架構
3. **不要跳過測試**: 任何變更都應包含測試驗證
4. **不要忽略安全性**: 涉及認證和資料的變更需特別注意
5. **不要孤立開發**: 考慮與其他系統組件的整合

## 📝 實用範例模板

### 範例 1: 新功能開發
```
Task Description: "開發使用者評論功能"
Role: Backend Developer
Context: 需要為商品頁面添加評論系統
Requirements: CRUD API + 評分系統 + 分頁查詢
Deliverables: 遷移檔案 + Entity + Controller + 測試
```

### 範例 2: 問題修復  
```
Task Description: "修復圖片上傳失敗"
Role: Debugger + Backend Developer
Context: 用戶無法上傳商品圖片，返回 500 錯誤
Requirements: 根因分析 + 修復方案 + 預防措施
Deliverables: 問題分析報告 + 修復程式碼 + 測試驗證
```

### 範例 3: 效能優化
```
Task Description: "優化商品搜尋效能"
Role: Performance Optimizer + Backend Developer  
Context: 搜尋回應時間超過 5 秒，用戶體驗差
Requirements: 效能分析 + 索引優化 + 快取策略
Deliverables: 效能報告 + 優化程式碼 + 性能測試
```

## 🔍 監控和改進

### 成效追蹤
- **任務完成時間**: 記錄不同類型任務的平均處理時間
- **程式碼品質**: 檢查產出程式碼的可維護性和符合規範程度
- **問題解決率**: 統計 Debugger 成功診斷和解決問題的比例
- **整合成功率**: 評估多 Agent 協作的效果

### 持續改進
- **Prompt 優化**: 根據實際使用效果調整 Prompt 模板
- **角色細化**: 根據專案需求添加更專業的子角色
- **工作流程改進**: 優化多 Agent 協作的流程和規範
- **工具整合**: 增加更多專業工具的使用指導

---

*建議定期回顧和更新此工作流程指南，確保與專案發展同步。*