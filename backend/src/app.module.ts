import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available throughout the application
      envFilePath: '/Users/mike/CascadeProjects/Wellmade-old-version/backend/.env', // Use absolute path
    }),
    ProductsModule,
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
          entities: [], // Entities are now registered via feature modules
          synchronize: true, // Auto-creates DB tables based on entities (dev only!)
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
