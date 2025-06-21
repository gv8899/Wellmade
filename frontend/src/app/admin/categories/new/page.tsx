"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm";
import { categoryApi, CreateCategoryDto } from "@/services/categories";
import toast from "react-hot-toast";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateCategoryDto) => {
    try {
      setLoading(true);
      await categoryApi.create(data);
      toast.success("分類創建成功");
      router.push("/admin/categories");
    } catch (error: any) {
      console.error("Failed to create category:", error);
      if (error.response?.status === 409) {
        toast.error("Slug已存在，請使用其他名稱");
      } else if (error.response?.status === 404) {
        toast.error("父分類不存在");
      } else {
        toast.error("創建分類失敗");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">新增分類</h2>
        <p className="text-gray-600 mt-1">創建新的產品分類</p>
      </div>

      <CategoryForm
        onSubmit={handleSubmit}
        loading={loading}
        mode="create"
      />
    </div>
  );
}