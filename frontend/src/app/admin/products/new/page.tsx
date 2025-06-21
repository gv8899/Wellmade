"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminApi, Brand } from "@/services/admin";
import ProductForm from "@/components/admin/ProductForm";
import toast from "react-hot-toast";

export default function NewProductPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandsData = await adminApi.getAllBrands();
        setBrands(brandsData);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
        toast.error("載入品牌失敗");
      }
    };

    fetchBrands();
  }, []);

  const handleSubmit = async (productData: any) => {
    try {
      setLoading(true);
      await adminApi.createProduct(productData);
      toast.success("產品創建成功");
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error("創建產品失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">新增產品</h2>
        <p className="text-gray-600 mt-1">創建新的產品資訊</p>
      </div>

      <ProductForm
        brands={brands}
        onSubmit={handleSubmit}
        loading={loading}
        mode="create"
      />
    </div>
  );
}