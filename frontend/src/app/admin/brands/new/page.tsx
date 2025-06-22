"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/services/admin";
import BrandForm, { BrandFormData } from "@/components/admin/BrandForm";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";

export default function NewBrandPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: BrandFormData) => {
    setIsLoading(true);
    try {
      await adminApi.createBrand(data);
      toast.success("品牌建立成功！");
      router.push("/admin/brands");
    } catch (error) {
      console.error("Failed to create brand:", error);
      toast.error("建立品牌失敗，請重試");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/brands");
  };

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
            <h2 className="text-3xl font-bold text-gray-900">新增品牌</h2>
            <p className="text-gray-600 mt-1">建立新的品牌資訊</p>
          </div>
        </div>
      </div>

      {/* 表單容器 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <BrandForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          submitButtonText="建立品牌"
        />
      </div>
    </div>
  );
}