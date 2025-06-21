"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminApi, Brand, Product } from "@/services/admin";
import ProductForm from "@/components/admin/ProductForm";
import toast from "react-hot-toast";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        
        // 同時載入產品和品牌資料
        const [productData, brandsData] = await Promise.all([
          adminApi.getProductById(productId),
          adminApi.getAllBrands()
        ]);
        
        setProduct(productData);
        setBrands(brandsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("載入資料失敗");
        router.push("/admin/products");
      } finally {
        setInitialLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId, router]);

  const handleSubmit = async (productData: any) => {
    try {
      setLoading(true);
      console.log("更新產品資料:", productData);
      await adminApi.updateProduct(productId, productData);
      toast.success("產品更新成功");
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      console.error("錯誤詳情:", error.response?.data);
      toast.error(`更新產品失敗: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">產品不存在</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">編輯產品</h2>
        <p className="text-gray-600 mt-1">修改產品 "{product.name}" 的資訊</p>
      </div>

      <ProductForm
        product={product}
        brands={brands}
        onSubmit={handleSubmit}
        loading={loading}
        mode="edit"
      />
    </div>
  );
}