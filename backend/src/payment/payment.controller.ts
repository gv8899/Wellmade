import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * 建立付款
   * 前端呼叫此 API 後，需要將返回的資料 POST 到藍新金流
   */
  @Post('create')
  @HttpCode(HttpStatus.OK)
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  /**
   * 藍新金流付款結果通知（背景通知）
   * 此端點會被藍新金流呼叫，用於更新訂單狀態
   */
  @Post('notify')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleNotify(@Body() callbackDto: PaymentCallbackDto) {
    const result = await this.paymentService.handleCallback(callbackDto);

    // 藍新金流需要返回純文字
    if (result.success) {
      return 'SUCCESS';
    } else {
      return 'FAIL';
    }
  }

  /**
   * 付款完成返回（前景通知）
   * 用戶完成付款後會被導向到此頁面
   */
  @Post('return')
  @Public()
  async handleReturn(
    @Body() callbackDto: PaymentCallbackDto,
    @Res() res: Response,
  ) {
    // 處理回調
    await this.paymentService.handleCallback(callbackDto);

    // 重導向到前端結果頁面
    const clientBackUrl = process.env.NEWEBPAY_CLIENT_BACK_URL;
    if (!clientBackUrl) {
      console.error('NEWEBPAY_CLIENT_BACK_URL environment variable is required');
      res.status(500).send('Configuration error');
      return;
    }
    res.redirect(clientBackUrl);
  }

  /**
   * 查詢付款狀態
   */
  @Get('status/:orderId')
  async getPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentStatus(orderId);
  }

  /**
   * 重試付款
   */
  @Post('retry')
  @HttpCode(HttpStatus.OK)
  async retryPayment(@Body() dto: { orderId: string; paymentMethod: string }) {
    return this.paymentService.retryPayment(dto.orderId, dto.paymentMethod);
  }

  /**
   * 檢查付款超時
   */
  @Get('timeout/:orderId')
  async checkPaymentTimeout(@Param('orderId') orderId: string) {
    return this.paymentService.checkPaymentTimeout(orderId);
  }

  /**
   * 取消付款
   */
  @Post('cancel/:orderId')
  @HttpCode(HttpStatus.OK)
  async cancelPayment(@Param('orderId') orderId: string) {
    return this.paymentService.cancelPayment(orderId);
  }
}
