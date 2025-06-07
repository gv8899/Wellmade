import { NextResponse } from "next/server";

// 與 mockProducts 結構一致
const products = [
  {
    id: "38kt",
    name: "38explore 38-kT燈",
    price: 1680,
    description:
      "【商品特色】本商品只有燈，不包含電池、腳架等配件。建議使用18650鋰電池。最高200流明，最低亮度可用48小時。",
    cover: "/sample1.jpg",
    category: "燈具",
    style: "戶外",
  },
  {
    id: "skeleton",
    name: "38explore kT THE SKELETON 透明燈",
    price: 1880,
    description:
      "透明外殼設計，含電池。適合戶外露營氣氛營造。",
    cover: "/sample2.jpg",
    category: "燈具",
    style: "戶外",
  },
  {
    id: "decal",
    name: "38explore-38-kt 燈裝飾貼紙",
    price: 160,
    description: "專屬裝飾貼紙，為你的kT燈增添個性。",
    cover: "/milk.png",
    category: "配件",
    style: "個性",
  },
];

export async function GET() {
  return NextResponse.json(products);
}
