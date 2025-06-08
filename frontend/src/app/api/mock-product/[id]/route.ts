import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  return NextResponse.json({
    id,
    name: "38explore 38-kT燈",
    description: `透明設計，更亮，更好看。`,
    price: 1680,
    media: [
      { type: "image", src: "/sample1.jpg", alt: "38explore 38-kT燈 實拍1" },
      { type: "image", src: "/sample2.jpg", alt: "38explore 38-kT燈 實拍2" },
      { type: "video", src: "/sample.mp4", alt: "38explore 38-kT燈 展示影片" }
    ]
  });
}
