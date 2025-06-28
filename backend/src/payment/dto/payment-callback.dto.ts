import { IsString } from 'class-validator';

export class PaymentCallbackDto {
  @IsString()
  TradeInfo: string;

  @IsString()
  TradeSha: string;

  @IsString()
  Status: string;

  @IsString()
  MerchantID: string;

  @IsString()
  Version: string;
}
