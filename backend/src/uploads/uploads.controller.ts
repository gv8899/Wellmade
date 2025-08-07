import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

@Controller('uploads')
export class UploadsController {
  private readonly uploadsPath: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsPath =
      this.configService.get<string>('UPLOAD_PATH') ||
      path.join(process.cwd(), 'uploads');
  }

  @Get(':filename')
  @Public()
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const filePath = path.join(this.uploadsPath, filename);

      // 檢查檔案是否存在
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('File not found');
      }

      // 安全檢查：確保請求的檔案在 uploads 目錄內
      const resolvedPath = path.resolve(filePath);
      const uploadsResolvedPath = path.resolve(this.uploadsPath);

      if (!resolvedPath.startsWith(uploadsResolvedPath)) {
        throw new NotFoundException('File not found');
      }

      // 設定適當的 Content-Type
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';

      switch (ext) {
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.webp':
          contentType = 'image/webp';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache

      return res.sendFile(filePath);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }
}
