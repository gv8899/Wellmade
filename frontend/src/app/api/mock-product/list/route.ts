import { NextResponse } from "next/server";

// 與 mockProducts 結構一致
const products = [
  {
    id: "38kt",
    name: "38explore 38-kT燈",
    price: 1680,
    description:
      "全新透明設計，更亮，更好看。",
    cover: "/38light_table.jpg",
    category: "燈具",
    style: "戶外",
  },
  {
    id: "skeleton",
    name: "Tokyo craft 不鏽鋼單元桌",
    price: 2180,
    description:
      "透明外殼設計，含電池。適合戶外露營氣氛營造。",
    cover: "/sample2.jpg",
    category: "燈具",
    style: "戶外",
  },
  {
    id: "decal",
    name: "咖啡牛奶杯",
    price: 790,
    description: "專屬裝飾貼紙，為你的kT燈增添個性。",
    cover: "/milk.png",
    category: "配件",
    style: "個性",
  },
];

export async function GET() {
  return NextResponse.json(products);
}
