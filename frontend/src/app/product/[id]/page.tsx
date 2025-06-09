import ProductDetailClient from "./ProductDetailClient";

interface ProductDetailPageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // 使用 await 確保 params.id 已經解析完成
  const id = await params.id;
  
  return (
    <div className="min-h-screen bg-white">
      <ProductDetailClient id={id} />
    </div>
  );
}
