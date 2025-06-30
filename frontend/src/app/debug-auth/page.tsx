"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DebugAuthPage() {
  const { data: session, status } = useSession();
  const [cookies, setCookies] = useState<string>("");
  const [env, setEnv] = useState<any>({});
  const [authTest, setAuthTest] = useState<any>(null);

  useEffect(() => {
    // 獲取 cookies
    setCookies(document.cookie);
    
    // 獲取環境資訊
    setEnv({
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      origin: window.location.origin,
      protocol: window.location.protocol,
      host: window.location.host,
    });

    // 測試 NextAuth API
    const testAuth = async () => {
      try {
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        
        const csrfResponse = await fetch('/api/auth/csrf');
        const csrfData = await csrfResponse.json();
        
        setAuthTest({
          sessionAPI: sessionData,
          csrfToken: csrfData,
          sessionResponse: sessionResponse.status,
          csrfResponse: csrfResponse.status,
        });
      } catch (error) {
        setAuthTest({
          error: error.message,
        });
      }
    };

    testAuth();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">認證調試頁面</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Session 狀態</h2>
          <pre className="text-xs overflow-auto">
            Status: {status}
            {"\n"}
            Session: {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Cookies</h2>
          <pre className="text-xs overflow-auto break-all">
            {cookies || "No cookies found"}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">環境資訊</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(env, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">NextAuth API 測試</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(authTest, null, 2)}
          </pre>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-semibold mb-2">檢查項目</h2>
          <ul className="list-disc list-inside text-sm">
            <li>Cookie 中是否有 next-auth.session-token？</li>
            <li>Cookie domain 是否正確？</li>
            <li>Protocol 是否為 https？</li>
            <li>Session 是否為 null？</li>
            <li>NextAuth API (/api/auth/session) 是否返回 200？</li>
            <li>CSRF token 是否正確生成？</li>
          </ul>
        </div>
      </div>
    </div>
  );
}