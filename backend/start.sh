#!/bin/bash

# 啟動腳本：自動執行遷移並啟動 NestJS 伺服器

# 1. 設定必要的 Node.js 選項（支援 crypto.randomUUID 等功能）
export NODE_OPTIONS="--experimental-global-webcrypto"

# 2. 進入 backend 目錄（若腳本在 backend 目錄外執行）
cd "$(dirname "$0")"

echo "【步驟 1】執行 TypeORM 資料庫遷移..."
npm run migration:run

# 3. 檢查遷移是否成功
if [ $? -ne 0 ]; then
  echo "❌ 資料庫遷移失敗，請檢查錯誤訊息！"
  exit 1
fi

echo "【步驟 2】啟動 NestJS 伺服器..."
npm run start:dev

# 如需以 production 模式啟動，請將最後一行改為：
# npm run build && node dist/src/main.js
