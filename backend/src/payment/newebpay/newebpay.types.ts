export interface NewebpayConfig {
  merchantId: string;
  hashKey: string;
  hashIV: string;
  apiUrl: string;
  returnUrl: string;
  notifyUrl: string;
  clientBackUrl: string;
}

export interface NewebpayTradeInfo {
  MerchantID: string;
  MerchantOrderNo: string;
  Amt: number;
  ItemDesc: string;
  TimeStamp: number;
  Version: string;
  RespondType: string;
  NotifyURL: string;
  ReturnURL: string;
  ClientBackURL: string;
  Email: string;
  LoginType: number;
  CREDIT?: number;
  WEBATM?: number;
  VACC?: number;
  CVS?: number;
  BARCODE?: number;
  LINEPAY?: number;
  ExpireDate?: string;
  ExpireTime?: string;
}

export interface PaymentData {
  MerchantID: string;
  TradeInfo: string;
  TradeSha: string;
  Version: string;
}

export interface NewebpayCallbackData {
  Status: string;
  Message: string;
  Result: {
    MerchantID: string;
    Amt: number;
    TradeNo: string;
    MerchantOrderNo: string;
    PaymentType: string;
    RespondType: string;
    PayTime: string;
    IP: string;
    EscrowBank: string;
    PayBankCode?: string;
    PayerAccount5Code?: string;
    Card6No?: string;
    Card4No?: string;
    Exp?: string;
    TokenUseStatus?: string;
    InstFirst?: number;
    InstEach?: number;
    Inst?: number;
    ECI?: string;
    PaymentMethod?: string;
  };
}

export interface CallbackResult {
  success: boolean;
  orderId: string;
  transactionId?: string;
  paymentType?: string;
  payTime?: string;
  amount?: number;
  error?: string;
}
