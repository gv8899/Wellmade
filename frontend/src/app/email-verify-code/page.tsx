"use client";
import React, { useState } from "react";

export default function EmailVerifyCodePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // TODO: 串接後端驗證 API
    await new Promise((res) => setTimeout(res, 1000));
    if (code === "123456") {
      setSuccess(true);
    } else {
      setError("驗證碼錯誤，請重新輸入");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">輸入驗證碼</h2>
        <p className="text-gray-500 text-base mb-6">請輸入寄到您信箱的 6 位數驗證碼</p>
        {success ? (
          <div className="text-green-600 text-lg font-medium mb-2">驗證成功！</div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="mb-6">
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                required
                value={code}
                onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                className="appearance-none rounded-md relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm h-12 mt-2 tracking-widest text-center text-lg"
                placeholder=""
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {loading ? "驗證中..." : "送出驗證"}
            </button>
          </form>
        )}
        <div className="text-center mt-8">
          <a href="/login" className="text-gray-500 hover:text-gray-800 underline text-sm transition">返回登入</a>
        </div>
      </div>
    </div>
  );
}
