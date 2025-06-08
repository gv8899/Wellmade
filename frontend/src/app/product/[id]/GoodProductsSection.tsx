import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  cover: string;
}

const GoodProductsSection: React.FC<{ excludeId?: string }> = ({ excludeId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch("/api/mock-product/list")
      .then(res => {
        if (!res.ok) throw new Error("API 錯誤");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(excludeId ? data.filter((p: Product) => p.id !== excludeId) : data);
        } else {
          setError("API 回傳格式錯誤");
        }
      })
      .catch(() => setError("推薦商品載入失敗，請稍後再試。"))
      .finally(() => setLoading(false));
  }, [excludeId]);

  return (
    <section className="w-full bg-white py-16 px-4 md:px-0">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 text-center tracking-tight">好物推薦</h2>
        {loading && <div className="text-center text-gray-400 py-8 text-lg">載入中...</div>}
        {error && !loading && <div className="text-center text-red-500 py-8 text-lg">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="block group rounded-2xl shadow-sm bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
                style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.05)' }}
              >
                <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center">
                  <Image
                    src={p.cover}
                    alt={p.name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="transition group-hover:scale-105 duration-300"
                  />
                </div>
                <div className="p-6 flex flex-col gap-2 items-center">
                  <div className="font-bold text-lg text-gray-900 line-clamp-1 text-center">{p.name}</div>
                  <div className="font-bold text-xl text-gray-900 text-center">${p.price}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GoodProductsSection;
