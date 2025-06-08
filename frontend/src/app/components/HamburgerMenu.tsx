"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉 dropdown
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center justify-center w-9 h-9 rounded focus:outline-none"
        aria-label="會員選單"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-black">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-40 rounded shadow bg-white border border-gray-100 py-2 z-50 animate-fadein">
          <Link href="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">會員登入</Link>
          <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">個人資料</Link>
          <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">訂單查詢</Link>
        </div>
      )}
    </div>
  );
}
