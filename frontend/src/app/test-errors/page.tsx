"use client";

import { useState } from 'react';

// 故意有錯誤的組件
function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('這是一個測試 React 錯誤！');
  }
  return <div>組件正常運行</div>;
}

export default function TestErrorsPage() {
  const [showBuggyComponent, setShowBuggyComponent] = useState(false);

  const triggerJSError = () => {
    // 觸發 JavaScript 錯誤
    setTimeout(() => {
      throw new Error('這是一個測試 JavaScript 錯誤！');
    }, 100);
  };

  const triggerPromiseError = () => {
    // 觸發 Promise 拒絕
    setTimeout(() => {
      Promise.reject(new Error('這是一個測試 Promise 拒絕！'));
    }, 100);
  };

  const triggerConsoleError = () => {
    // 觸發 console.error
    console.error('這是一個測試 console.error！', { 
      data: 'test', 
      timestamp: new Date().toISOString() 
    });
  };

  const triggerNetworkError = () => {
    // 觸發網路錯誤
    fetch('http://nonexistent-domain-123456.com/api/test')
      .catch(error => {
        console.error('網路請求失敗:', error);
      });
  };

  const triggerResourceError = () => {
    // 觸發資源加載錯誤
    const img = new Image();
    img.src = 'http://nonexistent-domain-123456.com/image.jpg';
    document.body.appendChild(img);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">錯誤測試頁面</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>注意：</strong>這個頁面會故意觸發各種錯誤來測試日誌系統。所有錯誤都應該自動記錄到資料庫中。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <button
          onClick={triggerJSError}
          className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-lg"
        >
          🚨 觸發 JavaScript 錯誤
        </button>
        
        <button
          onClick={triggerPromiseError}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg"
        >
          🚨 觸發 Promise 拒絕
        </button>
        
        <button
          onClick={triggerConsoleError}
          className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg"
        >
          🚨 觸發 Console 錯誤
        </button>
        
        <button
          onClick={() => setShowBuggyComponent(true)}
          className="bg-red-700 hover:bg-red-800 text-white p-4 rounded-lg"
        >
          🚨 觸發 React 錯誤
        </button>
        
        <button
          onClick={triggerNetworkError}
          className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg"
        >
          🚨 觸發網路錯誤
        </button>
        
        <button
          onClick={triggerResourceError}
          className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-lg"
        >
          🚨 觸發資源錯誤
        </button>
      </div>

      {/* React 錯誤測試組件 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">React 錯誤測試</h2>
        <div className="p-4 border rounded-lg">
          {showBuggyComponent ? (
            <BuggyComponent shouldThrow={true} />
          ) : (
            <div>
              <p>點擊上方的 "觸發 React 錯誤" 按鈕來測試 React 錯誤邊界</p>
              <button
                onClick={() => setShowBuggyComponent(false)}
                className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                重置組件
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">測試指南：</h3>
        <div className="text-sm space-y-2">
          <p><strong>1.</strong> 點擊各種錯誤按鈕</p>
          <p><strong>2.</strong> 打開瀏覽器開發者工具查看日誌</p>
          <p><strong>3.</strong> 使用 Claude MCP 查詢資料庫：</p>
          <pre className="bg-gray-200 p-2 rounded mt-2 text-xs">
{`SELECT level, message, context, timestamp 
FROM frontend_logs 
WHERE timestamp >= NOW() - INTERVAL '10 minutes'
ORDER BY timestamp DESC;`}
          </pre>
          <p><strong>4.</strong> 查看特定錯誤類型：</p>
          <pre className="bg-gray-200 p-2 rounded mt-2 text-xs">
{`SELECT * FROM frontend_logs 
WHERE level = 'error' 
AND timestamp >= NOW() - INTERVAL '10 minutes'
ORDER BY timestamp DESC;`}
          </pre>
        </div>
      </div>
    </div>
  );
}