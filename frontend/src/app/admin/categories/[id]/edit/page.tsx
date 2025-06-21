"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm";
import { categoryApi, Category, UpdateCategoryDto } from "@/services/categories";
import toast from "react-hot-toast";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // 載入分類資料
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setPageLoading(true);
        const categoryData = await categoryApi.getOne(categoryId);
        setCategory(categoryData);
      } catch (error) {
        console.error("Failed to fetch category:", error);
        toast.error("載入分類失敗");
        router.push("/admin/categories");
      } finally {
        setPageLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId, router]);

  const handleSubmit = async (data: UpdateCategoryDto) => {
    try {
      setLoading(true);
      await categoryApi.update(categoryId, data);
      toast.success("分類更新成功");
      router.push("/admin/categories");
    } catch (error: any) {
      console.error("Failed to update category:", error);
      if (error.response?.status === 409) {
        toast.error("Slug已存在，請使用其他名稱");
      } else if (error.response?.status === 404) {
        toast.error("分類或父分類不存在");
      } else if (error.response?.status === 400) {
        toast.error("不能設定自己為父分類");
      } else {
        toast.error("更新分類失敗");
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">分類不存在</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">編輯分類</h2>
        <p className="text-gray-600 mt-1">編輯分類 "{category.name}" 的資訊</p>
      </div>

      <CategoryForm
        category={category}
        onSubmit={handleSubmit}
        loading={loading}
        mode="edit"
      />
    </div>
  );
}