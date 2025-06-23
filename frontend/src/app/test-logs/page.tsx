"use client";

import { useState } from 'react';
import { logger } from '@/utils/logger';
import toast from 'react-hot-toast';
import DebugLogger from './debug';

export default function TestLogsPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const triggerError = () => {
    try {
      // 故意觸發錯誤
      throw new Error('這是一個測試錯誤');
    } catch (error) {
      logger.error('捕獲的測試錯誤', { 
        error: error.message,
        stack: error.stack,
        testType: 'manual_trigger'
      });
      addResult('已觸發手動錯誤並記錄到資料庫');
    }
  };

  const triggerUncaughtError = () => {
    addResult('準備觸發未捕獲錯誤...');
    // 延遲觸發，讓用戶看到消息
    setTimeout(() => {
      throw new Error('這是一個未捕獲的錯誤');
    }, 1000);
  };

  const triggerPromiseRejection = () => {
    addResult('準備觸發 Promise 拒絕...');
    // 延遲觸發
    setTimeout(() => {
      Promise.reject(new Error('這是一個未處理的 Promise 拒絕'));
    }, 1000);
  };

  const logUserAction = () => {
    logger.trackUserAction('測試用戶操作', {
      buttonClicked: 'logUserAction',
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
    addResult('已記錄用戶操作到資料庫');
  };

  const logApiCall = () => {
    const startTime = performance.now();
    // 模擬API調用
    setTimeout(() => {
      const duration = performance.now() - startTime;
      logger.trackApiCall('GET', '/api/test', duration, 200);
      addResult(`已記錄API調用到資料庫 (${duration.toFixed(2)}ms)`);
    }, Math.random() * 500 + 100); // 隨機延遲
  };

  const logSlowOperation = () => {
    const startTime = performance.now();
    // 模擬慢速操作
    setTimeout(() => {
      const duration = performance.now() - startTime;
      logger.trackPerformance('測試慢速操作', duration, 100); // 閾值設為100ms
      addResult(`已記錄效能操作到資料庫 (${duration.toFixed(2)}ms)`);
    }, 1500); // 故意超過閾值
  };

  const logWarning = () => {
    logger.warn('這是一個測試警告', {
      warningType: 'test',
      severity: 'medium',
      component: 'TestLogsPage'
    });
    addResult('已記錄警告到資料庫');
  };

  const logInfo = () => {
    logger.info('這是一個測試資訊', {
      infoType: 'test',
      feature: 'logging_system',
      component: 'TestLogsPage'
    });
    addResult('已記錄資訊到資料庫');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">前端日誌系統測試</h1>
      
      <div className="mb-8">
        <DebugLogger />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <button
          onClick={triggerError}
          className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-lg"
        >
          觸發捕獲錯誤
        </button>
        
        <button
          onClick={triggerUncaughtError}
          className="bg-red-700 hover:bg-red-800 text-white p-4 rounded-lg"
        >
          觸發未捕獲錯誤
        </button>
        
        <button
          onClick={triggerPromiseRejection}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg"
        >
          觸發 Promise 拒絕
        </button>
        
        <button
          onClick={logUserAction}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg"
        >
          記錄用戶操作
        </button>
        
        <button
          onClick={logApiCall}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg"
        >
          記錄 API 調用
        </button>
        
        <button
          onClick={logSlowOperation}
          className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-lg"
        >
          記錄慢速操作
        </button>
        
        <button
          onClick={logWarning}
          className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg"
        >
          記錄警告
        </button>
        
        <button
          onClick={logInfo}
          className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-lg"
        >
          記錄資訊
        </button>
        
        <button
          onClick={clearResults}
          className="bg-gray-700 hover:bg-gray-800 text-white p-4 rounded-lg"
        >
          清除結果
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">測試結果：</h2>
        <div className="max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">點擊上方按鈕開始測試...</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-2 p-2 bg-white rounded text-sm">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">如何查看日誌：</h3>
        <div className="text-sm space-y-1">
          <p><strong>1.</strong> 點擊上方按鈕觸發各種日誌</p>
          <p><strong>2.</strong> 使用 Claude 的 MCP 查詢功能檢查資料庫：</p>
          <code className="block bg-gray-200 p-2 rounded mt-2">
            SELECT * FROM frontend_logs ORDER BY timestamp DESC LIMIT 10;
          </code>
          <p><strong>3.</strong> 查看特定類型的日誌：</p>
          <code className="block bg-gray-200 p-2 rounded mt-2">
            SELECT * FROM frontend_logs WHERE level = 'error' ORDER BY timestamp DESC;
          </code>
        </div>
      </div>
    </div>
  );
}