"use client";
import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // TODO: Replace with real API call
    await new Promise((res) => setTimeout(res, 800));
    if (email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setSubmitted(true);
    } else {
      setError("請輸入有效的電子郵件");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-md">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">忘記密碼</h2>
          <p className="mt-2 text-center text-gray-500 text-base">
  請輸入註冊時的電子郵件，<br />
  我們會寄送密碼重設連結給你。
</p>
        </div>
        {submitted ? (
          <div className="text-center text-green-600 text-base font-medium py-8">
            已寄送密碼重設信件，請至信箱收信並依照指示完成密碼重設。
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm h-12 mt-2"
                placeholder="請輸入信箱"
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                {loading ? "寄送中..." : "寄送重設連結"}
              </button>
            </div>
          </form>
        )}
        <div className="text-center mt-8">
          <a href="/login" className="text-gray-500 hover:text-gray-800 underline text-sm transition">返回登入</a>
        </div>
      </div>
    </div>
  );
}
