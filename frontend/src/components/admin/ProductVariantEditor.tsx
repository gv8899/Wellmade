"use client";
import { useState, useEffect } from "react";
import { ProductVariant, ProductStatus, InventoryType } from "@/types/product";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaArrowUp, FaArrowDown } from "react-icons/fa";
import toast from "react-hot-toast";

interface ProductVariantEditorProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  productId?: string;
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
};

export default function ProductVariantEditor({
  variants,
  onChange,
  productId,
}: ProductVariantEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<VariantFormData>(defaultVariant);
  const [specKeys, setSpecKeys] = useState<string[]>([]);

  useEffect(() => {
    // 從現有變體中提取規格鍵
    const allSpecKeys = new Set<string>();
    variants.forEach(variant => {
      Object.keys(variant.specs).forEach(key => allSpecKeys.add(key));
    });
    setSpecKeys(Array.from(allSpecKeys));
  }, [variants]);

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
    setFormData({ 
      ...defaultVariant, 
      sortOrder: variants.length 
    });
    setShowAddForm(true);
    setEditingIndex(null);
  };

  const handleEditVariant = (index: number) => {
    const variant = variants[index];
    setFormData({
      id: variant.id,
      sku: variant.sku,
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

  const handleSaveVariant = () => {
    if (!formData.sku.trim()) {
      toast.error("請輸入 SKU");
      return;
    }

    if (formData.price <= 0) {
      toast.error("請輸入有效的價格");
      return;
    }

    // 檢查 SKU 重複
    const existingSKUs = variants.map((v, i) => i === editingIndex ? null : v.sku);
    if (existingSKUs.includes(formData.sku)) {
      toast.error("SKU 已存在");
      return;
    }

    const newVariant: ProductVariant = {
      id: formData.id || `temp-${Date.now()}`,
      productId: productId || "",
      sku: formData.sku,
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

    let newVariants;
    if (editingIndex !== null) {
      newVariants = [...variants];
      newVariants[editingIndex] = newVariant;
    } else {
      newVariants = [...variants, newVariant];
    }

    onChange(newVariants);
    handleCancelEdit();
    toast.success(editingIndex !== null ? "變體已更新" : "變體已新增");
  };

  const handleDeleteVariant = (index: number) => {
    if (confirm("確定要刪除此變體嗎？")) {
      const newVariants = variants.filter((_, i) => i !== index);
      onChange(newVariants);
      toast.success("變體已刪除");
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

  const addSpecKey = () => {
    const key = prompt("請輸入規格名稱 (例如: 顏色, 尺寸):");
    if (key && key.trim() && !specKeys.includes(key.trim())) {
      const newSpecKeys = [...specKeys, key.trim()];
      setSpecKeys(newSpecKeys);
      
      // 為所有現有變體新增此規格鍵
      const updatedVariants = variants.map(variant => ({
        ...variant,
        specs: { ...variant.specs, [key.trim()]: "" }
      }));
      onChange(updatedVariants);
    }
  };

  const updateSpec = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, [key]: value }
    }));
  };

  const isPreorderType = formData.inventoryType !== InventoryType.PHYSICAL;

  return (
    <div className="space-y-4">
      {/* 變體列表 */}
      <div className="space-y-3">
        {variants.map((variant, index) => (
          <div key={variant.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h4 className="font-medium text-gray-900">
                    {variant.variantTitle || `變體 ${index + 1}`}
                  </h4>
                  <span className="text-sm text-gray-500">SKU: {variant.sku}</span>
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
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveVariant(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <FaArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleMoveVariant(index, 'down')}
                  disabled={index === variants.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <FaArrowDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleEditVariant(index)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
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
          <h4 className="text-lg font-semibold mb-4">
            {editingIndex !== null ? "編輯變體" : "新增變體"}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 基本資訊 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="請輸入 SKU"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                變體標題
              </label>
              <input
                type="text"
                value={formData.variantTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, variantTitle: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                圖片 URL
              </label>
              <input
                type="url"
                value={formData.imageUrl || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* 規格設定 */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-md font-medium text-gray-900">產品規格</h5>
              <button
                onClick={addSpecKey}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                新增規格
              </button>
            </div>
            
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`請輸入${key}`}
                  />
                </div>
              ))}
            </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FaTimes className="w-4 h-4" />
              取消
            </button>
            <button
              onClick={handleSaveVariant}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaSave className="w-4 h-4" />
              儲存
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