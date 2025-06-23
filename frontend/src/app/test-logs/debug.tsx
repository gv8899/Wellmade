"use client";

import { useState } from 'react';

export default function DebugLogger() {
  const [result, setResult] = useState<string>('');

  const testDirectFetch = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
      const payload = {
        level: 'debug',
        message: '前端直接測試',
        context: { test: 'direct_fetch' },
        session_id: 'debug-session',
        url: window.location.href,
        user_agent: navigator.userAgent
      };

      console.log('🧪 準備發送測試請求:', payload);
      console.log('🌐 API URL:', `${apiUrl}/logs`);

      const response = await fetch(`${apiUrl}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ 成功:', result);
      setResult(`成功！ID: ${result.id}, 時間: ${result.timestamp}`);
      
    } catch (error) {
      console.error('❌ 錯誤:', error);
      setResult(`錯誤: ${error.message}`);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">直接測試前端 API 調用</h3>
      <button 
        onClick={testDirectFetch}
        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
      >
        測試直接 Fetch
      </button>
      {result && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <strong>結果:</strong> {result}
        </div>
      )}
    </div>
  );
}