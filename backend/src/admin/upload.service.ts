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
    const patterns = [
      `${filename}-original.*`,
      `${filename}-thumb.webp`,
      `${filename}-medium.webp`,
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
