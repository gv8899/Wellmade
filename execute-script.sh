#!/bin/bash

echo "正在執行圖片 URL 更新腳本..."

# 步驟 1: 登入獲取 token
echo "步驟 1: 獲取管理員 token..."
LOGIN_RESPONSE=$(curl -s -X POST "https://api.wellmade.select/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wellmade.com",
    "password": "admin123"
  }')

echo "登入回應: $LOGIN_RESPONSE"

# 提取 token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ 無法獲取 token，請檢查登入資訊"
  exit 1
fi

echo "✅ 成功獲取 token: ${TOKEN:0:20}..."

# 步驟 2: 執行腳本
echo "步驟 2: 執行圖片 URL 更新腳本..."
SCRIPT_RESPONSE=$(curl -s -X POST "https://api.wellmade.select/admin/scripts/update-image-urls" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "腳本執行結果:"
echo $SCRIPT_RESPONSE | jq .

# 檢查執行結果
SUCCESS=$(echo $SCRIPT_RESPONSE | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "🎉 圖片 URL 更新成功完成！"
else
  echo "❌ 腳本執行失敗"
  exit 1
fi