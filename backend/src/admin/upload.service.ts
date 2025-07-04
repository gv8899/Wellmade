import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadPath: string;
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  constructor(private readonly configService: ConfigService) {
    // 從環境變數或預設路徑設定上傳目錄
    this.uploadPath = this.configService.get<string>('UPLOAD_PATH') || path.join(process.cwd(), 'uploads');
    this.ensureUploadDirectoryExists();
  }

  private async ensureUploadDirectoryExists() {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<{
    original: string;
    thumbnail: string;
    medium: string;
    url: string;
    filename: string;
    size: number;
  }> {
    // 驗證檔案
    this.validateFile(file);

    // 生成唯一檔名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const baseFilename = `${timestamp}-${randomString}`;

    // 檔案路徑
    const originalPath = path.join(
      this.uploadPath,
      `${baseFilename}-original${fileExtension}`,
    );
    const thumbnailPath = path.join(
      this.uploadPath,
      `${baseFilename}-thumb.webp`,
    );
    const mediumPath = path.join(
      this.uploadPath,
      `${baseFilename}-medium.webp`,
    );

    try {
      // 保存原圖
      await fs.writeFile(originalPath, file.buffer);

      // 生成縮圖 (150x150)
      await sharp(file.buffer)
        .resize(150, 150, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 80 })
        .toFile(thumbnailPath);

      // 生成中等尺寸 (800x800)
      await sharp(file.buffer)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toFile(mediumPath);

      const baseUrl = this.configService.get<string>('BASE_URL');
      if (!baseUrl) {
        throw new BadRequestException('BASE_URL environment variable is required');
      }

      return {
        original: `${baseUrl}/uploads/${path.basename(originalPath)}`,
        thumbnail: `${baseUrl}/uploads/${path.basename(thumbnailPath)}`,
        medium: `${baseUrl}/uploads/${path.basename(mediumPath)}`,
        url: `${baseUrl}/uploads/${path.basename(mediumPath)}`, // 預設使用中等尺寸
        filename: baseFilename,
        size: file.size,
      };
    } catch (error) {
      // 清理可能已創建的檔案
      await this.cleanupFiles([originalPath, thumbnailPath, mediumPath]);
      throw new BadRequestException(
        `Image processing failed: ${error.message}`,
      );
    }
  }

  async uploadBannerImage(file: Express.Multer.File): Promise<{
    original: string;
    thumbnail: string;
    medium: string;
    large: string;
    desktop: string;
    mobile: string;
    url: string;
    filename: string;
    size: number;
  }> {
    // 驗證檔案
    this.validateFile(file);

    // 生成唯一檔名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const baseFilename = `banner-${timestamp}-${randomString}`;

    // 檔案路徑
    const originalPath = path.join(
      this.uploadPath,
      `${baseFilename}-original${fileExtension}`,
    );
    const thumbnailPath = path.join(
      this.uploadPath,
      `${baseFilename}-thumb.webp`,
    );
    const mediumPath = path.join(
      this.uploadPath,
      `${baseFilename}-medium.webp`,
    );
    const largePath = path.join(
      this.uploadPath,
      `${baseFilename}-large.webp`,
    );
    const desktopPath = path.join(
      this.uploadPath,
      `${baseFilename}-desktop.webp`,
    );
    const mobilePath = path.join(
      this.uploadPath,
      `${baseFilename}-mobile.webp`,
    );

    try {
      // 保存原圖
      await fs.writeFile(originalPath, file.buffer);

      // 生成縮圖 (200x100) - Banner 預覽用
      await sharp(file.buffer)
        .resize(200, 100, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 85 })
        .toFile(thumbnailPath);

      // 生成中等尺寸 (1200x600) - 平板用
      await sharp(file.buffer)
        .resize(1200, 600, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 90 })
        .toFile(mediumPath);

      // 生成大尺寸 (1600x800) - 高解析度顯示
      await sharp(file.buffer)
        .resize(1600, 800, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 92 })
        .toFile(largePath);

      // 生成桌面版 (1920x960) - 全幅 Banner
      await sharp(file.buffer)
        .resize(1920, 960, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 95 })
        .toFile(desktopPath);

      // 生成手機版 (750x400) - 移動端優化
      await sharp(file.buffer)
        .resize(750, 400, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 88 })
        .toFile(mobilePath);

      const baseUrl = this.configService.get<string>('BASE_URL');
      if (!baseUrl) {
        throw new BadRequestException('BASE_URL environment variable is required');
      }

      return {
        original: `${baseUrl}/uploads/${path.basename(originalPath)}`,
        thumbnail: `${baseUrl}/uploads/${path.basename(thumbnailPath)}`,
        medium: `${baseUrl}/uploads/${path.basename(mediumPath)}`,
        large: `${baseUrl}/uploads/${path.basename(largePath)}`,
        desktop: `${baseUrl}/uploads/${path.basename(desktopPath)}`,
        mobile: `${baseUrl}/uploads/${path.basename(mobilePath)}`,
        url: `${baseUrl}/uploads/${path.basename(desktopPath)}`, // 預設使用桌面版
        filename: baseFilename,
        size: file.size,
      };
    } catch (error) {
      // 清理可能已創建的檔案
      await this.cleanupFiles([
        originalPath, 
        thumbnailPath, 
        mediumPath, 
        largePath, 
        desktopPath, 
        mobilePath
      ]);
      throw new BadRequestException(
        `Banner image processing failed: ${error.message}`,
      );
    }
  }

  async uploadImages(files: Express.Multer.File[]): Promise<{
    images: Array<{
      original: string;
      thumbnail: string;
      medium: string;
      url: string;
      filename: string;
      size: number;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const result = await this.uploadImage(file);
        results.push(result);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message,
        });
      }
    }

    if (errors.length > 0) {
      console.warn('Some files failed to upload:', errors);
    }

    return {
      images: results,
      summary: {
        total: files.length,
        successful: results.length,
        failed: errors.length,
      },
    };
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  private async cleanupFiles(filePaths: string[]) {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
      } catch {
        // 忽略刪除錯誤
      }
    }
  }

  async deleteImage(filename: string): Promise<void> {
    // 支援一般圖片和 Banner 圖片的刪除模式
    const patterns = [
      `${filename}-original.*`,
      `${filename}-thumb.webp`,
      `${filename}-medium.webp`,
      `${filename}-large.webp`,    // Banner 專用
      `${filename}-desktop.webp`,  // Banner 專用
      `${filename}-mobile.webp`,   // Banner 專用
    ];

    try {
      const files = await fs.readdir(this.uploadPath);
      for (const file of files) {
        for (const pattern of patterns) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          if (regex.test(file)) {
            await fs.unlink(path.join(this.uploadPath, file));
          }
        }
      }
    } catch (error) {
      console.warn(
        `Failed to delete image files for ${filename}:`,
        error.message,
      );
    }
  }
}
