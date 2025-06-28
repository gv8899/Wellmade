import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NewebpayUtils } from './newebpay.utils';
import {
  NewebpayConfig,
  NewebpayTradeInfo,
  PaymentData,
  NewebpayCallbackData,
  CallbackResult,
} from './newebpay.types';
import { Order } from '../../orders/entities/order.entity';

interface PaymentRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

interface PaymentError {
  code: string;
  message: string;
  retryable: boolean;
}

@Injectable()
export class NewebpayService {
  private readonly logger = new Logger(NewebpayService.name);
  private config: NewebpayConfig;
  private readonly DEFAULT_RETRY_OPTIONS: PaymentRetryOptions = {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    backoffMultiplier: 2,
  };

  constructor(private configService: ConfigService) {
    this.config = {
      merchantId: this.configService.get<string>('NEWEBPAY_MERCHANT_ID'),
      hashKey: this.configService.get<string>('NEWEBPAY_HASH_KEY'),
      hashIV: this.configService.get<string>('NEWEBPAY_HASH_IV'),
      apiUrl: this.configService.get<string>('NEWEBPAY_API_URL'),
      returnUrl: this.configService.get<string>('NEWEBPAY_RETURN_URL'),
      notifyUrl: this.configService.get<string>('NEWEBPAY_NOTIFY_URL'),
      clientBackUrl: this.configService.get<string>('NEWEBPAY_CLIENT_BACK_URL'),
    };

    // 驗證必要配置
    this.validateConfig();
  }

  /**
   * 建立信用卡付款資料
   */
  createCreditCardPayment(order: Order): PaymentData {
    try {
      this.logger.log(
        `Creating credit card payment for order: ${order.orderNumber}`,
      );

      this.validateOrder(order);

      const tradeInfo = this.buildTradeInfo(order, {
        CREDIT: 1, // 啟用信用卡
        LoginType: 0, // 不需登入藍新金流會員
      });

      const paymentData = this.encryptPaymentData(tradeInfo);

      this.logger.log(
        `Credit card payment data created successfully for order: ${order.orderNumber}`,
      );
      return paymentData;
    } catch (error) {
      this.logger.error(
        `Failed to create credit card payment for order: ${order.orderNumber}`,
        error.stack,
      );
      throw this.handlePaymentError(error, 'CREDIT_CARD_CREATION_FAILED');
    }
  }

  /**
   * 建立 LINE Pay 付款資料
   */
  createLinePayPayment(order: Order): PaymentData {
    try {
      this.logger.log(
        `Creating LINE Pay payment for order: ${order.orderNumber}`,
      );

      this.validateOrder(order);

      const tradeInfo = this.buildTradeInfo(order, {
        LINEPAY: 1, // 啟用 LINE Pay
        LoginType: 0,
      });

      const paymentData = this.encryptPaymentData(tradeInfo);

      this.logger.log(
        `LINE Pay payment data created successfully for order: ${order.orderNumber}`,
      );
      return paymentData;
    } catch (error) {
      this.logger.error(
        `Failed to create LINE Pay payment for order: ${order.orderNumber}`,
        error.stack,
      );
      throw this.handlePaymentError(error, 'LINE_PAY_CREATION_FAILED');
    }
  }

  /**
   * 處理付款回調
   */
  handleCallback(encryptedTradeInfo: string, tradeSha: string): CallbackResult {
    try {
      this.logger.log('Processing payment callback');

      if (!encryptedTradeInfo || !tradeSha) {
        this.logger.error('Missing callback parameters');
        return {
          success: false,
          orderId: '',
          error: 'Missing callback parameters',
        };
      }

      // 驗證簽章
      const isValid = NewebpayUtils.verifyCallback(
        encryptedTradeInfo,
        tradeSha,
        this.config.hashKey,
        this.config.hashIV,
      );

      if (!isValid) {
        this.logger.error('Invalid callback signature');
        return {
          success: false,
          orderId: '',
          error: 'Invalid signature',
        };
      }

      // 解密資料
      const callbackData: NewebpayCallbackData =
        NewebpayUtils.parseCallbackData(
          encryptedTradeInfo,
          this.config.hashKey,
          this.config.hashIV,
        );

      this.logger.log(
        `Callback data parsed for order: ${callbackData.Result?.MerchantOrderNo || 'Unknown'}`,
      );

      if (callbackData.Status !== 'SUCCESS') {
        this.logger.warn(
          `Payment failed for order: ${callbackData.Result?.MerchantOrderNo || 'Unknown'}, reason: ${callbackData.Message}`,
        );
        return {
          success: false,
          orderId: callbackData.Result?.MerchantOrderNo || '',
          error: callbackData.Message,
        };
      }

      this.logger.log(
        `Payment successful for order: ${callbackData.Result.MerchantOrderNo}`,
      );
      return {
        success: true,
        orderId: callbackData.Result.MerchantOrderNo,
        transactionId: callbackData.Result.TradeNo,
        paymentType: callbackData.Result.PaymentType,
        payTime: callbackData.Result.PayTime,
        amount: callbackData.Result.Amt,
      };
    } catch (error) {
      this.logger.error('Error processing payment callback', error.stack);
      return {
        success: false,
        orderId: '',
        error: error.message,
      };
    }
  }

  /**
   * 查詢交易狀態
   */
  async queryTransaction(orderId: string): Promise<any> {
    // TODO: 實作查詢交易 API
    // 藍新金流提供查詢 API，但需要另外申請權限
    throw new Error('Not implemented');
  }

  /**
   * 建立交易資料
   */
  private buildTradeInfo(
    order: Order,
    paymentOptions: Partial<NewebpayTradeInfo>,
  ): NewebpayTradeInfo {
    const baseTradeInfo: NewebpayTradeInfo = {
      MerchantID: this.config.merchantId,
      MerchantOrderNo: order.orderNumber,
      Amt: Math.round(order.total), // 金額必須是整數
      ItemDesc: `Wellmade 訂單 #${order.orderNumber}`,
      TimeStamp: NewebpayUtils.getTimestamp(),
      Version: '2.0',
      RespondType: 'JSON',
      NotifyURL: this.config.notifyUrl,
      ReturnURL: this.config.returnUrl,
      ClientBackURL: this.config.clientBackUrl,
      Email: order.customerInfo.email,
      LoginType: 0,
      ExpireDate: this.getExpireDate(), // 付款期限
    };

    return { ...baseTradeInfo, ...paymentOptions };
  }

  /**
   * 加密付款資料
   */
  private encryptPaymentData(tradeInfo: NewebpayTradeInfo): PaymentData {
    // 將交易資料轉為查詢字串
    const queryString = NewebpayUtils.buildQueryString(tradeInfo);

    // AES 加密
    const encryptedTradeInfo = NewebpayUtils.encrypt(
      queryString,
      this.config.hashKey,
      this.config.hashIV,
    );

    // SHA256 雜湊
    const tradeSha = NewebpayUtils.hash(
      encryptedTradeInfo,
      this.config.hashKey,
      this.config.hashIV,
    );

    return {
      MerchantID: this.config.merchantId,
      TradeInfo: encryptedTradeInfo,
      TradeSha: tradeSha,
      Version: '2.0',
    };
  }

  /**
   * 取得付款期限（預設 7 天後）
   */
  private getExpireDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  /**
   * 取得 API URL
   */
  getApiUrl(): string {
    return this.config.apiUrl;
  }

  /**
   * 驗證配置是否完整
   */
  private validateConfig(): void {
    const requiredConfigs = [
      'merchantId',
      'hashKey',
      'hashIV',
      'apiUrl',
      'returnUrl',
      'notifyUrl',
      'clientBackUrl',
    ];

    for (const config of requiredConfigs) {
      if (!this.config[config]) {
        throw new HttpException(
          `Missing required Newebpay configuration: ${config}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * 驗證訂單資料
   */
  private validateOrder(order: Order): void {
    if (!order) {
      throw new HttpException('Order is required', HttpStatus.BAD_REQUEST);
    }

    if (!order.orderNumber) {
      throw new HttpException(
        'Order number is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!order.total || order.total <= 0) {
      throw new HttpException(
        'Order total must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!order.customerInfo?.email) {
      throw new HttpException(
        'Customer email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 驗證金額是否為正整數（藍新金流要求）
    if (!Number.isInteger(order.total) || order.total < 1) {
      throw new HttpException(
        'Order total must be a positive integer',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 統一錯誤處理
   */
  private handlePaymentError(error: any, context: string): HttpException {
    if (error instanceof HttpException) {
      return error;
    }

    this.logger.error(`Payment error in ${context}:`, error);

    // 根據錯誤類型決定 HTTP 狀態碼
    if (
      error.message?.includes('validation') ||
      error.message?.includes('required')
    ) {
      return new HttpException(
        `Payment validation failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      error.message?.includes('config') ||
      error.message?.includes('configuration')
    ) {
      return new HttpException(
        'Payment service configuration error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return new HttpException(
      'Payment processing failed',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * 帶重試機制的支付操作
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: PaymentRetryOptions = {},
    context: string = 'payment_operation',
  ): Promise<T> {
    const finalOptions = { ...this.DEFAULT_RETRY_OPTIONS, ...options };
    let lastError: Error;

    for (let attempt = 1; attempt <= finalOptions.maxRetries; attempt++) {
      try {
        this.logger.log(
          `Executing ${context}, attempt ${attempt}/${finalOptions.maxRetries}`,
        );
        return await operation();
      } catch (error) {
        lastError = error;

        this.logger.warn(
          `${context} failed on attempt ${attempt}/${finalOptions.maxRetries}: ${error.message}`,
        );

        // 檢查是否為可重試的錯誤
        if (
          !this.isRetryableError(error) ||
          attempt === finalOptions.maxRetries
        ) {
          break;
        }

        // 計算延遲時間（指數退避）
        const delay =
          finalOptions.retryDelay *
          Math.pow(finalOptions.backoffMultiplier, attempt - 1);
        this.logger.log(`Retrying ${context} in ${delay}ms`);

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * 判斷錯誤是否可重試
   */
  private isRetryableError(error: any): boolean {
    // 網路相關錯誤可重試
    if (
      error.code === 'ECONNRESET' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT'
    ) {
      return true;
    }

    // 5xx 伺服器錯誤可重試
    if (error.status >= 500 && error.status < 600) {
      return true;
    }

    // 429 Too Many Requests 可重試
    if (error.status === 429) {
      return true;
    }

    // 4xx 客戶端錯誤通常不可重試
    if (error.status >= 400 && error.status < 500) {
      return false;
    }

    // 驗證錯誤不可重試
    if (
      error.message?.includes('validation') ||
      error.message?.includes('invalid')
    ) {
      return false;
    }

    // 其他錯誤可重試
    return true;
  }

  /**
   * 延遲執行
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 檢查支付狀態（用於超時檢查）
   */
  async checkPaymentTimeout(
    _orderId: string,
    timeoutMinutes: number = 15,
  ): Promise<boolean> {
    try {
      // 這裡應該調用藍新金流的查詢 API 檢查支付狀態
      // 目前先返回 false，表示尚未實作
      this.logger.log(
        `Checking payment timeout for order: ${_orderId}, timeout: ${timeoutMinutes} minutes`,
      );
      return false;
    } catch (error) {
      this.logger.error(
        `Failed to check payment timeout for order: ${_orderId}`,
        error.stack,
      );
      return true; // 發生錯誤時假設已超時
    }
  }

  /**
   * 取得錯誤詳情
   */
  getPaymentErrorDetails(errorCode: string): PaymentError {
    const errorMap: Record<string, PaymentError> = {
      CREDIT_CARD_CREATION_FAILED: {
        code: 'CREDIT_CARD_CREATION_FAILED',
        message: '信用卡付款資料創建失敗',
        retryable: true,
      },
      LINE_PAY_CREATION_FAILED: {
        code: 'LINE_PAY_CREATION_FAILED',
        message: 'LINE Pay 付款資料創建失敗',
        retryable: true,
      },
      CALLBACK_PROCESSING_FAILED: {
        code: 'CALLBACK_PROCESSING_FAILED',
        message: '付款回調處理失敗',
        retryable: false,
      },
      INVALID_SIGNATURE: {
        code: 'INVALID_SIGNATURE',
        message: '付款簽章驗證失敗',
        retryable: false,
      },
      PAYMENT_TIMEOUT: {
        code: 'PAYMENT_TIMEOUT',
        message: '付款逾時',
        retryable: true,
      },
    };

    return (
      errorMap[errorCode] || {
        code: 'UNKNOWN_ERROR',
        message: '未知的付款錯誤',
        retryable: false,
      }
    );
  }
}
