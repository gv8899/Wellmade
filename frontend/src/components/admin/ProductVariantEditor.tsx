"use client";
import { useState, useEffect } from "react";
import { ProductVariant, ProductStatus, InventoryType } from "@/types/product";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaArrowUp, FaArrowDown, FaSync } from "react-icons/fa";
import toast from "react-hot-toast";
import VariantImageUploader from "./VariantImageUploader";
import { adminApi } from "@/services/admin";

interface ProductVariantEditorProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  productId?: string;
  mode?: 'create' | 'edit';
  specTemplate?: string[]; // 從產品層級傳入的規格模板
}

interface VariantFormData {
  id?: string;
  sku: string;
  variantTitle: string;
  specs: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  stock: number;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  weight?: number;
  barcode?: string;
  status: ProductStatus;
  inventoryType: InventoryType;
  preorderLimit?: number;
  preorderSold: number;
  preorderStartTime?: string;
  preorderEndTime?: string;
  expectedShipDate?: string;
  preorderPrice?: number;
  preorderDescription?: string;
}

const defaultVariant: VariantFormData = {
  sku: "",
  variantTitle: "",
  specs: {},
  price: 0,
  stock: 0,
  sortOrder: 0,
  isActive: true,
  status: ProductStatus.IN_STOCK,
  inventoryType: InventoryType.PHYSICAL,
  preorderSold: 0,
  autoGenerateSku: true,
};

export default function ProductVariantEditor({
  variants,
  onChange,
  productId,
  mode = 'create',
  specTemplate = [],
}: ProductVariantEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<VariantFormData>(defaultVariant);
  const [isSaving, setIsSaving] = useState(false);

  // 使用產品層級的規格模板作為規格鍵
  const specKeys = specTemplate.filter(spec => spec.trim() !== '');


  const statusOptions = [
    { value: ProductStatus.IN_STOCK, label: '現貨', color: 'text-green-600' },
    { value: ProductStatus.PREORDER, label: '預購', color: 'text-blue-600' },
    { value: ProductStatus.OUT_OF_STOCK, label: '缺貨', color: 'text-red-600' },
    { value: ProductStatus.DISCONTINUED, label: '已停產', color: 'text-gray-600' },
  ];

  const inventoryTypeOptions = [
    { value: InventoryType.PHYSICAL, label: '實體庫存' },
    { value: InventoryType.PREORDER_LIMITED, label: '預購限量' },
    { value: InventoryType.PREORDER_UNLIMITED, label: '預購無限' },
  ];

  const handleAddVariant = () => {
    // 初始化規格物件，包含產品規格模板中的所有規格鍵
    const initialSpecs: Record<string, string> = {};
    specKeys.forEach(key => {
      initialSpecs[key] = "";
    });
    
    setFormData({ 
      ...defaultVariant, 
      sortOrder: variants.length,
      specs: initialSpecs
    });
    setShowAddForm(true);
    setEditingIndex(null);
  };

  const handleEditVariant = (index: number) => {
    const variant = variants[index];
    
    setFormData({
      id: variant.id,
      sku: variant.sku || "",
      variantTitle: variant.variantTitle || "",
      specs: variant.specs,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      stock: variant.stock,
      imageUrl: variant.imageUrl,
      sortOrder: variant.sortOrder,
      isActive: variant.isActive,
      weight: variant.weight,
      barcode: variant.barcode,
      status: variant.status,
      inventoryType: variant.inventoryType,
      preorderLimit: variant.preorderLimit,
      preorderSold: variant.preorderSold,
      preorderStartTime: variant.preorderStartTime ? variant.preorderStartTime.split('T')[0] : "",
      preorderEndTime: variant.preorderEndTime ? variant.preorderEndTime.split('T')[0] : "",
      expectedShipDate: variant.expectedShipDate ? variant.expectedShipDate.split('T')[0] : "",
      preorderPrice: variant.preorderPrice,
      preorderDescription: variant.preorderDescription,
    });
    setEditingIndex(index);
    setShowAddForm(false);
  };

  const handleSaveVariant = async () => {
    // SKU 將由後端自動生成，不需要前端驗證

    if (formData.price <= 0) {
      toast.error("請輸入有效的價格");
      return;
    }

    // 檢查規格是否已設定
    if (!formData.specs || Object.keys(formData.specs).length === 0) {
      // 如果沒有規格，提示用戶先新增規格
      if (specKeys.length === 0) {
        toast.error("請先新增規格（如：顏色、尺寸等）");
        return;
      } else {
        toast.error("請為所有規格填入值");
        return;
      }
    }

    // 檢查 SKU 重複（只在手動輸入 SKU 時檢查）
    // SKU 重複檢查由後端處理

    const newVariant: ProductVariant = {
      // 對於新變體，使用臨時 ID（編輯時保留原始 ID）
      id: formData.id || `temp-${Date.now()}`,
      productId: productId || "",
      sku: formData.sku || "", // SKU 由後端自動生成
      variantTitle: formData.variantTitle,
      specs: formData.specs,
      price: formData.price,
      compareAtPrice: formData.compareAtPrice,
      stock: formData.stock,
      imageUrl: formData.imageUrl,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
      weight: formData.weight,
      barcode: formData.barcode,
      status: formData.status,
      inventoryType: formData.inventoryType,
      preorderLimit: formData.preorderLimit,
      preorderSold: formData.preorderSold,
      preorderStartTime: formData.preorderStartTime || undefined,
      preorderEndTime: formData.preorderEndTime || undefined,
      expectedShipDate: formData.expectedShipDate || undefined,
      preorderPrice: formData.preorderPrice,
      preorderDescription: formData.preorderDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 在編輯模式下，如果有產品 ID，直接保存到資料庫
    if (mode === 'edit' && productId) {
      setIsSaving(true);
      try {
        if (editingIndex !== null && !formData.id?.startsWith('temp-')) {
          // 更新現有變體 - 確保 specs 不是空物件
          const specs = newVariant.specs && Object.keys(newVariant.specs).length > 0 
            ? newVariant.specs 
            : { "規格": "標準" }; // 預設規格
            
          const variantToUpdate = {
            variantTitle: newVariant.variantTitle,
            specs: specs,
            price: newVariant.price,
            compareAtPrice: newVariant.compareAtPrice,
            stock: newVariant.stock,
            imageUrl: newVariant.imageUrl,
            sortOrder: newVariant.sortOrder,
            isActive: newVariant.isActive,
            weight: newVariant.weight,
            barcode: newVariant.barcode,
            status: newVariant.status,
            inventoryType: newVariant.inventoryType,
            preorderLimit: newVariant.preorderLimit,
            preorderSold: newVariant.preorderSold,
            preorderStartTime: newVariant.preorderStartTime,
            preorderEndTime: newVariant.preorderEndTime,
            expectedShipDate: newVariant.expectedShipDate,
            preorderPrice: newVariant.preorderPrice,
            preorderDescription: newVariant.preorderDescription,
          };
          
          console.log('📤 [VariantEditor] 更新變體資料:', variantToUpdate);
          
          const updatedVariant = await adminApi.updateProductVariant(formData.id!, variantToUpdate);
          
          // 更新本地狀態
          const updatedVariants = [...variants];
          updatedVariants[editingIndex] = updatedVariant;
          onChange(updatedVariants);
          
          toast.success("變體已成功更新到資料庫");
        } else {
          // 創建新變體
          console.log('🔍 [VariantEditor] 檢查 newVariant 資料:', {
            newVariant,
            specs: newVariant.specs,
            price: newVariant.price,
            autoGenerateSku: newVariant.autoGenerateSku
          });
          
          // 確保 specs 不是空物件
          const specs = newVariant.specs && Object.keys(newVariant.specs).length > 0 
            ? newVariant.specs 
            : { "規格": "標準" }; // 預設規格
            
          const variantToCreate: any = {
            specs,
            price: Number(newVariant.price),
            stock: Number(newVariant.stock || 0),
            sortOrder: Number(newVariant.sortOrder || 0),
            isActive: newVariant.isActive !== undefined ? newVariant.isActive : true,
            status: newVariant.status || 'IN_STOCK',
            inventoryType: newVariant.inventoryType || 'PHYSICAL',
          };
          
          // SKU 由後端自動生成，不在前端處理
          
          // 只添加有值的可選欄位
          if (newVariant.variantTitle) variantToCreate.variantTitle = newVariant.variantTitle;
          if (newVariant.compareAtPrice) variantToCreate.compareAtPrice = newVariant.compareAtPrice;
          if (newVariant.imageUrl) variantToCreate.imageUrl = newVariant.imageUrl;
          if (newVariant.weight) variantToCreate.weight = newVariant.weight;
          if (newVariant.barcode) variantToCreate.barcode = newVariant.barcode;
          if (newVariant.preorderLimit) variantToCreate.preorderLimit = newVariant.preorderLimit;
          if (newVariant.preorderSold !== undefined) variantToCreate.preorderSold = newVariant.preorderSold;
          if (newVariant.preorderPrice) variantToCreate.preorderPrice = newVariant.preorderPrice;
          if (newVariant.preorderDescription) variantToCreate.preorderDescription = newVariant.preorderDescription;
          
          // 處理日期欄位
          if (newVariant.preorderStartTime) {
            variantToCreate.preorderStartTime = newVariant.preorderStartTime.includes('T') 
              ? newVariant.preorderStartTime 
              : `${newVariant.preorderStartTime}T00:00:00.000Z`;
          }
          if (newVariant.preorderEndTime) {
            variantToCreate.preorderEndTime = newVariant.preorderEndTime.includes('T')
              ? newVariant.preorderEndTime
              : `${newVariant.preorderEndTime}T00:00:00.000Z`;
          }
          if (newVariant.expectedShipDate) {
            variantToCreate.expectedShipDate = newVariant.expectedShipDate.includes('T')
              ? newVariant.expectedShipDate
              : `${newVariant.expectedShipDate}T00:00:00.000Z`;
          }
          
          console.log('📤 [VariantEditor] 最終發送的變體資料:', variantToCreate);
          const createdVariant = await adminApi.createProductVariant(productId, variantToCreate);
          
          // 更新本地狀態，使用從後端返回的完整資料
          const updatedVariants = [...variants, createdVariant];
          onChange(updatedVariants);
          
          toast.success("變體已成功創建並保存到資料庫");
        }
        
        handleCancelEdit();
      } catch (error: any) {
        console.error('保存變體失敗:', error);
        const errorMessage = error.response?.data?.message || error.message || '保存變體失敗';
        toast.error(errorMessage);
      } finally {
        setIsSaving(false);
      }
    } else {
      // 創建模式：只更新本地狀態
      let newVariants;
      if (editingIndex !== null) {
        newVariants = [...variants];
        newVariants[editingIndex] = newVariant;
      } else {
        newVariants = [...variants, newVariant];
      }

      onChange(newVariants);
      handleCancelEdit();
      toast.success(
        editingIndex !== null 
          ? "變體已更新，將在創建產品時一併保存" 
          : "變體已新增，將在創建產品時一併保存"
      );
    }
  };

  const handleDeleteVariant = async (index: number) => {
    if (confirm("確定要刪除此變體嗎？")) {
      const variantToDelete = variants[index];
      
      // 在編輯模式下，如果變體已存在於資料庫，直接刪除
      if (mode === 'edit' && productId && variantToDelete.id && !variantToDelete.id.startsWith('temp-')) {
        try {
          await adminApi.deleteProductVariant(variantToDelete.id);
          toast.success("變體已從資料庫刪除");
        } catch (error: any) {
          console.error('刪除變體失敗:', error);
          const errorMessage = error.response?.data?.message || error.message || '刪除變體失敗';
          toast.error(errorMessage);
          return; // 如果刪除失敗，不更新本地狀態
        }
      }
      
      // 更新本地狀態
      const newVariants = variants.filter((_, i) => i !== index);
      onChange(newVariants);
      
      if (mode === 'create' || variantToDelete.id?.startsWith('temp-')) {
        toast.success("變體已移除");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setShowAddForm(false);
    setFormData(defaultVariant);
  };

  const handleMoveVariant = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= variants.length) return;

    const newVariants = [...variants];
    [newVariants[index], newVariants[newIndex]] = [newVariants[newIndex], newVariants[index]];
    
    // 更新排序
    newVariants.forEach((variant, i) => {
      variant.sortOrder = i;
    });

    onChange(newVariants);
  };


  const updateSpec = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, [key]: value }
    }));
  };

  const isPreorderType = formData.inventoryType !== InventoryType.PHYSICAL;

  // 檢查是否有變體缺少 SKU
  const hasVariantsWithoutSku = variants.some(v => !v.sku || v.sku.trim() === '');

  return (
    <div className="space-y-4">
      {/* 批量操作區 */}
      {hasVariantsWithoutSku && variants.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">有變體缺少 SKU</p>
          <p className="text-yellow-600 text-sm">儲存時系統將自動為缺少 SKU 的變體生成唯一識別碼</p>
        </div>
      )}

      {/* 變體列表 */}
      <div className="space-y-3">
        {variants.map((variant, index) => (
          <div key={variant.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                {/* 變體圖片縮圖 */}
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {variant.imageUrl ? (
                    <img
                      src={variant.imageUrl}
                      alt={variant.variantTitle || `變體 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-gray-400">無圖</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                  <h4 className="font-medium text-gray-900">
                    {variant.variantTitle || `變體 ${index + 1}`}
                  </h4>
                  {variant.sku ? (
                    <span className="text-sm text-gray-500">SKU: {variant.sku}</span>
                  ) : (
                    <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      需要設定 SKU
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    variant.status === ProductStatus.IN_STOCK ? 'bg-green-100 text-green-800' :
                    variant.status === ProductStatus.PREORDER ? 'bg-blue-100 text-blue-800' :
                    variant.status === ProductStatus.OUT_OF_STOCK ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {statusOptions.find(opt => opt.value === variant.status)?.label}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    variant.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {variant.isActive ? '啟用' : '停用'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                  <div>價格: ${variant.price}</div>
                  <div>庫存: {variant.stock}</div>
                  <div>規格: {Object.entries(variant.specs).map(([k, v]) => `${k}:${v}`).join(', ')}</div>
                  <div>排序: {variant.sortOrder}</div>
                </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveVariant(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <FaArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveVariant(index, 'down')}
                  disabled={index === variants.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <FaArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEditVariant(index)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteVariant(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 新增變體按鈕 */}
      {!showAddForm && editingIndex === null && (
        <button
          type="button"
          onClick={handleAddVariant}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          新增變體
        </button>
      )}

      {/* 變體表單 */}
      {(showAddForm || editingIndex !== null) && (
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h4 className="text-lg font-semibold mb-4 text-black">
            {editingIndex !== null ? "編輯變體" : "新增變體"}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SKU 顯示區 (唯讀，由系統自動生成) */}
            {formData.sku && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU (系統自動生成)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  placeholder="儲存後系統將自動生成 SKU"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                變體標題
              </label>
              <input
                type="text"
                value={formData.variantTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, variantTitle: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-black"
                placeholder="請輸入變體標題"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                價格 *
              </label>
              <input
                type="text"
                value={formData.price || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  setFormData(prev => ({ ...prev, price: value ? Number(value) : 0 }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black placeholder:text-black"
                placeholder="請輸入價格"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                市場價
              </label>
              <input
                type="text"
                value={formData.compareAtPrice || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  setFormData(prev => ({ ...prev, compareAtPrice: value ? Number(value) : undefined }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black placeholder:text-black"
                placeholder="請輸入市場價"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                庫存類型
              </label>
              <select
                value={formData.inventoryType}
                onChange={(e) => setFormData(prev => ({ ...prev, inventoryType: e.target.value as InventoryType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                {inventoryTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isPreorderType ? "預購數量" : "庫存數量"}
              </label>
              <input
                type="text"
                value={formData.stock || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData(prev => ({ ...prev, stock: value ? Number(value) : 0 }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black placeholder:text-black"
                placeholder="請輸入數量"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                產品狀態
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProductStatus }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                變體圖片
              </label>
              <VariantImageUploader
                imageUrl={formData.imageUrl || ""}
                onImageChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                placeholder="變體圖片"
                size="lg"
              />
            </div>
          </div>

          {/* 規格設定 */}
          <div className="mt-6">
            <h5 className="text-md font-medium text-gray-900 mb-4">產品規格</h5>
            
            {specKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="mb-2">此產品還沒有設定規格模板</p>
                <p className="text-sm">請先在上方「產品規格模板」區塊中定義規格項目（如：顏色、尺寸等）</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specKeys.map(key => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {key}
                    </label>
                    <input
                      type="text"
                      value={formData.specs[key] || ""}
                      onChange={(e) => updateSpec(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-black"
                      placeholder={`請輸入${key}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 預購設定 */}
          {formData.status === ProductStatus.PREORDER && (
            <div className="mt-6">
              <h5 className="text-md font-medium text-gray-900 mb-4">預購設定</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    預購價格
                  </label>
                  <input
                    type="text"
                    value={formData.preorderPrice || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setFormData(prev => ({ ...prev, preorderPrice: value ? Number(value) : undefined }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black placeholder:text-black"
                    placeholder="請輸入預購價格"
                  />
                </div>

                {formData.inventoryType === InventoryType.PREORDER_LIMITED && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      預購限制數量
                    </label>
                    <input
                      type="text"
                      value={formData.preorderLimit || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData(prev => ({ ...prev, preorderLimit: value ? Number(value) : undefined }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black placeholder:text-black"
                      placeholder="請輸入限制數量"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    預購開始時間
                  </label>
                  <input
                    type="date"
                    value={formData.preorderStartTime || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, preorderStartTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    預購結束時間
                  </label>
                  <input
                    type="date"
                    value={formData.preorderEndTime || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, preorderEndTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    預計出貨日期
                  </label>
                  <input
                    type="date"
                    value={formData.expectedShipDate || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedShipDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    預購說明
                  </label>
                  <textarea
                    value={formData.preorderDescription || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, preorderDescription: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-black"
                    placeholder="預購商品的說明..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* 其他設定 */}
          <div className="mt-6">
            <h5 className="text-md font-medium text-gray-900 mb-4">其他設定</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  重量 (kg)
                </label>
                <input
                  type="text"
                  value={formData.weight || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    setFormData(prev => ({ ...prev, weight: value ? Number(value) : undefined }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black placeholder:text-black"
                  placeholder="請輸入重量"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  條碼
                </label>
                <input
                  type="text"
                  value={formData.barcode || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-black"
                  placeholder="產品條碼"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">變體啟用</span>
                </label>
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FaTimes className="w-4 h-4" />
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveVariant}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  儲存中...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  儲存
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {variants.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-500">
          還沒有任何變體，點擊上方按鈕新增第一個變體
        </div>
      )}
    </div>
  );
}