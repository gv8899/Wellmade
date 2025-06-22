"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminApi, Brand } from "@/services/admin";
import BrandForm, { BrandFormData } from "@/components/admin/BrandForm";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = params.id as string;
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBrand = useCallback(async () => {
    try {
      setLoading(true);
      // 由於沒有單獨的 getBrand API，我們從列表中找到對應的品牌
      const brands = await adminApi.getAllBrands();
      const foundBrand = brands.find(b => b.id === brandId);
      
      if (foundBrand) {
        setBrand(foundBrand);
      } else {
        toast.error("找不到指定的品牌");
        router.push("/admin/brands");
      }
    } catch (error) {
      console.error("Failed to fetch brand:", error);
      toast.error("載入品牌資料失敗");
      router.push("/admin/brands");
    } finally {
      setLoading(false);
    }
  }, [brandId, router]);

  useEffect(() => {
    fetchBrand();
  }, [fetchBrand]);

  const handleSubmit = async (data: BrandFormData) => {
    setIsSubmitting(true);
    try {
      await adminApi.updateBrand(brandId, data);
      toast.success("品牌更新成功！");
      router.push("/admin/brands");
    } catch (error) {
      console.error("Failed to update brand:", error);
      toast.error("更新品牌失敗，請重試");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/brands");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">品牌不存在</p>
      </div>
    );
  }

  return (
    <div>
      {/* 頁面標題 */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">編輯品牌</h2>
            <p className="text-gray-600 mt-1">修改 &quot;{brand.name}&quot; 的資訊</p>
          </div>
        </div>
      </div>

      {/* 表單容器 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <BrandForm
          initialData={brand}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          submitButtonText="更新品牌"
        />
      </div>
    </div>
  );
}