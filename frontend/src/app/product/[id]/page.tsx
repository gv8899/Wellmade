import ProductDetailClient from "./ProductDetailClient";

interface ProductDetailPageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return <ProductDetailClient id={params.id} />;
}
