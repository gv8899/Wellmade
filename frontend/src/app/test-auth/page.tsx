'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function TestAuth() {
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleGoogleSignIn = async () => {
    addLog('開始 Google 登入...');
    try {
      const result = await signIn('google', { 
        callbackUrl: 'http://localhost:3000/test-auth',
        redirect: false 
      });
      addLog(`Google 登入結果: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`Google 登入錯誤: ${error}`);
    }
  };

  const handleSignOut = async () => {
    addLog('登出...');
    await signOut({ redirect: false });
    addLog('已登出');
  };

  const testSession = async () => {
    addLog('測試 session...');
    try {
      const response = await fetch('/api/auth/session');
      const sessionData = await response.json();
      addLog(`Session 數據: ${JSON.stringify(sessionData, null, 2)}`);
    } catch (error) {
      addLog(`Session 測試錯誤: ${error}`);
    }
  };

  const testForceBindCart = async () => {
    addLog('測試購物車綁定...');
    try {
      const response = await fetch('/api/cart/force-bind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      addLog(`購物車綁定結果 (${response.status}): ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`購物車綁定錯誤: ${error}`);
    }
  };

  const testBackendOAuthSync = async () => {
    if (!session?.user?.email) {
      addLog('沒有用戶 email，無法測試');
      return;
    }

    addLog('測試後端 OAuth 同步...');
    try {
      const response = await fetch('http://localhost:3003/auth/oauth-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name || 'Test User',
          picture: session.user.image || '',
          provider: 'google'
        })
      });
      
      const result = await response.json();
      addLog(`後端同步結果 (${response.status}): ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      addLog(`後端同步錯誤: ${error}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">NextAuth 測試頁面</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">當前狀態</h2>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>用戶:</strong> {session?.user?.email || '未登入'}</p>
        <p><strong>有 backendToken:</strong> {(session as any)?.backendToken ? '是' : '否'}</p>
        <p><strong>角色:</strong> {(session as any)?.roles?.join(', ') || '無'}</p>
        <p><strong>用戶 ID:</strong> {(session as any)?.userId || '無'}</p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={handleGoogleSignIn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={status === 'loading'}
        >
          Google 登入
        </button>

        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
          disabled={status !== 'authenticated'}
        >
          登出
        </button>

        <button
          onClick={testSession}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2"
        >
          測試 Session
        </button>

        <button
          onClick={testForceBindCart}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 ml-2"
        >
          測試購物車綁定
        </button>

        <button
          onClick={testBackendOAuthSync}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 ml-2"
        >
          測試後端同步
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm">
        <h3 className="text-white mb-2">日誌輸出</h3>
        <div className="max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
        <button
          onClick={() => setLogs([])}
          className="mt-2 bg-gray-700 text-white px-2 py-1 rounded text-xs"
        >
          清除日誌
        </button>
      </div>

      <div className="mt-6 bg-yellow-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Session 完整數據</h3>
        <pre className="text-xs overflow-x-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}