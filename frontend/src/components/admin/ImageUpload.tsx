"use client";
import { useState, useRef } from 'react';
import { FaUpload, FaTrash, FaSpinner } from 'react-icons/fa';
import { uploadApi, UploadResponse } from '@/services/upload';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  className?: string;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  onClear,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // 驗證檔案
    const validation = uploadApi.validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      setUploading(true);
      const response: UploadResponse = await uploadApi.uploadImage(file);
      
      // 使用 medium 版本作為預設圖片
      onChange(response.medium);
      toast.success('圖片上傳成功');
    } catch (error: any) {
      console.error('圖片上傳失敗:', error);
      console.error('錯誤響應:', error.response?.data);
      console.error('錯誤狀態:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('請先登入管理員帳號');
      } else if (error.response?.status === 413) {
        toast.error('檔案過大，請上傳小於 10MB 的圖片');
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message || error.response?.data?.error || '請求格式錯誤';
        toast.error(`上傳失敗: ${message}`);
      } else {
        toast.error(error.response?.data?.message || '圖片上傳失敗');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // 清空 input 值，允許重複選擇同一檔案
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    } else {
      toast.error('請拖放圖片檔案');
    }
  };

  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 上傳區域 */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'cursor-not-allowed bg-gray-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!uploading ? handleUploadClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-600">上傳中...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">點擊上傳或拖放圖片</p>
            <p className="text-xs text-gray-500">支援 JPEG、PNG、WebP、GIF 格式，最大 10MB</p>
          </div>
        )}
      </div>

      {/* 圖片預覽 */}
      {value && (
        <div className="relative">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <img
                src={value}
                alt="上傳的圖片"
                className="w-12 h-12 object-cover rounded border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <p className="text-sm font-medium text-gray-700">圖片已上傳</p>
                <p className="text-xs text-gray-500 truncate max-w-48">
                  {value}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="移除圖片"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}