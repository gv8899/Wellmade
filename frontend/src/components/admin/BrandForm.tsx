"use client";
import { useState, useRef } from "react";
import { Brand, adminApi } from "@/services/admin";
import Image from "next/image";
import { FaUpload, FaTrash, FaTags } from "react-icons/fa";
import toast from "react-hot-toast";

interface BrandFormProps {
  initialData?: Partial<Brand>;
  onSubmit: (data: BrandFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

export interface BrandFormData {
  name: string;
  logoUrl?: string | undefined;
  description?: string | undefined;
  isActive: boolean;
}

export default function BrandForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  submitButtonText = "保存"
}: BrandFormProps) {
  const [formData, setFormData] = useState<BrandFormData>({
    name: initialData?.name || "",
    logoUrl: initialData?.logoUrl || "",
    description: initialData?.description || "",
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Partial<BrandFormData>>({});
  const [logoPreview, setLogoPreview] = useState<string>(initialData?.logoUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<BrandFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "品牌名稱為必填";
    } else if (formData.name.length < 2) {
      newErrors.name = "品牌名稱至少需要2個字元";
    } else if (formData.name.length > 100) {
      newErrors.name = "品牌名稱不能超過100個字元";
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "描述不能超過1000個字元";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof BrandFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      toast.error("請選擇圖片檔案");
      return;
    }

    // 檢查檔案大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error("圖片大小不能超過 5MB");
      return;
    }

    try {
      setIsUploading(true);
      
      // 先創建預覽
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // 上傳到服務器
      const response = await adminApi.uploadImage(file);
      
      // 使用服務器返回的 URL
      setFormData(prev => ({ ...prev, logoUrl: response.url }));
      toast.success("圖片上傳成功");
      
    } catch (error) {
      console.error("Failed to upload brand logo:", error);
      toast.error(`圖片上傳失敗: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setLogoPreview("");
    setFormData(prev => ({ ...prev, logoUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("請修正表單錯誤");
      return;
    }

    try {
      // 準備提交數據，移除空的 logoUrl
      const submitData = {
        ...formData,
        logoUrl: formData.logoUrl?.trim() || undefined,
        description: formData.description?.trim() || undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
      
      if (error.response?.data?.message) {
        // 如果是陣列形式的驗證錯誤
        if (Array.isArray(error.response.data.message)) {
          const messages = error.response.data.message.join(', ');
          toast.error(`提交失敗: ${messages}`);
        } else {
          toast.error(`提交失敗: ${error.response.data.message}`);
        }
      } else {
        toast.error("提交失敗，請重試");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 品牌名稱 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            品牌名稱 *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="輸入品牌名稱"
            maxLength={100}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* 品牌標誌 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            品牌標誌
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {logoPreview ? (
              <div className="relative">
                <Image
                  src={logoPreview}
                  alt="品牌標誌預覽"
                  className="w-32 h-32 object-contain mx-auto rounded-lg"
                  width={128}
                  height={128}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <FaTags className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="flex justify-center">
                  <label className={`cursor-pointer px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    isUploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}>
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <FaUpload className="w-4 h-4" />
                    )}
                    {isUploading ? '上傳中...' : '選擇圖片'}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  支援 JPG、PNG 格式，最大 5MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 品牌描述 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            品牌描述
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="輸入品牌描述（可選）"
            maxLength={1000}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.description.length}/1000 字元
          </p>
        </div>

        {/* 品牌狀態 */}
        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleInputChange("isActive", e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              啟用品牌
            </span>
          </label>
          <p className="text-sm text-gray-500 mt-1">
            停用的品牌將不會顯示在前台
          </p>
        </div>

        {/* 操作按鈕 */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
}