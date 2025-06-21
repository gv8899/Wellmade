"use client";
import { useState, useRef } from "react";
import { adminApi } from "@/services/admin";
import { FaUpload, FaTrash, FaImage, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

interface ImageUploaderProps {
  mainImage: string;
  additionalImages: string[];
  onMainImageChange: (url: string) => void;
  onAdditionalImagesChange: (urls: string[]) => void;
}

export default function ImageUploader({
  mainImage,
  additionalImages,
  onMainImageChange,
  onAdditionalImagesChange,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 檢查檔案大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("圖片檔案大小不能超過 10MB");
      return;
    }

    // 檢查檔案類型
    if (!file.type.startsWith("image/")) {
      toast.error("請選擇圖片檔案");
      return;
    }

    try {
      setUploading(true);
      console.log("開始上傳主圖:", file.name, file.size, file.type);
      const response = await adminApi.uploadImage(file);
      console.log("上傳成功，返回響應:", response);
      onMainImageChange(response.url);
      toast.success("主圖上傳成功");
    } catch (error) {
      console.error("Failed to upload main image:", error);
      console.error("錯誤詳情:", error.response?.data);
      toast.error(`主圖上傳失敗: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = "";
      }
    }
  };

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 檢查總數量限制
    if (additionalImages.length + files.length > 8) {
      toast.error("最多只能上傳 8 張附加圖片");
      return;
    }

    // 檢查每個檔案
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`圖片 ${file.name} 檔案大小不能超過 10MB`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`檔案 ${file.name} 不是圖片格式`);
        return;
      }
    }

    try {
      setUploading(true);
      const response = await adminApi.uploadImages(files);
      
      if (response.summary.failed > 0) {
        toast.warning(`${response.summary.successful} 張圖片上傳成功，${response.summary.failed} 張失敗`);
      } else {
        toast.success(`${response.summary.successful} 張圖片上傳成功`);
      }

      const newUrls = response.images.map(img => img.url);
      onAdditionalImagesChange([...additionalImages, ...newUrls]);
    } catch (error) {
      console.error("Failed to upload additional images:", error);
      toast.error("圖片上傳失敗");
    } finally {
      setUploading(false);
      if (additionalImagesInputRef.current) {
        additionalImagesInputRef.current.value = "";
      }
    }
  };

  const handleRemoveMainImage = () => {
    onMainImageChange("");
  };

  const handleRemoveAdditionalImage = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    onAdditionalImagesChange(newImages);
  };

  const handleSetAsMainImage = (url: string, index: number) => {
    // 將選中的圖片設為主圖
    onMainImageChange(url);
    // 從附加圖片中移除
    handleRemoveAdditionalImage(index);
  };

  return (
    <div className="space-y-6">
      {/* 主圖上傳 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          主要圖片
        </label>
        <div className="flex items-start gap-4">
          {/* 主圖預覽 */}
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            {mainImage ? (
              <div className="relative w-full h-full">
                <img
                  src={mainImage}
                  alt="主圖預覽"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveMainImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <FaImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-500">無主圖</span>
              </div>
            )}
          </div>

          {/* 上傳按鈕 */}
          <div className="flex-1">
            <input
              ref={mainImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleMainImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => mainImageInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  上傳中...
                </>
              ) : (
                <>
                  <FaUpload className="w-4 h-4" />
                  選擇主圖
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              支援 JPG、PNG、WebP 格式，檔案大小不超過 10MB
            </p>
          </div>
        </div>
      </div>

      {/* 附加圖片上傳 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          附加圖片 ({additionalImages.length}/8)
        </label>
        
        {/* 附加圖片網格 */}
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-4">
          {additionalImages.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`附加圖片 ${index + 1}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSetAsMainImage(url, index)}
                  className="bg-blue-500 text-white rounded px-2 py-1 text-xs hover:bg-blue-600 transition-colors"
                  title="設為主圖"
                >
                  主圖
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveAdditionalImage(index)}
                  className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="刪除"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 上傳按鈕 */}
        {additionalImages.length < 8 && (
          <div>
            <input
              ref={additionalImagesInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => additionalImagesInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  上傳中...
                </>
              ) : (
                <>
                  <FaUpload className="w-4 h-4" />
                  選擇附加圖片（可多選）
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-1 text-center">
              最多可上傳 8 張附加圖片，支援多選上傳
            </p>
          </div>
        )}
      </div>
    </div>
  );
}