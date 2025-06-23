"use client";

import { useEffect, useState } from 'react';

export default function DebugLoggerPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`🐛 ${timestamp}: ${message}`);
  };

  const testBasicFetch = async () => {
    addLog('開始基本 fetch 測試...');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
      addLog(`API URL: ${apiUrl}`);
      
      const payload = {
        level: 'test',
        message: '瀏覽器測試',
        session_id: 'browser-test-' + Date.now()
      };
      
      addLog(`發送數據: ${JSON.stringify(payload)}`);
      
      const response = await fetch(`${apiUrl}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      addLog(`響應狀態: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.json();
        addLog(`✅ 成功! ID: ${result.id}`);
      } else {
        const errorText = await response.text();
        addLog(`❌ 失敗: ${errorText}`);
      }
    } catch (error) {
      addLog(`💥 錯誤: ${error.message}`);
    }
  };

  const testLogger = async () => {
    addLog('測試導入 logger...');
    try {
      const { logger } = await import('@/utils/logger');
      addLog('✅ Logger 導入成功');
      
      addLog('觸發 logger.error...');
      logger.error('瀏覽器測試錯誤', { test: true, browser: true });
      addLog('✅ logger.error 調用完成');
      
    } catch (error) {
      addLog(`💥 Logger 錯誤: ${error.message}`);
    }
  };

  const checkEnvironment = () => {
    addLog('檢查環境變數...');
    addLog(`NODE_ENV: ${process.env.NODE_ENV}`);
    addLog(`NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
    addLog(`window 可用: ${typeof window !== 'undefined'}`);
    addLog(`navigator 可用: ${typeof navigator !== 'undefined'}`);
  };

  if (!isClient) {
    return <div>載入中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Logger 調試頁面</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={checkEnvironment}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
        >
          檢查環境
        </button>
        
        <button
          onClick={testBasicFetch}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2"
        >
          測試基本 Fetch
        </button>
        
        <button
          onClick={testLogger}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
        >
          測試 Logger
        </button>
        
        <button
          onClick={() => setLogs([])}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          清除日誌
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
        <h2 className="text-white mb-4">調試輸出：</h2>
        <div className="h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">點擊上方按鈕開始測試...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">檢查步驟：</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>點擊 "檢查環境" 確認環境變數</li>
          <li>點擊 "測試基本 Fetch" 確認網路連接</li>
          <li>點擊 "測試 Logger" 確認 Logger 工作</li>
          <li>打開瀏覽器開發者工具查看更詳細的輸出</li>
        </ol>
      </div>
    </div>
  );
}