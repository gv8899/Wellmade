import React from "react";

interface RestockNotifySuccessModalProps {
  open: boolean;
  onClose: () => void;
}

const RestockNotifySuccessModal: React.FC<RestockNotifySuccessModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 relative flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="關閉"
        >
          ×
        </button>
        <svg className="w-16 h-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-2xl font-bold mb-2 text-center text-gray-900">送出成功</h3>
        <p className="text-gray-700 text-base text-center">我們會在商品到貨後第一時間通知您！</p>
      </div>
    </div>
  );
};

export default RestockNotifySuccessModal;
