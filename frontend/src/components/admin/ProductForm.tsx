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
import { FaSave, FaTimes, FaPlus } from "react-icons/fa";
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

  // 調試用：記錄產品資料
  console.log('ProductForm - Product data:', {
    product,
    categoryId: product?.categoryId,
    categoryRelation: product?.categoryRelation,
    mode
  });
  
  // 基本資訊
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price || 0);
  const [stock, setStock] = useState(product?.stock || 0);
  const [categoryId, setCategoryId] = useState(
    product?.categoryId || (product?.categoryRelation?.id) || ""
  ); // 優先使用 categoryId，回退到 categoryRelation.id
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
  const [specTemplate, setSpecTemplate] = useState<string[]>(product?.specTemplate || []);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // 加載分類資料
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('ProductForm - 開始載入分類資料...');
        const data = await adminApi.getAllCategories();
        console.log('ProductForm - 分類資料載入成功:', data?.length || 0, '個分類');
        setCategories(data || []);
      } catch (error: any) {
        console.error('ProductForm - 載入分類失敗:', error);
        const errorMessage = error?.response?.data?.message || error?.message || '載入分類失敗';
        toast.error(errorMessage);
        setCategories([]); // 設置為空陣列避免未定義錯誤
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // 當產品資料變化時更新狀態
  useEffect(() => {
    if (product) {
      console.log('ProductForm - Product changed, updating states:', {
        newCategoryId: product.categoryId,
        newCategoryRelation: product.categoryRelation,
        currentCategoryId: categoryId
      });
      
      // 更新所有狀態以反映新的產品資料
      setName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price || 0);
      setStock(product.stock || 0);
      setCategoryId(product.categoryId || product.categoryRelation?.id || "");
      setBrandId(product.brandId || "");
      setIsActive(product.isActive ?? true);
      setStatus(product.status || ProductStatus.IN_STOCK);
      setImageUrl(product.imageUrl || "");
      setImages(product.images || []);
      setKeyFeatures(product.keyFeatures || []);
      setFeatureDetails(product.featureDetails || []);
      setFaqs(product.faqs || []);
      setSpecTemplate(product.specTemplate || []);
      
      // 🔧 修復：不要清空變體狀態，避免與變體加載競爭
      // setVariants([]) ← 移除此行，保持現有變體狀態
    }
  }, [product]); // 移除 categoryId 依賴以避免無限循環

  // 加載現有產品的變體資料（編輯模式）
  useEffect(() => {
    const loadVariants = async () => {
      if (product?.id && mode === "edit") {
        try {
          console.log('🔄 ProductForm - 開始加載變體資料，產品ID:', product.id);
          const variantData = await adminApi.getProductVariants(product.id);
          console.log('✅ ProductForm - 變體資料加載成功:', variantData.length, '個變體');
          
          // 🔧 修復：只有在沒有變體或變體數量不同時才更新狀態
          if (variants.length === 0 || variants.length !== variantData.length) {
            setVariants(variantData);
            console.log('📝 ProductForm - 變體狀態已更新');
          } else {
            console.log('ℹ️ ProductForm - 變體狀態無需更新（數量相同且已存在）');
          }
        } catch (error) {
          console.error('❌ ProductForm - 加載變體失敗:', error);
          // 只有在完全沒有變體時才清空（避免清除用戶剛添加的變體）
          if (variants.length === 0) {
            console.log('🔄 ProductForm - 設定空變體陣列（首次加載失敗）');
            setVariants([]);
          }
        }
      } else if (mode === "create") {
        // 創建模式下確保變體陣列為空
        console.log('🆕 ProductForm - 創建模式，初始化空變體陣列');
        setVariants([]);
      }
    };
    loadVariants();
  }, [product?.id, mode]); // 移除 variants 依賴避免無限循環

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
    
    if (!categoryId || categoryId.trim() === "") {
      toast.error("請選擇產品分類");
      console.error('ProductForm - categoryId validation failed:', { categoryId, categories: categories.length });
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
      specTemplate: specTemplate.length > 0 ? specTemplate : undefined,
      isActive,
      status,
      // 🔧 修復：編輯模式下不傳遞變體資訊給產品更新 API，變體單獨處理
      ...(mode === "create" ? {
        // 創建模式：包含變體資訊
        variants: variants.map(variant => {
          const { id, productId, createdAt, updatedAt, ...cleanVariant } = variant;
          
          // 確保必要欄位存在且格式正確
          return {
            ...cleanVariant,
            specs: cleanVariant.specs && Object.keys(cleanVariant.specs).length > 0 
              ? cleanVariant.specs 
              : { "規格": "標準" }, // 預設規格避免空物件
            price: Number(cleanVariant.price), // 確保是數字
            stock: Number(cleanVariant.stock), // 確保是數字
            sortOrder: cleanVariant.sortOrder || 0, // 預設排序
            isActive: cleanVariant.isActive !== undefined ? cleanVariant.isActive : true, // 預設啟用
            status: cleanVariant.status || 'IN_STOCK', // 預設狀態
            inventoryType: cleanVariant.inventoryType || 'PHYSICAL', // 預設庫存類型
            preorderSold: cleanVariant.preorderSold || 0, // 預設預購數量
          };
        }),
        autoGenerateMasterSku: variants.length === 0, // 沒有變體時自動生成主 SKU
      } : {
        // 編輯模式：不包含變體資訊，變體透過專門的 API 處理
      })
    };

    console.log('ProductForm - Submitting product data:', {
      productData,
      originalProduct: product,
      mode
    });

    try {
      // 提交產品資料（包含變體資訊）
      console.log('🚀 ProductForm - 開始提交產品資料:', productData);
      const submittedProduct = await onSubmit(productData);
      console.log('✅ ProductForm - 產品資料提交成功:', submittedProduct);
      
      // 在編輯模式下，變體已經在 ProductVariantEditor 中即時保存
      // 只有在創建模式下才需要在這裡處理
      if (mode === "create") {
        console.log('✅ ProductForm - 創建模式：變體已在產品創建時一併處理');
      }
      
      console.log('🎉 ProductForm - 所有操作完成');
    } catch (error) {
      console.error('❌ ProductForm - 產品提交失敗:', error);
      // 產品提交失敗時不處理變體
      throw error;
    }
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

      {/* 產品規格模板 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">產品規格模板</h3>
        <p className="text-sm text-gray-600 mb-4">
          定義此產品的規格項目（如：顏色、尺寸、材質等）。這些規格將用於產品變體。
        </p>
        
        <div className="space-y-3">
          {specTemplate.map((spec, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={spec}
                onChange={(e) => {
                  const newSpecTemplate = [...specTemplate];
                  newSpecTemplate[index] = e.target.value;
                  setSpecTemplate(newSpecTemplate);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="規格名稱（如：顏色）"
              />
              <button
                type="button"
                onClick={() => {
                  const newSpecTemplate = specTemplate.filter((_, i) => i !== index);
                  setSpecTemplate(newSpecTemplate);
                }}
                className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => setSpecTemplate([...specTemplate, ""])}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            新增規格項目
          </button>
        </div>
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
          mode={mode}
          specTemplate={specTemplate}
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