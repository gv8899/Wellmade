import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as crypto from 'crypto'; // Explicitly import crypto

console.log('Is crypto (imported) defined in main.ts?', typeof crypto, typeof crypto?.randomUUID);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3003); // 更改這裡的連接埠號碼
}
bootstrap();
