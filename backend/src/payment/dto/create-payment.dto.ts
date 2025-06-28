import { IsUUID, IsEnum } from 'class-validator';
import { PaymentMethod } from '../../orders/entities/order.entity';

export class CreatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
