#!/bin/bash

# Wellmade 前後端一次啟動腳本
echo "🚀 啟動 Wellmade 前後端服務..."

# 檢查並清理端口
echo "🔍 檢查端口使用情況..."

# 清理 3003 端口（後端）
BACKEND_PID=$(lsof -ti:3003)
if [ ! -z "$BACKEND_PID" ]; then
    echo "⚠️  3003 端口被佔用，正在終止進程..."
    kill -9 $BACKEND_PID
fi

# 清理 3000 端口（前端）
FRONTEND_PID=$(lsof -ti:3000)
if [ ! -z "$FRONTEND_PID" ]; then
    echo "⚠️  3000 端口被佔用，正在終止進程..."
    kill -9 $FRONTEND_PID
fi

echo "✅ 端口清理完成"

# 啟動後端
echo "🔧 啟動後端服務 (port 3003)..."
cd backend
npm run start:dev &
BACKEND_PROCESS=$!

# 啟動前端
echo "🌐 啟動前端服務 (port 3000)..."
cd ../frontend
npm run dev &
FRONTEND_PROCESS=$!

# 等待後端啟動
echo "⏳ 等待後端服務啟動..."
for i in {1..30}; do
    if curl -f http://localhost:3003/health > /dev/null 2>&1; then
        echo "✅ 後端服務啟動成功"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  後端服務啟動超時，但可能還在啟動中..."
        break
    fi
    sleep 2
done

# 等待前端啟動
echo "⏳ 等待前端服務啟動..."
for i in {1..20}; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ 前端服務啟動成功"
        break
    fi
    if [ $i -eq 20 ]; then
        echo "⚠️  前端服務可能還在啟動中..."
        break
    fi
    sleep 2
done

echo ""
echo "🎉 Wellmade 服務啟動完成！"
echo "📍 前端: http://localhost:3000"
echo "📍 後端: http://localhost:3003"
echo "📍 健康檢查: http://localhost:3003/health"
echo ""
echo "按 Ctrl+C 停止所有服務"
echo ""

# 等待用戶中斷
wait