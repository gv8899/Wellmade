import React, { useState } from "react";
import RestockNotifySuccessModal from "./RestockNotifySuccessModal";

interface RestockNotifyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string, phone: string) => void;
}

const RestockNotifyModal: React.FC<RestockNotifyModalProps> = ({ open, onClose, onSubmit }) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  let timer: NodeJS.Timeout | null = null;

  if (!open) return null;

  // 成功畫面內容
  const successContent = (
    <div className="flex flex-col items-center justify-center">
      <svg className="w-16 h-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <h3 className="text-2xl font-bold mb-2 text-center text-gray-900">送出成功</h3>
      <p className="text-gray-700 text-base text-center">我們會在商品到貨後第一時間通知您！</p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={e => {
        // 只有點擊遮罩才關閉 modal
        if (e.target === e.currentTarget) {
          if (successOpen) setSuccessOpen(false);
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
          onClick={() => {
            if (successOpen) setSuccessOpen(false);
            onClose();
          }}
          aria-label="關閉"
        >
          ×
        </button>
        {successOpen ? (
          successContent
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-900">貨到通知</h3>
            <p className="text-gray-600 text-base mb-6 text-center">
              請留下 Email 與手機，<br />貨到時我們會通知您！
            </p>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
                  setError("請輸入有效的 Email");
                  return;
                }
                if (!phone || !/^09\d{8}$/.test(phone)) {
                  setError("請輸入正確的手機號碼");
                  return;
                }
                setError("");
                setSuccessOpen(true);
                onSubmit(email, phone);
              }}
            >
              <div className="mb-1 text-gray-700 text-base font-medium">Email</div>
              <input
                type="email"
                className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-lg placeholder-gray-600 text-black"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <div className="mb-1 text-gray-700 text-base font-medium">手機</div>
              <input
                type="tel"
                className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-lg placeholder-gray-600 text-black"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                pattern="09[0-9]{8}"
              />
              {error && <div className="text-red-500 text-sm mb-2 text-center">{error}</div>}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-black text-white font-bold text-lg mt-2 hover:bg-gray-800 transition"
              >
                送出
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RestockNotifyModal;
