import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  return NextResponse.json({
    id,
    name: "38explore 38-kT燈",
    description: `【商品特色】\n本商品只有燈，不包含電池、腳架等配件。\n可於上方加購裝飾貼紙，營造出不同氛圍。\n建議使用充電電池：18650鋰離子電池。\n最高200流明，可連續使用9小時，最低亮度可達48小時。\n\n【商品規格】\n尺寸：高10.2 cm，直徑4.2 cm\n重量：60g\n防水功能：防潑水（勿浸泡水裡）\n充電方式：Type-C（不支援快充）\n指示燈：充電顯示藍燈/橘燈，充飽顯示綠燈\n注意事項：充電時不能用雙頭type-c快充線，需用typeA to typeC線搭配5A以下充電頭。`,
    price: 1680,
    media: [
      { type: "image", src: "/sample1.jpg", alt: "38explore 38-kT燈 實拍1" },
      { type: "image", src: "/sample2.jpg", alt: "38explore 38-kT燈 實拍2" },
      { type: "video", src: "/sample.mp4", alt: "38explore 38-kT燈 展示影片" }
    ]
  });
}
