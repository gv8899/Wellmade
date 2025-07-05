"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Category, CreateCategoryDto, UpdateCategoryDto, categoryApi } from "@/services/categories";
import { FaSave, FaTimes, FaImage } from "react-icons/fa";
import toast from "react-hot-toast";
import ImageUpload from "./ImageUpload";

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
  loading: boolean;
  mode: "create" | "edit";
}

export default function CategoryForm({ 
  category, 
  onSubmit, 
  loading, 
  mode 
}: CategoryFormProps) {
  const router = useRouter();
  
  // 表單狀態
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [imageUrl, setImageUrl] = useState(category?.imageUrl || "");
  const [parentId, setParentId] = useState(category?.parentId || "");
  const [sortOrder, setSortOrder] = useState(category?.sortOrder || 0);
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [metaTitle, setMetaTitle] = useState(category?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(category?.metaDescription || "");
  
  // 父分類選項
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);
  
  // 載入父分類選項
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        setLoadingParents(true);
        const tree = await categoryApi.getTree();
        // 如果是編輯模式，需要過濾掉自己和自己的子分類
        if (mode === "edit" && category) {
          const filteredCategories = filterSelfAndChildren(tree, category.id);
          setParentCategories(flattenCategories(filteredCategories));
        } else {
          setParentCategories(flattenCategories(tree));
        }
      } catch (error) {
        console.error("Failed to fetch parent categories:", error);
        toast.error("載入父分類失敗");
      } finally {
        setLoadingParents(false);
      }
    };

    fetchParentCategories();
  }, [mode, category]);

  // 過濾掉自己和自己的子分類
  const filterSelfAndChildren = (categories: Category[], excludeId: string): Category[] => {
    return categories.filter(cat => {
      if (cat.id === excludeId) return false;
      if (cat.children) {
        cat.children = filterSelfAndChildren(cat.children, excludeId);
      }
      return true;
    });
  };

  // 將樹狀結構平鋪為列表
  const flattenCategories = (categories: Category[], level = 0): (Category & { level: number })[] => {
    let result: (Category & { level: number })[] = [];
    
    for (const category of categories) {
      result.push({ ...category, level });
      if (category.children && category.children.length > 0) {
        result = result.concat(flattenCategories(category.children, level + 1));
      }
    }
    
    return result;
  };

  // 根據名稱自動生成slug
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-') // 允許中文字符
      .replace(/^-+|-+$/g, '');
  };

  // 名稱變更時自動更新slug（只在創建模式下）
  const handleNameChange = (value: string) => {
    setName(value);
    if (mode === "create" || !category?.slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("請輸入分類名稱");
      return;
    }
    
    if (!slug.trim()) {
      toast.error("請輸入URL slug");
      return;
    }

    const formData = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      parentId: parentId || undefined,
      sortOrder: Number(sortOrder),
      isActive,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
    };

    await onSubmit(formData);
  };

  const handleCancel = () => {
    router.push("/admin/categories");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 基本資訊 */}
      <div className="bg-white rounded-lg p-6" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">基本資訊</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分類名稱 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
              placeholder="請輸入分類名稱"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
              placeholder="url-slug"
              required
            />
            <p className="text-xs text-gray-500 mt-1">用於URL，建議使用英文和連字符</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              父分類
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              disabled={loadingParents}
            >
              <option value="">無（頂層分類）</option>
              {parentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {'─'.repeat(cat.level)} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              排序順序
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
              placeholder="0"
              min="0"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">分類啟用</span>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分類描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            placeholder="請輸入分類描述"
          />
        </div>
      </div>

      {/* 圖片設定 */}
      <div className="bg-white rounded-lg p-6" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaImage className="w-5 h-5" />
          分類圖片
        </h3>
        
        <div className="space-y-6">
          {/* 圖片上傳 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上傳圖片
            </label>
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              onClear={() => setImageUrl('')}
            />
          </div>

          {/* 手動輸入 URL（備用選項） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              或手動輸入圖片 URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          {/* 圖片預覽 */}
          {imageUrl && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">圖片預覽：</p>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <img
                  src={imageUrl}
                  alt="分類圖片預覽"
                  className="w-48 h-32 object-cover rounded-lg border mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NSA3NEw3NSA2NEw2NSA3NEw3NSA4NEw4NSA3NFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggM0M5LjU5IDMgMTEuMDMgNC4yMSAxMS4wMyA1LjgzUzEwLjc5IDguNjcgOSA4LjY3UzYuOTcgNy40NiA2Ljk3IDUuODNTNy40MSAzIDggM1pNOCA1QzcuNDQgNSA3IDUuNDUgNyA2UzcuNDQgNyA4IDdTOSA2LjU1IDkgNlM4LjU2IDUgOCA1Wk04IDlDNS43OCA5IDQgMTAuNzkgNCAxM0gxMkMxMiAxMC43OSAxMC4yMiA5IDggOVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4KPC9zdmc+';
                  }}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  建議尺寸：400x300 像素，支援 JPEG、PNG、WebP 格式
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEO設定 */}
      <div className="bg-white rounded-lg p-6" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO設定</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta標題
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
              placeholder="SEO標題（建議60字以內）"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">{metaTitle.length}/60 字</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta描述
            </label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="SEO描述（建議160字以內）"
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">{metaDescription.length}/160 字</p>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <FaTimes className="w-4 h-4" />
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSave className="w-4 h-4" />
          {loading ? "儲存中..." : mode === "create" ? "創建分類" : "更新分類"}
        </button>
      </div>
    </form>
  );
}