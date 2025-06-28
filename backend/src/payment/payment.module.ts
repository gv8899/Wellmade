import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { NewebpayService } from './newebpay/newebpay.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [ConfigModule, OrdersModule],
  providers: [PaymentService, NewebpayService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
