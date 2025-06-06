"use client";
import React from "react";
import { useSearchParams } from "next/navigation";

export default function EmailVerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  // TODO: 實際專案可根據 token 呼叫 API 驗證
  // 這裡先做靜態 UI 樣板

  // 模擬驗證狀態
  const [status, setStatus] = React.useState<"verifying"|"success"|"error">("verifying");
  React.useEffect(() => {
    if (!token) {
      setStatus("error");
    } else {
      setTimeout(() => setStatus("success"), 1200);
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Email 驗證</h2>
        {status === "verifying" && (
          <div className="text-gray-600 text-base">驗證中，請稍候...</div>
        )}
        {status === "success" && (
          <>
            <div className="text-green-600 text-lg font-medium mb-2">驗證成功！</div>
            <div className="text-gray-500 text-base mb-4">你的信箱已完成驗證，現在可以登入。</div>
            <a href="/login" className="inline-block px-6 py-2 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-700 transition">前往登入</a>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-red-500 text-lg font-medium mb-2">驗證失敗</div>
            <div className="text-gray-500 text-base mb-4">驗證連結無效或已過期，請重新申請驗證。</div>
            <a href="/register" className="inline-block px-6 py-2 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-700 transition">前往註冊</a>
          </>
        )}
      </div>
    </div>
  );
}
