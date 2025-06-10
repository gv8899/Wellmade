import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as crypto from 'crypto'; // Explicitly import crypto

console.log('Is crypto (imported) defined in main.ts?', typeof crypto, typeof crypto?.randomUUID);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 啟用全局 CORS，並配置允許憑證、前端域名等
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:50046'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // 啟用全局驗證管道，用於 DTO 驗證
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 過濾掉不在 DTO 中的屬性
      forbidNonWhitelisted: true, // 如果提供了不在 DTO 中的屬性，則拋出錯誤
      transform: true, // 自動轉換類型，例如將字符串轉換為數字
    }),
  );
  
  // 設定 Swagger
  const config = new DocumentBuilder()
    .setTitle('Wellmade API')
    .setDescription('Wellmade 電子商務平台 API')
    .setVersion('1.0')
    .addTag('products', '產品相關操作')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // API 文檔將在 /api 路徑可訪問
  
  await app.listen(process.env.PORT ?? 3003);
  console.log(`應用已啟動在: ${await app.getUrl()}`);
}
bootstrap();
