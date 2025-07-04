'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Banner,
  CreateBannerDto,
  UpdateBannerDto,
  BannerLinkType,
  BannerPosition,
  BannerPositionLabels,
  BannerLinkTypeLabels
} from '@/types/banner';
import { BannerService } from '@/services/banner';
import { adminApi } from '@/services/admin';
import { toast } from 'react-hot-toast';
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa';

// 🎯 導入設計系統
import { Text, Button, FormField } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

interface BannerFormProps {
  banner?: Banner;
  mode: 'create' | 'edit';
}

interface FormData {
  title: string;
  description: string;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  linkType: BannerLinkType;
  position: BannerPosition;
  sortOrder: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const BannerForm: React.FC<BannerFormProps> = ({ banner, mode }) => {
  const router = useRouter();
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ desktop: boolean; mobile: boolean }>({
    desktop: false,
    mobile: false
  });

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    imageUrl: '',
    mobileImageUrl: '',
    linkUrl: '',
    linkType: BannerLinkType.NONE,
    position: BannerPosition.HOMEPAGE,
    sortOrder: '0',
    isActive: true,
    startDate: '',
    endDate: '',
  });

  // 初始化表單數據
  useEffect(() => {
    if (banner && mode === 'edit') {
      setFormData({
        title: banner.title,
        description: banner.description || '',
        imageUrl: banner.imageUrl,
        mobileImageUrl: banner.mobileImageUrl || '',
        linkUrl: banner.linkUrl || '',
        linkType: banner.linkType,
        position: banner.position,
        sortOrder: banner.sortOrder.toString(),
        isActive: banner.isActive,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '',
      });
    }
  }, [banner, mode]);

  // 處理表單輸入變更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 處理圖片上傳
  const handleImageUpload = async (file: File, type: 'desktop' | 'mobile') => {
    if (!file) return;

    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
      toast.error('請選擇圖片文件');
      return;
    }

    // 檢查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('圖片大小不能超過 5MB');
      return;
    }

    setUploadProgress(prev => ({ ...prev, [type]: true }));
    
    try {
      const response = await adminApi.uploadBannerImage(file);
      const imageUrl = response.url;
      
      if (type === 'desktop') {
        setFormData(prev => ({ ...prev, imageUrl }));
        toast.success('桌面版圖片上傳成功');
      } else {
        setFormData(prev => ({ ...prev, mobileImageUrl: imageUrl }));
        toast.success('手機版圖片上傳成功');
      }
    } catch (error) {
      console.error('圖片上傳失敗:', error);
      toast.error('圖片上傳失敗，請稍後再試');
    } finally {
      setUploadProgress(prev => ({ ...prev, [type]: false }));
    }
  };

  // 處理圖片刪除
  const handleImageRemove = (type: 'desktop' | 'mobile') => {
    if (type === 'desktop') {
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    } else {
      setFormData(prev => ({ ...prev, mobileImageUrl: '' }));
    }
  };

  // 驗證表單
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('請輸入 Banner 標題');
      return false;
    }

    if (!formData.imageUrl) {
      toast.error('請上傳桌面版圖片');
      return false;
    }

    if (formData.linkType !== BannerLinkType.NONE && !formData.linkUrl.trim()) {
      toast.error('請輸入連結 URL');
      return false;
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        toast.error('結束時間必須晚於開始時間');
        return false;
      }
    }

    return true;
  };

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const submitData: CreateBannerDto | UpdateBannerDto = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl,
        mobileImageUrl: formData.mobileImageUrl || undefined,
        linkUrl: formData.linkUrl.trim() || undefined,
        linkType: formData.linkType,
        position: formData.position,
        sortOrder: parseInt(formData.sortOrder, 10),
        isActive: formData.isActive,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      };

      console.log('提交的 Banner 數據:', submitData);

      if (mode === 'create') {
        await BannerService.createBanner(submitData as CreateBannerDto);
        toast.success('Banner 創建成功！');
      } else if (banner) {
        await BannerService.updateBanner(banner.id, submitData as UpdateBannerDto);
        toast.success('Banner 更新成功！');
      }

      router.push('/admin/banners');
    } catch (error) {
      console.error('保存 Banner 失敗:', error);
      toast.error('保存失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 圖片上傳組件
  const ImageUploader = ({ 
    type, 
    imageUrl, 
    label 
  }: { 
    type: 'desktop' | 'mobile'; 
    imageUrl: string; 
    label: string;
  }) => (
    <div className="space-y-3">
      <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'medium' }}>
        {label}
      </Text>
      
      {imageUrl ? (
        <div className="relative">
          <div className="w-full h-48 relative bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={`${label} 預覽`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <Button
            type="button"
            variant="danger"
            size="small"
            colorMode={colorMode}
            onClick={() => handleImageRemove(type)}
            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
          >
            <FaTrash className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div 
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) handleImageUpload(file, type);
            };
            input.click();
          }}
        >
          {uploadProgress[type] ? (
            <div className="flex flex-col items-center">
              <div 
                className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 mb-2"
                style={{
                  borderTopColor: colors.primary.light,
                  borderBottomColor: colors.primary.light
                }}
              ></div>
              <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
                上傳中...
              </Text>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
              <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
                點擊上傳圖片
              </Text>
              <Text variant="footnote" color={colors.neutral.tertiaryLabel} colorMode={colorMode}>
                支援 JPG、PNG、WebP 格式，最大 5MB
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本資訊 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <Text variant="title3" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>
            基本資訊
          </Text>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Banner 標題 *"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="請輸入 Banner 標題"
              required
              colorMode={colorMode}
            />

            <div>
              <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ display: 'block', fontWeight: 'medium', marginBottom: '0.25rem' }}>
                顯示位置 *
              </Text>
              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  borderColor: colors.neutral.tertiaryLabel.light,
                }}
              >
                {Object.entries(BannerPositionLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <FormField
              label="排序順序"
              name="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={handleInputChange}
              placeholder="0"
              colorMode={colorMode}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ marginLeft: '0.5rem' }}>
                立即啟用
              </Text>
            </div>
          </div>

          <div className="mt-6">
            <FormField
              label="描述"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Banner 描述（可選）"
              isTextarea={true}
              rows={3}
              colorMode={colorMode}
            />
          </div>
        </div>

        {/* 圖片設定 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <Text variant="title3" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>
            圖片設定
          </Text>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ImageUploader
              type="desktop"
              imageUrl={formData.imageUrl}
              label="桌面版圖片 *"
            />
            
            <ImageUploader
              type="mobile"
              imageUrl={formData.mobileImageUrl}
              label="手機版圖片（可選）"
            />
          </div>
        </div>

        {/* 連結設定 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <Text variant="title3" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>
            連結設定
          </Text>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ display: 'block', fontWeight: 'medium', marginBottom: '0.25rem' }}>
                連結類型
              </Text>
              <select
                name="linkType"
                value={formData.linkType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  borderColor: colors.neutral.tertiaryLabel.light,
                }}
              >
                {Object.entries(BannerLinkTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {formData.linkType !== BannerLinkType.NONE && (
              <FormField
                label="連結 URL"
                name="linkUrl"
                type="url"
                value={formData.linkUrl}
                onChange={handleInputChange}
                placeholder="https://example.com"
                colorMode={colorMode}
              />
            )}
          </div>
        </div>

        {/* 時間設定 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <Text variant="title3" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>
            時間設定
          </Text>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="開始時間"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleInputChange}
              colorMode={colorMode}
            />

            <FormField
              label="結束時間"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleInputChange}
              colorMode={colorMode}
            />
          </div>
          
          <Text variant="footnote" color={colors.neutral.tertiaryLabel} colorMode={colorMode} style={{ marginTop: '0.5rem' }}>
            留空表示無時間限制
          </Text>
        </div>

        {/* 操作按鈕 */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            size="large"
            colorMode={colorMode}
            onClick={() => router.back()}
          >
            取消
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            size="large"
            colorMode={colorMode}
            disabled={isLoading || isUploading}
          >
            {isLoading ? '保存中...' : mode === 'create' ? '創建 Banner' : '更新 Banner'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BannerForm;