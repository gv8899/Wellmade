"use client";
import { useState, useRef } from "react";
import { KeyFeature, adminApi } from "@/services/admin";
import { FaPlus, FaTrash, FaGripVertical, FaUpload, FaSpinner, FaImage } from "react-icons/fa";
import toast from "react-hot-toast";

interface KeyFeaturesEditorProps {
  features: KeyFeature[];
  onChange: (features: KeyFeature[]) => void;
}

export default function KeyFeaturesEditor({ features, onChange }: KeyFeaturesEditorProps) {
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const addFeature = () => {
    const newFeature: KeyFeature = {
      image: "",
      title: "",
      subtitle: "",
      description: "",
    };
    onChange([...features, newFeature]);
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    onChange(newFeatures);
  };

  const updateFeature = (index: number, field: keyof KeyFeature, value: string) => {
    const newFeatures = features.map((feature, i) => 
      i === index ? { ...feature, [field]: value } : feature
    );
    onChange(newFeatures);
  };

  const moveFeature = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === features.length - 1) return;

    const newFeatures = [...features];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFeatures[index], newFeatures[targetIndex]] = [newFeatures[targetIndex], newFeatures[index]];
    onChange(newFeatures);
  };

  const handleImageUpload = async (index: number, file: File) => {
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
      setUploading(prev => ({ ...prev, [index]: true }));
      const response = await adminApi.uploadImage(file);
      updateFeature(index, 'image', response.url);
      toast.success("圖片上傳成功");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("圖片上傳失敗");
    } finally {
      setUploading(prev => ({ ...prev, [index]: false }));
      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index]!.value = "";
      }
    }
  };

  const handleFileInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(index, file);
    }
  };

  return (
    <div className="space-y-4">
      {features.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">尚未添加任何關鍵特色</p>
          <button
            type="button"
            onClick={addFeature}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaPlus className="w-4 h-4" />
            添加第一個特色
          </button>
        </div>
      ) : (
        <>
          {features.map((feature, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaGripVertical className="text-gray-400" />
                  <span className="font-medium text-gray-700">特色 {index + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveFeature(index, 'up')}
                    disabled={index === 0}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFeature(index, 'down')}
                    disabled={index === features.length - 1}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    特色圖片
                  </label>
                  <div className="flex items-start gap-3">
                    {/* 圖片預覽 */}
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 flex-shrink-0">
                      {feature.image ? (
                        <div className="relative w-full h-full">
                          <img
                            src={feature.image}
                            alt={feature.title || "特色圖片"}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => updateFeature(index, 'image', '')}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                          >
                            <FaTrash className="w-2 h-2" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FaImage className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                          <span className="text-xs text-gray-500">無圖片</span>
                        </div>
                      )}
                    </div>

                    {/* 上傳按鈕 */}
                    <div className="flex-1">
                      <input
                        ref={(el) => { fileInputRefs.current[index] = el; }}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileInputChange(index, e)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[index]?.click()}
                        disabled={uploading[index]}
                        className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {uploading[index] ? (
                          <>
                            <FaSpinner className="w-3 h-3 animate-spin" />
                            上傳中...
                          </>
                        ) : (
                          <>
                            <FaUpload className="w-3 h-3" />
                            選擇圖片
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        支援 JPG、PNG、WebP，最大 10MB
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    標題
                  </label>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
                    placeholder="特色標題"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    副標題
                  </label>
                  <input
                    type="text"
                    value={feature.subtitle || ""}
                    onChange={(e) => updateFeature(index, 'subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
                    placeholder="副標題（可選）"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    value={feature.description}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
                    placeholder="特色描述"
                  />
                </div>
              </div>

              {/* 預覽 */}
              {(feature.image || feature.title || feature.description) && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-xs text-gray-500 mb-2">預覽：</p>
                  <div className="flex items-start gap-3">
                    {feature.image && (
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      {feature.title && (
                        <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                      )}
                      {feature.subtitle && (
                        <p className="text-sm text-gray-600">{feature.subtitle}</p>
                      )}
                      {feature.description && (
                        <p className="text-sm text-gray-700 mt-1">{feature.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addFeature}
            className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            添加關鍵特色
          </button>
        </>
      )}
    </div>
  );
}