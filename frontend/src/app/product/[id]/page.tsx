import ProductDetailClient from "./ProductDetailClient";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-white">
      <ProductDetailClient id={id} />
    </div>
  );
}
