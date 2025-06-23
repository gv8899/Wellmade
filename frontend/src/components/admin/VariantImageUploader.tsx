"use client";
import { useState, useRef } from "react";
import { adminApi } from "@/services/admin";
import { FaUpload, FaTrash, FaImage, FaSpinner, FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";

interface VariantImageUploaderProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
}

export default function VariantImageUploader({
  imageUrl,
  onImageChange,
  placeholder = "變體圖片",
  size = "md"
}: VariantImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 根據size設定容器大小
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32"
  };

  const handleFileUpload = async (file: File) => {
    // 檢查檔案大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("圖片檔案大小不能超過 5MB");
      return;
    }

    // 檢查檔案類型
    if (!file.type.startsWith("image/")) {
      toast.error("請選擇圖片檔案");
      return;
    }

    try {
      setUploading(true);
      console.log("開始上傳變體圖片:", file.name, file.size, file.type);
      const response = await adminApi.uploadImage(file);
      console.log("變體圖片上傳成功:", response);
      onImageChange(response.url);
      toast.success("變體圖片上傳成功");
    } catch (error) {
      console.error("Failed to upload variant image:", error);
      toast.error(`變體圖片上傳失敗: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileUpload(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    await handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemoveImage = () => {
    onImageChange("");
    toast.success("變體圖片已清除");
  };

  const handleManualInput = () => {
    const url = prompt("請輸入圖片 URL:", imageUrl);
    if (url !== null) {
      onImageChange(url.trim());
    }
  };

  return (
    <div className="space-y-2">
      {/* 圖片預覽容器 */}
      <div
        className={`${sizeClasses[size]} border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 transition-colors relative group ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
        } ${uploading ? "opacity-75" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
            <FaSpinner className="w-4 h-4 animate-spin text-blue-600" />
          </div>
        )}

        {imageUrl ? (
          <div className="relative w-full h-full">
            <img
              src={imageUrl}
              alt={placeholder}
              className="w-full h-full object-cover rounded-lg"
            />
            {/* 懸停時顯示操作按鈕 */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-600 transition-colors"
                title="替換圖片"
              >
                <FaEdit className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                title="移除圖片"
              >
                <FaTrash className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="text-center cursor-pointer w-full h-full flex flex-col items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaImage className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-xs text-gray-500 text-center leading-tight">
              {dragOver ? "放開上傳" : "點擊或拖拽"}
            </span>
          </div>
        )}
      </div>

      {/* 操作按鈕組 */}
      <div className="flex gap-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          <FaUpload className="w-3 h-3" />
          上傳
        </button>
        
        <button
          type="button"
          onClick={handleManualInput}
          disabled={uploading}
          className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="手動輸入 URL"
        >
          URL
        </button>
      </div>

      {/* 提示文字 */}
      <p className="text-xs text-gray-500 text-center">
        支援 JPG、PNG、WebP，最大 5MB
      </p>
    </div>
  );
}