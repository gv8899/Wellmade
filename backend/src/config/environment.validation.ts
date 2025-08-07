import { BadRequestException } from '@nestjs/common';

/**
 * 環境變數驗證器
 * 確保關鍵環境變數在應用啟動時就存在
 */
export class EnvironmentValidator {
  /**
   * 驗證必需的環境變數
   */
  static validate(): void {
    const isProduction = process.env.NODE_ENV === 'production';

    // 所有環境都需要的變數
    const requiredEnvVars = [
      'DB_HOST',
      'DB_PORT',
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
      'JWT_SECRET',
      'JWT_EXPIRES_IN',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
    ];

    // 生產環境額外需要的變數
    const productionRequiredEnvVars = [
      'BASE_URL',
      'FRONTEND_URL',
      'NEWEBPAY_CLIENT_BACK_URL',
      'GOOGLE_CALLBACK_URL',
    ];

    const envVarsToCheck = isProduction
      ? [...requiredEnvVars, ...productionRequiredEnvVars]
      : requiredEnvVars;

    const missingVars = envVarsToCheck.filter((varName) => {
      const value = process.env[varName];
      return !value || value.trim() === '';
    });

    if (missingVars.length > 0) {
      const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
      console.error(`[EnvironmentValidator] ${errorMessage}`);

      if (isProduction) {
        throw new Error(errorMessage);
      } else {
        console.warn(`[EnvironmentValidator] Warning: ${errorMessage}`);
        console.warn(
          '[EnvironmentValidator] Application may not work correctly in production',
        );
      }
    }

    // 驗證資料庫連接相關配置
    this.validateDatabaseConfig();

    // 驗證 JWT 配置
    this.validateJwtConfig();

    console.log(
      '[EnvironmentValidator] Environment validation completed successfully',
    );
  }

  /**
   * 驗證資料庫配置
   */
  private static validateDatabaseConfig(): void {
    const dbPort = parseInt(process.env.DB_PORT || '5432');
    if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
      throw new Error('DB_PORT must be a valid port number (1-65535)');
    }
  }

  /**
   * 驗證 JWT 配置
   */
  private static validateJwtConfig(): void {
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
      console.warn(
        '[EnvironmentValidator] JWT_SECRET should be at least 32 characters long for security',
      );
    }

    const jwtExpires = process.env.JWT_EXPIRES_IN;
    if (jwtExpires && !['1h', '1d', '7d', '30d'].includes(jwtExpires)) {
      console.warn(
        '[EnvironmentValidator] JWT_EXPIRES_IN format should be like "1h", "1d", "7d", "30d"',
      );
    }
  }

  /**
   * 取得環境資訊摘要（用於日誌）
   */
  static getEnvironmentSummary(): Record<string, any> {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      nodeEnv: process.env.NODE_ENV || 'development',
      isProduction,
      dbHost: process.env.DB_HOST || 'NOT_SET',
      dbPort: process.env.DB_PORT || 'NOT_SET',
      dbName: process.env.DB_NAME || 'NOT_SET',
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasGoogleOAuth: !!(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
      baseUrl: process.env.BASE_URL || 'NOT_SET',
      frontendUrl: process.env.FRONTEND_URL || 'NOT_SET',
      uploadPath: process.env.UPLOAD_PATH || `${process.cwd()}/uploads`,
    };
  }
}
