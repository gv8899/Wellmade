import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as crypto from 'crypto'; // Explicitly import crypto
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser'; // 我們也需要 cookie-parser
import { join } from 'path';
import { EnvironmentValidator } from './config/environment.validation';

console.log(
  'Is crypto (imported) defined in main.ts?',
  typeof crypto,
  typeof crypto?.randomUUID,
);

async function bootstrap() {
  // 在應用啟動前驗證環境變數
  try {
    EnvironmentValidator.validate();
    console.log(
      '[Bootstrap] Environment Summary:',
      EnvironmentValidator.getEnvironmentSummary(),
    );
  } catch (error) {
    console.error('[Bootstrap] Environment validation failed:', error.message);
    process.exit(1);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 靜態檔案服務已移至 UploadsController 處理
  // const uploadsPath = join(__dirname, '..', 'uploads');
  // console.log('靜態檔案路徑:', uploadsPath);
  // app.useStaticAssets(uploadsPath, {
  //   prefix: '/uploads',
  // });

  // 啟用全局 CORS，並配置允許憑證、前端域名等
  const allowedOrigins = [
    // 本地開發環境
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:50046',
    // 生產環境域名
    'https://wellmade.select',
    'https://www.wellmade.select',
  ];

  // 如果有環境變數指定的前端 URL，也加入允許清單
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  // Zeabur 預設域名支援
  if (process.env.ZEABUR_SERVICE_URL) {
    allowedOrigins.push(`https://${process.env.ZEABUR_SERVICE_URL}`);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // 允許無 origin 的請求（例如 Postman、行動應用）
      if (!origin) return callback(null, true);

      // 檢查是否在允許清單中
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // 允許所有 *.zeabur.app 子域名
      if (origin.endsWith('.zeabur.app')) {
        return callback(null, true);
      }

      // 開發環境允許所有請求
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // 配置 Cookie 解析
  app.use(cookieParser());

  // 配置 Session 中間件
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'wellmade-session-secret',
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 天
      },
      name: 'wellmade.sid',
    }),
  );

  // 啟用全局驗證管道，用於 DTO 驗證
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 過濾掉不在 DTO 中的屬性
      forbidNonWhitelisted: true, // 如果提供了不在 DTO 中的屬性，則拋出錯誤
      transform: true, // 自動轉換類型，例如將字符串轉換為數字
      disableErrorMessages: false, // 確保錯誤信息被返回
      validationError: { target: false },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints || {};
          const property = error.property;
          const value = error.value;
          console.error(
            `驗證錯誤 - 屬性: ${property}, 值: ${value}, 約束: ${JSON.stringify(constraints)}`,
          );
          return `${property}: ${Object.values(constraints).join(', ')}`;
        });
        const { BadRequestException } = require('@nestjs/common');
        return new BadRequestException(messages);
      },
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

  await app.listen(process.env.PORT ?? 3003, '0.0.0.0');
  console.log(`應用已啟動在: http://localhost:${process.env.PORT ?? 3003}`);
  console.log(`部署時間: ${new Date().toISOString()}`);
}
bootstrap();
