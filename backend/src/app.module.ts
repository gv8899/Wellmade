import { Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { CartsModule } from './carts/carts.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available throughout the application
      envFilePath: '.env', // Use relative path for better portability
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    BrandsModule,
    CartsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get<string>('DB_HOST');
        const dbPort = configService.get<number>('DB_PORT');
        const dbUser = configService.get<string>('DB_USER');
        const dbName = configService.get<string>('DB_NAME');
        console.log(`[AppModule] Attempting DB connection with: HOST='${dbHost}', PORT='${dbPort}', USER='${dbUser}', DBNAME='${dbName}'`);
        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUser,
          password: configService.get<string>('DB_PASSWORD'),
          database: dbName,
          entities: [__dirname + '/**/*.entity{.ts,.js}'], // 自動載入所有實體
          synchronize: true, // 暫時啟用自動同步，以便建立資料表結構
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // Strip properties that do not have decorators
        transform: true, // Transform payloads to be objects typed according to their DTO classes
        forbidNonWhitelisted: true, // Throw errors if non-whitelisted values are provided
      }),
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Apply JWT authentication globally
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Apply role-based authorization globally
    },
  ],
})
export class AppModule {}
