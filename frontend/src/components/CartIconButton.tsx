"use client";
import Link from "next/link";

export default function CartIconButton() {
  return (
    <Link href="/cart" className="absolute top-4 right-4 z-20">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow hover:bg-gray-100 transition">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </span>
    </Link>
  );
}
