"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brand, Product, KeyFeature, FeatureDetail, FAQ, Category, ProductStatus, adminApi } from "@/services/admin";
import { ProductVariant } from "@/types/product";
import ImageUploader from "./ImageUploader";
import KeyFeaturesEditor from "./KeyFeaturesEditor";
import FeatureDetailsEditor from "./FeatureDetailsEditor";
import FAQEditor from "./FAQEditor";
import ProductVariantEditor from "./ProductVariantEditor";
import { FaSave, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  brandId?: string;
  imageUrl?: string;
  images?: string[];
  keyFeatures?: KeyFeature[];
  featureDetails?: FeatureDetail[];
  faqs?: FAQ[];
  variants?: ProductVariant[];
  isActive: boolean;
  status: ProductStatus;
}

interface ProductFormProps {
  product?: Product;
  brands: Brand[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  loading: boolean;
  mode: "create" | "edit";
}

export default function ProductForm({ 
  product, 
  brands, 
  onSubmit, 
  loading, 
  mode 
}: ProductFormProps) {
  const router = useRouter();
  
  // 基本資訊
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price || 0);
  const [stock, setStock] = useState(product?.stock || 0);
  const [categoryId, setCategoryId] = useState(product?.categoryId || product?.category || ""); // 支援向後相容
  const [brandId, setBrandId] = useState(product?.brandId || "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [status, setStatus] = useState<ProductStatus>(product?.status || ProductStatus.IN_STOCK);
  
  // 分類資料
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // 圖片
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [images, setImages] = useState<string[]>(product?.images || []);
  
  // 進階內容
  const [keyFeatures, setKeyFeatures] = useState<KeyFeature[]>(product?.keyFeatures || []);
  const [featureDetails, setFeatureDetails] = useState<FeatureDetail[]>(product?.featureDetails || []);
  const [faqs, setFaqs] = useState<FAQ[]>(product?.faqs || []);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // 加載分類資料
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await adminApi.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('加載分類失敗:', error);
        toast.error('加載分類失敗');
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // 加載現有產品的變體資料（編輯模式）
  useEffect(() => {
    const loadVariants = async () => {
      if (product?.id && mode === "edit") {
        try {
          const variantData = await adminApi.getProductVariants(product.id);
          setVariants(variantData);
        } catch (error) {
          console.error('加載變體失敗:', error);
          // 不顯示錯誤訊息，因為可能沒有變體
        }
      }
    };
    loadVariants();
  }, [product?.id, mode]);

  // 產品狀態選項
  const statusOptions = [
    { value: ProductStatus.IN_STOCK, label: '現貨', color: 'text-green-600' },
    { value: ProductStatus.PREORDER, label: '預購', color: 'text-blue-600' },
    { value: ProductStatus.OUT_OF_STOCK, label: '缺貨', color: 'text-red-600' },
    { value: ProductStatus.DISCONTINUED, label: '已停產', color: 'text-gray-600' },
  ];

  // 遞迴展示分類樹狀結構
  const renderCategoryOptions = (categories: Category[], level = 0): JSX.Element[] => {
    return categories.reduce((acc: JSX.Element[], category) => {
      if (!category.isActive) return acc;
      
      const prefix = '\u00a0'.repeat(level * 4); // 縮排
      acc.push(
        <option key={category.id} value={category.id}>
          {prefix}{category.name}
        </option>
      );
      
      if (category.children && category.children.length > 0) {
        acc.push(...renderCategoryOptions(category.children, level + 1));
      }
      
      return acc;
    }, []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("請輸入產品名稱");
      return;
    }
    
    if (!categoryId) {
      toast.error("請選擇產品分類");
      return;
    }
    
    if (price <= 0) {
      toast.error("請輸入有效的價格");
      return;
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stock: Number(stock),
      categoryId,
      brandId: brandId || undefined,
      imageUrl: imageUrl || undefined,
      images: images.length > 0 ? images : undefined,
      keyFeatures: keyFeatures.length > 0 ? keyFeatures : undefined,
      featureDetails: featureDetails.length > 0 ? featureDetails : undefined,
      faqs: faqs.length > 0 ? faqs : undefined,
      // 目前先不傳送變體資料，因為後端還未完全支援
      // variants: variants.length > 0 ? variants : undefined,
      isActive,
      status,
    };

    await onSubmit(productData);
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 基本資訊 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">基本資訊</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              產品名稱 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
              placeholder="請輸入產品名稱"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分類 *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
              required
              disabled={loadingCategories}
            >
              <option value="">
                {loadingCategories ? "加載中..." : "請選擇分類"}
              </option>
              {!loadingCategories && renderCategoryOptions(categories)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              價格 (TWD) *
            </label>
            <input
              type="text"
              value={price || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '');
                setPrice(value ? Number(value) : 0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="請輸入價格"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              庫存數量
            </label>
            <input
              type="text"
              value={stock || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setStock(value ? Number(value) : 0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="請輸入數量"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              品牌
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
            >
              <option value="">請選擇品牌</option>
              {brands.filter(brand => brand.isActive).map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              產品狀態 *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
              required
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">產品啟用</span>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            產品描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            placeholder="請輸入產品描述"
          />
        </div>
      </div>

      {/* 圖片上傳 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">產品圖片</h3>
        <ImageUploader
          mainImage={imageUrl}
          additionalImages={images}
          onMainImageChange={setImageUrl}
          onAdditionalImagesChange={setImages}
        />
      </div>

      {/* 關鍵特色 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">關鍵特色</h3>
        <KeyFeaturesEditor
          features={keyFeatures}
          onChange={setKeyFeatures}
        />
      </div>

      {/* 功能詳細說明 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">功能詳細說明</h3>
        <FeatureDetailsEditor
          featureDetails={featureDetails}
          onChange={setFeatureDetails}
        />
      </div>

      {/* 常見問答 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">常見問答</h3>
        <FAQEditor
          faqs={faqs}
          onChange={setFaqs}
        />
      </div>

      {/* 產品變體 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">產品變體</h3>
        <p className="text-sm text-gray-600 mb-4">
          如果產品有不同的規格、顏色或尺寸，可以在此設定產品變體。每個變體都可以有獨立的價格、庫存和規格。
        </p>
        <ProductVariantEditor
          variants={variants}
          onChange={setVariants}
          productId={product?.id}
        />
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
          {loading ? "儲存中..." : mode === "create" ? "創建產品" : "更新產品"}
        </button>
      </div>
    </form>
  );
}