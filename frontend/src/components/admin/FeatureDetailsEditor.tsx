"use client";
import { useState, useRef } from "react";
import { FeatureDetail, adminApi } from "@/services/admin";
import { FaPlus, FaTrash, FaGripVertical, FaUpload, FaSpinner, FaImage, FaVideo } from "react-icons/fa";
import toast from "react-hot-toast";

interface FeatureDetailsEditorProps {
  featureDetails: FeatureDetail[];
  onChange: (featureDetails: FeatureDetail[]) => void;
}

export default function FeatureDetailsEditor({ featureDetails, onChange }: FeatureDetailsEditorProps) {
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const addFeatureDetail = () => {
    const newFeatureDetail: FeatureDetail = {
      type: "image",
      src: "",
      title: "",
      description: "",
      direction: "left",
    };
    onChange([...featureDetails, newFeatureDetail]);
  };

  const removeFeatureDetail = (index: number) => {
    const newFeatureDetails = featureDetails.filter((_, i) => i !== index);
    onChange(newFeatureDetails);
  };

  const updateFeatureDetail = (index: number, field: keyof FeatureDetail, value: string) => {
    const newFeatureDetails = featureDetails.map((detail, i) => 
      i === index ? { ...detail, [field]: value } : detail
    );
    onChange(newFeatureDetails);
  };

  const moveFeatureDetail = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === featureDetails.length - 1) return;

    const newFeatureDetails = [...featureDetails];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFeatureDetails[index], newFeatureDetails[targetIndex]] = [newFeatureDetails[targetIndex], newFeatureDetails[index]];
    onChange(newFeatureDetails);
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
      updateFeatureDetail(index, 'src', response.url);
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
      {featureDetails.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">尚未添加任何詳細特色</p>
          <button
            type="button"
            onClick={addFeatureDetail}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaPlus className="w-4 h-4" />
            添加第一個詳細特色
          </button>
        </div>
      ) : (
        <>
          {featureDetails.map((detail, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaGripVertical className="text-gray-400" />
                  <span className="font-medium text-gray-700">詳細特色 {index + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveFeatureDetail(index, 'up')}
                    disabled={index === 0}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFeatureDetail(index, 'down')}
                    disabled={index === featureDetails.length - 1}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFeatureDetail(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 媒體類型選擇 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    媒體類型
                  </label>
                  <select
                    value={detail.type}
                    onChange={(e) => updateFeatureDetail(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="image">圖片</option>
                    <option value="video">影片</option>
                  </select>
                </div>

                {/* 版面方向 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    版面方向
                  </label>
                  <select
                    value={detail.direction || 'left'}
                    onChange={(e) => updateFeatureDetail(index, 'direction', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="left">圖片在左</option>
                    <option value="right">圖片在右</option>
                  </select>
                </div>

                {/* 媒體上傳/輸入 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {detail.type === 'image' ? '圖片' : '影片URL'}
                  </label>
                  
                  {detail.type === 'image' ? (
                    <div className="flex items-start gap-3">
                      {/* 圖片預覽 */}
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 flex-shrink-0">
                        {detail.src ? (
                          <div className="relative w-full h-full">
                            <img
                              src={detail.src}
                              alt={detail.title || "詳細特色圖片"}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => updateFeatureDetail(index, 'src', '')}
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
                  ) : (
                    <input
                      type="url"
                      value={detail.src}
                      onChange={(e) => updateFeatureDetail(index, 'src', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
                      placeholder="https://example.com/video.mp4"
                    />
                  )}
                </div>

                {/* 標題 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    標題
                  </label>
                  <input
                    type="text"
                    value={detail.title}
                    onChange={(e) => updateFeatureDetail(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
                    placeholder="詳細特色標題"
                  />
                </div>

                {/* 描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    value={detail.description}
                    onChange={(e) => updateFeatureDetail(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
                    placeholder="詳細特色描述"
                  />
                </div>
              </div>

              {/* 預覽 */}
              {(detail.src || detail.title || detail.description) && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-xs text-gray-500 mb-2">預覽：</p>
                  <div className={`flex items-start gap-4 ${detail.direction === 'right' ? 'flex-row-reverse' : ''}`}>
                    {detail.src && (
                      <div className="flex-shrink-0">
                        {detail.type === 'image' ? (
                          <img
                            src={detail.src}
                            alt={detail.title}
                            className="w-24 h-24 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                            <FaVideo className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      {detail.title && (
                        <h4 className="font-semibold text-gray-900 mb-1">{detail.title}</h4>
                      )}
                      {detail.description && (
                        <p className="text-sm text-gray-700">{detail.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addFeatureDetail}
            className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            添加詳細特色
          </button>
        </>
      )}
    </div>
  );
}