"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUser } from "./UserContext";
import "./hamburger-anim.css";
export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  // 按下 ESC 關閉 modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const { user, logout } = useUser();

  return (
    <>
      <button
        className="flex items-center justify-center w-9 h-9 rounded focus:outline-none"
        aria-label="會員選單"
        onClick={() => setOpen(true)}
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-black">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {open && (
        <div className="fixed z-[100] left-0 right-0 top-16 h-[calc(100vh-4rem)] bg-black/20 flex items-start justify-center animate-fadein">
          {/* Modal 內容區塊 */}
          <div className="relative bg-white/20 bg-blur w-full max-w-md md:max-w-lg h-[calc(100vh-6rem)] mt-10 mx-auto rounded-3xl shadow-lg p-10 flex flex-col items-center justify-start transition-all duration-300 ease-out transform animate-slideup" style={{paddingTop: '5rem'}}>
            {/* 關閉按鈕 */}
            <button
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-black focus:outline-none"
              aria-label="關閉選單"
              onClick={() => setOpen(false)}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {user ? (
              <>
                <div className="block w-full px-6 py-4 text-lg text-gray-800 font-semibold mb-3 transition text-left cursor-default select-none">
                  {user.name}
                </div>
                <Link href="/orders" className="block w-full px-6 py-4 text-lg text-gray-700 hover:bg-gray-50 rounded mb-3 transition text-left" onClick={() => setOpen(false)}>
                  訂單查詢
                </Link>
                <Link href="/profile" className="block w-full px-6 py-4 text-lg text-gray-700 hover:bg-gray-50 rounded transition text-left" onClick={() => setOpen(false)}>
                  個人資料
                </Link>
                <button
                  className="block w-full px-6 py-4 text-lg text-gray-700 hover:bg-gray-50 rounded mt-6 transition text-left "
                  onClick={() => { logout(); setOpen(false); }}
                >
                  登出
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block w-full px-6 py-4 text-lg text-gray-700 hover:bg-gray-50 rounded mb-3 transition text-left" onClick={() => setOpen(false)}>
                  登入
                </Link>
                <Link href="/orders" className="block w-full px-6 py-4 text-lg text-gray-700 hover:bg-gray-50 rounded mb-3 transition text-left" onClick={() => setOpen(false)}>
                  訂單查詢
                </Link>
                <Link href="/profile" className="block w-full px-6 py-4 text-lg text-gray-700 hover:bg-gray-50 rounded transition text-left" onClick={() => setOpen(false)}>
                  個人資料
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

