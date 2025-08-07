import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { OrderItem } from './order-item.entity';
import { PaymentRecord } from './payment-record.entity';

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
  OK_MART = 'ok_mart',
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  district?: string;
  postalCode?: string;
}

interface DeliveryInfo {
  method: DeliveryMethod;
  fee: number;
  estimatedDays: number;
  storeId?: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: DeliveryMethod,
    nullable: true,
  })
  deliveryMethod: DeliveryMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'jsonb' })
  customerInfo: CustomerInfo;

  @Column({ type: 'jsonb', nullable: true })
  deliveryInfo: DeliveryInfo;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  items: OrderItem[];

  @OneToMany(() => PaymentRecord, (record) => record.order)
  paymentRecords: PaymentRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0');
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
}
