import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { NewebpayService } from './newebpay/newebpay.service';
import { OrdersService } from '../orders/orders.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { PaymentData } from './newebpay/newebpay.types';
import { PaymentStatus } from '../orders/entities/order.entity';
import { PaymentRecordStatus } from '../orders/entities/payment-record.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private newebpayService: NewebpayService,
    private ordersService: OrdersService,
  ) {}

  /**
   * 建立付款
   */
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<{
    paymentData: PaymentData;
    apiUrl: string;
  }> {
    return await this.newebpayService.executeWithRetry(
      async () => {
        const { orderId, paymentMethod } = createPaymentDto;

        this.logger.log(
          `Creating payment for order: ${orderId}, method: ${paymentMethod}`,
        );

        // 查詢訂單
        const order = await this.ordersService.findOne(orderId);
        if (!order) {
          throw new NotFoundException('Order not found');
        }

        // 檢查訂單狀態
        if (order.paymentStatus !== PaymentStatus.PENDING) {
          throw new BadRequestException(
            'Order has already been paid or cancelled',
          );
        }

        // 建立付款記錄
        const paymentRecord = await this.ordersService.createPaymentRecord(
          orderId,
          paymentMethod,
          order.total,
        );

        // 根據付款方式建立付款資料
        let paymentData: PaymentData;
        try {
          switch (paymentMethod) {
            case 'credit_card':
              paymentData = this.newebpayService.createCreditCardPayment(order);
              break;
            case 'line_pay':
              paymentData = this.newebpayService.createLinePayPayment(order);
              break;
            default:
              throw new BadRequestException('Invalid payment method');
          }
        } catch (error) {
          // 付款資料創建失敗時，更新付款記錄狀態
          await this.ordersService.updatePaymentRecord(paymentRecord.id, {
            status: PaymentRecordStatus.FAILED,
            responseData: { error: error.message },
          });
          throw error;
        }

        // 更新付款記錄，儲存請求資料
        await this.ordersService.updatePaymentRecord(paymentRecord.id, {
          requestData: { paymentData },
        });

        this.logger.log(`Payment created successfully for order: ${orderId}`);
        return {
          paymentData,
          apiUrl: this.newebpayService.getApiUrl(),
        };
      },
      { maxRetries: 2, retryDelay: 500 },
      'create_payment',
    );
  }

  /**
   * 處理付款回調（來自藍新金流）
   */
  async handleCallback(callbackDto: PaymentCallbackDto): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { TradeInfo, TradeSha } = callbackDto;

      this.logger.log('Processing payment callback');

      // 處理回調資料
      const result = this.newebpayService.handleCallback(TradeInfo, TradeSha);

      if (!result.success) {
        this.logger.error('Payment callback failed:', result.error);
        return {
          success: false,
          message: result.error || 'Payment failed',
        };
      }

      // 使用重試機制更新訂單狀態
      return await this.newebpayService.executeWithRetry(
        async () => {
          // 根據訂單編號查詢訂單
          const order = await this.ordersService.findByOrderNumber(
            result.orderId,
          );

          // 查詢最新的付款記錄
          const paymentRecord = order.paymentRecords?.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
          )[0];

          if (paymentRecord) {
            // 更新付款記錄
            await this.ordersService.updatePaymentRecord(paymentRecord.id, {
              status: PaymentRecordStatus.SUCCESS,
              transactionId: result.transactionId,
              responseData: result,
            });
          }

          // 更新訂單付款狀態
          await this.ordersService.updatePaymentStatus(
            order.id,
            PaymentStatus.PAID,
          );

          this.logger.log(
            `Payment callback processed successfully for order: ${result.orderId}`,
          );
          return {
            success: true,
            message: 'Payment successful',
          };
        },
        { maxRetries: 3, retryDelay: 1000 },
        'handle_callback',
      );
    } catch (error) {
      this.logger.error('Error processing payment callback:', error.stack);
      return {
        success: false,
        message: 'Failed to process payment callback',
      };
    }
  }

  /**
   * 處理付款返回（用戶返回商店）
   */
  async handleReturn(orderId: string): Promise<{
    order: any;
    redirectUrl: string;
  }> {
    const order = await this.ordersService.findByOrderNumber(orderId);

    // 根據付款狀態決定重導向的頁面
    const redirectUrl =
      order.paymentStatus === PaymentStatus.PAID
        ? `/checkout/success?orderId=${order.orderNumber}`
        : `/checkout/failed?orderId=${order.orderNumber}`;

    return {
      order,
      redirectUrl,
    };
  }

  /**
   * 查詢付款狀態
   */
  async getPaymentStatus(orderId: string): Promise<{
    orderId: string;
    paymentStatus: PaymentStatus;
    paymentRecords: any[];
  }> {
    const order = await this.ordersService.findOne(orderId);

    return {
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      paymentRecords: order.paymentRecords || [],
    };
  }

  /**
   * 重試付款
   */
  async retryPayment(
    orderId: string,
    paymentMethod: string,
  ): Promise<{
    paymentData: PaymentData;
    apiUrl: string;
  }> {
    try {
      this.logger.log(
        `Retrying payment for order: ${orderId}, method: ${paymentMethod}`,
      );

      const order = await this.ordersService.findOne(orderId);
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // 檢查訂單是否可以重試付款
      if (order.paymentStatus === PaymentStatus.PAID) {
        throw new BadRequestException('Order has already been paid');
      }

      // 將失敗的付款記錄標記為已取消
      const failedPayments = order.paymentRecords?.filter(
        (record) => record.status === PaymentRecordStatus.FAILED,
      );

      for (const payment of failedPayments || []) {
        await this.ordersService.updatePaymentRecord(payment.id, {
          status: PaymentRecordStatus.CANCELLED,
        });
      }

      // 創建新的付款
      return await this.createPayment({
        orderId,
        paymentMethod: paymentMethod as any,
      });
    } catch (error) {
      this.logger.error(
        `Failed to retry payment for order: ${orderId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 檢查付款超時
   */
  async checkPaymentTimeout(orderId: string): Promise<{
    isTimeout: boolean;
    message: string;
  }> {
    try {
      const order = await this.ordersService.findOne(orderId);
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // 如果已經付款成功，不算超時
      if (order.paymentStatus === PaymentStatus.PAID) {
        return {
          isTimeout: false,
          message: 'Payment completed',
        };
      }

      // 檢查最近的付款記錄
      const latestPayment = order.paymentRecords?.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      )[0];

      if (!latestPayment) {
        return {
          isTimeout: false,
          message: 'No payment record found',
        };
      }

      // 檢查是否超過 15 分鐘
      const timeoutMinutes = 15;
      const timeoutMs = timeoutMinutes * 60 * 1000;
      const timeSinceCreated = Date.now() - latestPayment.createdAt.getTime();

      const isTimeout = timeSinceCreated > timeoutMs;

      if (isTimeout) {
        // 將超時的付款記錄標記為失敗
        await this.ordersService.updatePaymentRecord(latestPayment.id, {
          status: PaymentRecordStatus.FAILED,
          responseData: { error: 'Payment timeout' },
        });

        this.logger.warn(
          `Payment timeout for order: ${orderId}, payment record: ${latestPayment.id}`,
        );
      }

      return {
        isTimeout,
        message: isTimeout
          ? `Payment timeout after ${timeoutMinutes} minutes`
          : 'Payment is still valid',
      };
    } catch (error) {
      this.logger.error(
        `Error checking payment timeout for order: ${orderId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 取消付款
   */
  async cancelPayment(orderId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      this.logger.log(`Cancelling payment for order: ${orderId}`);

      const order = await this.ordersService.findOne(orderId);
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // 檢查訂單狀態
      if (order.paymentStatus === PaymentStatus.PAID) {
        throw new BadRequestException('Cannot cancel paid order');
      }

      // 取消所有進行中的付款記錄
      const pendingPayments = order.paymentRecords?.filter(
        (record) => record.status === PaymentRecordStatus.PENDING,
      );

      for (const payment of pendingPayments || []) {
        await this.ordersService.updatePaymentRecord(payment.id, {
          status: PaymentRecordStatus.CANCELLED,
          responseData: { reason: 'User cancelled' },
        });
      }

      // 更新訂單狀態為已取消
      await this.ordersService.updatePaymentStatus(
        order.id,
        PaymentStatus.FAILED,
      );

      this.logger.log(`Payment cancelled successfully for order: ${orderId}`);
      return {
        success: true,
        message: 'Payment cancelled successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to cancel payment for order: ${orderId}`,
        error.stack,
      );
      throw error;
    }
  }
}
