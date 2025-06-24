"use client";
import React, { useState, useEffect } from 'react';
import { consoleLogger } from '@/utils/console-logger';

interface LogEntry {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';
  category: string;
  message: string;
  data?: any;
  source?: string;
  stack?: string;
}

const ConsoleLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 定期更新日誌
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(consoleLogger.getLogs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 快捷鍵控制顯示/隱藏
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + L 切換日誌視窗
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  // 過濾日誌
  const filteredLogs = logs
    .filter(log => {
      if (filter !== 'ALL' && log.level !== filter) return false;
      if (categoryFilter !== 'ALL' && log.category !== categoryFilter) return false;
      if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .slice(-500); // 只顯示最新500條

  // 獲取所有分類
  const categories = Array.from(new Set(logs.map(log => log.category)));

  // 日誌等級樣式
  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-500 bg-red-50';
      case 'WARN': return 'text-yellow-600 bg-yellow-50';
      case 'INFO': return 'text-blue-500 bg-blue-50';
      case 'DEBUG': return 'text-gray-500 bg-gray-50';
      case 'TRACE': return 'text-gray-400 bg-gray-25';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  // 分類圖標
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      cart: '🛒',
      api: '🌐',
      auth: '🔐',
      product: '📦',
      variant: '🎯',
      error: '❌',
      performance: '⏱️',
      console: '💻'
    };
    return icons[category] || 'ℹ️';
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
          title="顯示 Console Log (Ctrl+Shift+L)"
        >
          📋 Console Log
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={(e) => {
      if (e.target === e.currentTarget) setIsVisible(false);
    }}>
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-white border-t border-gray-200 shadow-lg">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">📋 Console Log 查看器</h3>
            <span className="text-sm text-gray-500">
              {filteredLogs.length} / {logs.length} 條日誌
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                consoleLogger.clear();
                setLogs([]);
              }}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              清空
            </button>
            <button
              onClick={() => consoleLogger.showStats()}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              統計
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              關閉
            </button>
          </div>
        </div>

        {/* 過濾器 */}
        <div className="flex items-center space-x-4 p-3 bg-gray-50 border-b border-gray-200">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="ALL">所有等級</option>
            <option value="ERROR">錯誤</option>
            <option value="WARN">警告</option>
            <option value="INFO">信息</option>
            <option value="DEBUG">調試</option>
            <option value="TRACE">追蹤</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="ALL">所有分類</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {getCategoryIcon(category)} {category}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="搜尋日誌內容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
          />
        </div>

        {/* 日誌列表 */}
        <div className="h-full overflow-auto p-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              沒有符合條件的日誌
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className={`p-2 rounded border-l-4 ${getLevelStyle(log.level)} border-l-current`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <span>{getCategoryIcon(log.category)}</span>
                        <span className="font-medium">{log.level}</span>
                        <span className="text-gray-500">{log.category}</span>
                        <span className="text-gray-400 text-xs">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-mono">
                        {log.message}
                      </div>
                      {log.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer">
                            查看詳細數據
                          </summary>
                          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                      {log.stack && log.level === 'ERROR' && (
                        <details className="mt-2">
                          <summary className="text-xs text-red-500 cursor-pointer">
                            查看錯誤堆棧
                          </summary>
                          <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-auto max-h-32 text-red-700">
                            {log.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 使用說明 */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          快捷鍵: Ctrl+Shift+L 切換顯示
        </div>
      </div>
    </div>
  );
};

export default ConsoleLogViewer;