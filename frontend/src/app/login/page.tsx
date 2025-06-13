"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/components/UserContext";
import { signIn } from "next-auth/react";
import GoogleLoginButton from "../components/GoogleLoginButton";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const router = useRouter();
  const { login } = useUser();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (mode === 'login') {
        // 呼叫登入 API
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.message || '登入失敗，請檢查帳號密碼');
          return;
        }
        
        // 登入成功
        login({ 
          name: data.user.email, // 可以從 API 回傳的用戶資料取得名稱
          email: data.user.email,
          token: data.access_token
        });
        toast.success('登入成功');
        router.push('/');
      } else {
        // 呼叫註冊 API
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.message || '註冊失敗，請檢查輸入資訊');
          return;
        }
        
        // 註冊成功後自動登入
        login({
          name: data.user.email, 
          email: data.user.email,
          token: data.access_token
        });
        toast.success('註冊成功');
        router.push('/');
      }
    } catch (err) {
      console.error('API 請求錯誤:', err);
      setError('連線伺服器失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // 使用 NextAuth 的 signIn 方法進行 Google 登入
      await signIn('google', { callbackUrl: '/' });
      // Note: For Google login, the toast will not show here because the page redirects
      // The toast would need to be shown on the callback page
    } catch (err) {
      console.error('Google 登入失敗:', err);
      setError('Google 登入失敗，請稍後再試');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md min-h-[520px] flex flex-col gap-6 justify-between">
        <div>
          <div className="flex justify-center mb-6">
            <button
              type="button"
              className={`px-6 py-2 rounded-t-md text-lg font-semibold focus:outline-none transition border-b-2 ${mode === 'login' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`}
              onClick={() => setMode('login')}
              disabled={mode === 'login'}
            >
              登入
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded-t-md text-lg font-semibold focus:outline-none transition border-b-2 ${mode === 'register' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`}
              onClick={() => setMode('register')}
              disabled={mode === 'register'}
            >
              註冊
            </button>
          </div>
          
        </div>
        <form className="mt-1 flex-1 flex flex-col justify-center gap-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                電子郵件
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm h-12 mt-2 text-black"
                placeholder="請輸入信箱"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm h-12 mt-2 text-black"
                placeholder="請輸入密碼"
              />
              {mode === 'login' ? (
                <div className="text-right mt-2 min-h-[24px]">
                  <a href="/forgot-password" className="text-sm text-gray-500 hover:text-gray-800 underline transition">忘記密碼？</a>
                </div>
              ) : (
                <div className="min-h-[24px]" />
              )}
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {loading ? (mode === 'login' ? "登入中..." : "註冊中...") : (mode === 'login' ? "登入" : "註冊")}
            </button>
          </div>
        </form>
        <div className="mt-2">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
}
