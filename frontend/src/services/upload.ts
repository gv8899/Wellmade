import api from './api';

export interface UploadResponse {
  original: string;
  thumbnail: string;
  medium: string;
  url: string;
  filename: string;
  size: number;
}

export const uploadApi = {
  // 上傳單張圖片
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/admin/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // 驗證檔案是否為圖片
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // 檢查檔案類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: '不支援的檔案格式，請上傳 JPEG、PNG、WebP 或 GIF 格式的圖片'
      };
    }

    // 檢查檔案大小（10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: '檔案過大，請上傳小於 10MB 的圖片'
      };
    }

    return { valid: true };
  }
};