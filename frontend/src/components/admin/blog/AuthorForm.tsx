'use client';

import React, { useState, useEffect } from 'react';
import { Text, Card } from '@/design-system';
import { Author, CreateAuthorDto, UpdateAuthorDto, SocialLinks } from '@/types/blog';

interface AuthorFormProps {
  author?: Author;
  onSubmit: (data: CreateAuthorDto | UpdateAuthorDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const AuthorForm: React.FC<AuthorFormProps> = ({
  author,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    socialLinks: {
      website: '',
      instagram: '',
      linkedin: '',
      twitter: '',
    } as SocialLinks,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (author) {
      setFormData({
        name: author.name || '',
        email: author.email || '',
        bio: author.bio || '',
        avatar: author.avatar || '',
        socialLinks: {
          website: author.socialLinks?.website || '',
          instagram: author.socialLinks?.instagram || '',
          linkedin: author.socialLinks?.linkedin || '',
          twitter: author.socialLinks?.twitter || '',
        },
      });
    }
  }, [author]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // 驗證必填欄位
    if (!formData.name.trim()) {
      newErrors.name = '作者姓名為必填欄位';
    }

    // 驗證 email 格式
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '請輸入有效的電子郵件地址';
    }

    // 驗證 URL 格式
    const urlFields = ['avatar', 'website', 'instagram', 'linkedin', 'twitter'];
    urlFields.forEach(field => {
      const value = field === 'avatar' ? formData.avatar : formData.socialLinks[field as keyof SocialLinks];
      if (value && value.trim()) {
        try {
          new URL(value);
        } catch {
          newErrors[field] = '請輸入有效的 URL';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // 清除對應的錯誤訊息
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));

    // 清除對應的錯誤訊息
    if (errors[platform]) {
      setErrors(prev => ({
        ...prev,
        [platform]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // 準備提交的資料
    const submitData: CreateAuthorDto | UpdateAuthorDto = {
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      bio: formData.bio.trim() || undefined,
      avatar: formData.avatar.trim() || undefined,
    };

    // 處理社交連結（只包含有值的欄位）
    const socialLinks: SocialLinks = {};
    Object.entries(formData.socialLinks).forEach(([key, value]) => {
      if (value && value.trim()) {
        socialLinks[key as keyof SocialLinks] = value.trim();
      }
    });

    if (Object.keys(socialLinks).length > 0) {
      submitData.socialLinks = socialLinks;
    }

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Card variant="elevated" padding="large">
      <div className="flex items-center justify-between mb-6">
        <Text variant="title3" className="text-gray-900">
          {author ? '編輯作者' : '新增作者'}
        </Text>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 p-1"
          disabled={loading}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本資訊 */}
        <div className="space-y-4">
          <Text variant="subhead" className="text-gray-900 border-b border-gray-200 pb-2">
            基本資訊
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 作者姓名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作者姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="輸入作者姓名..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.name && (
                <Text variant="caption1" className="text-red-600 mt-1">
                  {errors.name}
                </Text>
              )}
            </div>

            {/* 電子郵件 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電子郵件
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="author@example.com"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.email && (
                <Text variant="caption1" className="text-red-600 mt-1">
                  {errors.email}
                </Text>
              )}
            </div>
          </div>

          {/* 作者簡介 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作者簡介
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="簡短介紹作者的背景和專長..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <Text variant="caption1" className="text-gray-500 mt-1">
              建議長度：100-200 字
            </Text>
          </div>

          {/* 頭像圖片 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              頭像圖片 URL
            </label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => handleInputChange('avatar', e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.avatar ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.avatar && (
              <Text variant="caption1" className="text-red-600 mt-1">
                {errors.avatar}
              </Text>
            )}
            <Text variant="caption1" className="text-gray-500 mt-1">
              建議尺寸：200x200 像素以上的正方形圖片
            </Text>
          </div>

          {/* 頭像預覽 */}
          {formData.avatar && !errors.avatar && (
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 relative rounded-full overflow-hidden bg-gray-200">
                <img
                  src={formData.avatar}
                  alt="頭像預覽"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <Text variant="body" className="text-gray-600">
                頭像預覽
              </Text>
            </div>
          )}
        </div>

        {/* 社交連結 */}
        <div className="space-y-4">
          <Text variant="subhead" className="text-gray-900 border-b border-gray-200 pb-2">
            社交連結
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 個人網站 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                個人網站
              </label>
              <input
                type="url"
                value={formData.socialLinks.website}
                onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.website ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.website && (
                <Text variant="caption1" className="text-red-600 mt-1">
                  {errors.website}
                </Text>
              )}
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={formData.socialLinks.instagram}
                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                placeholder="https://instagram.com/username"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.instagram ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.instagram && (
                <Text variant="caption1" className="text-red-600 mt-1">
                  {errors.instagram}
                </Text>
              )}
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.linkedin ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.linkedin && (
                <Text variant="caption1" className="text-red-600 mt-1">
                  {errors.linkedin}
                </Text>
              )}
            </div>

            {/* Twitter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                placeholder="https://twitter.com/username"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.twitter ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.twitter && (
                <Text variant="caption1" className="text-red-600 mt-1">
                  {errors.twitter}
                </Text>
              )}
            </div>
          </div>
        </div>

        {/* 提交按鈕 */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            取消
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={loading}
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            <span>{author ? '更新作者' : '創建作者'}</span>
          </button>
        </div>
      </form>
    </Card>
  );
};