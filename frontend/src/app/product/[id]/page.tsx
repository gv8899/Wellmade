import ProductDetailClient from "./ProductDetailClient";

interface ProductDetailPageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  // params.id 是一個字符串，不需要 await
  const id = params.id;
  
  return (
    <div className="min-h-screen bg-white">
      <ProductDetailClient id={id} />
    </div>
  );
}
