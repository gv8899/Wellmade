export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  LINE_PAY = 'line_pay',
}

export enum DeliveryMethod {
  HOME_DELIVERY = 'home_delivery',
  SEVEN_ELEVEN = 'seven_eleven',
  FAMILY_MART = 'family_mart',
  HI_LIFE = 'hi_life',
  OK_MART = 'ok_mart'
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  district?: string;
  postalCode?: string;
}

export interface DeliveryInfo {
  method: DeliveryMethod;
  fee: number;
  estimatedDays: number;
  storeId?: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  specs?: Record<string, any>;
  product?: {
    id: string;
    name: string;
    images: string[];
  };
  variant?: {
    id: string;
    variantTitle?: string;
    specs: Record<string, string>;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  subtotal: number;
  shippingFee: number;
  handlingFee: number;
  total: number;
  customerInfo: CustomerInfo;
  deliveryInfo: DeliveryInfo;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  customerInfo: CustomerInfo;
  paymentMethod: PaymentMethod;
  deliveryInfo: DeliveryInfo;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  notes?: string;
  sessionId?: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
}

export interface PaymentData {
  MerchantID: string;
  TradeInfo: string;
  TradeSha: string;
  Version: string;
}

export interface PaymentResponse {
  paymentData: PaymentData;
  apiUrl: string;
}