'use client';

import { useRouter } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-4xl font-bold text-green-500 mb-4">✓</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">訂單已完成</h1>
        <p className="text-gray-500 mb-8">感謝您的購買！我們會盡快處理您的訂單。</p>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/')} 
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            繼續購物
          </button>

          <button
            onClick={() => router.push('/orders')} 
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            查看訂單
          </button>
        </div>
      </div>
    </div>
  );
}
