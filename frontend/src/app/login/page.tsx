"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/components/UserContext";

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
    // TODO: Replace with real API call
    await new Promise((res) => setTimeout(res, 800));
    if (mode === 'login') {
      if (form.email === "demo@example.com" && form.password === "demo123") {
        login({ name: "王小明", email: form.email });
        router.push("/");
      } else {
        setError("帳號或密碼錯誤");
      }
    } else {
      // 註冊模式下，簡單檢查 email 是否已存在
      if (form.email === "demo@example.com") {
        setError("此信箱已註冊，請直接登入");
      } else {
        login({ name: "新會員", email: form.email });
        router.push("/");
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    // TODO: Replace with real Google OAuth
    window.alert("Google 登入尚未串接，請整合 NextAuth 或 Google API");
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
              {loading ? "登入中..." : "登入"}
            </button>
          </div>
        </form>
        <div className="mt-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 font-medium shadow-sm transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.29 1.53 7.73 2.81l5.69-5.54C33.62 3.66 29.31 1.5 24 1.5 14.97 1.5 7.09 7.58 3.68 15.09l6.63 5.14C12.09 14.46 17.55 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.21-.43-4.73H24v9.23h12.44c-.54 2.88-2.18 5.32-4.64 6.98l7.13 5.57C43.73 37.64 46.1 31.6 46.1 24.5z"/><path fill="#FBBC05" d="M10.31 28.23a14.5 14.5 0 0 1 0-8.46l-6.63-5.14A23.98 23.98 0 0 0 0 24c0 3.93.94 7.65 2.61 10.91l7.7-6.68z"/><path fill="#EA4335" d="M24 46.5c6.48 0 11.93-2.13 15.9-5.81l-7.13-5.57c-2.01 1.35-4.61 2.16-8.77 2.16-6.45 0-11.91-4.96-13.69-11.58l-7.7 6.68C7.09 40.42 14.97 46.5 24 46.5z"/></g></svg>
            使用 Google 帳號登入
          </button>
        </div>
      </div>
    </div>
  );
}
