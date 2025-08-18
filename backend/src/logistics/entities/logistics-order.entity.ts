import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { LogisticsStatusRecord } from './logistics-status-record.entity';
import { 
  ConvenienceStoreType, 
  LogisticsType, 
  LogisticsStatus 
} from '../interfaces/newebpay-logistics.interface';

/**
 * 物流訂單實體
 * 儲存藍新金流物流配送單資訊
 */
@Entity('logistics_orders')
@Index(['merchantOrderNo'], { unique: true })
@Index(['orderId'])
@Index(['status'])
export class LogisticsOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 關聯到主訂單
   */
  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  /**
   * 藍新金流相關欄位
   */
  @Column({ name: 'merchant_order_no', unique: true })
  merchantOrderNo: string;              // 商店訂單編號

  @Column({ name: 'logistics_type', type: 'enum', enum: LogisticsType })
  logisticsType: LogisticsType;         // 物流類型

  @Column({ name: 'logistics_sub_type', type: 'enum', enum: ConvenienceStoreType })
  logisticsSubType: ConvenienceStoreType; // 物流子類型 (超商類型)

  @Column({ name: 'shipment_no', nullable: true })
  shipmentNo: string;                   // 寄件單號

  @Column({ name: 'cvs_payment_no', nullable: true })
  cvsPaymentNo: string;                 // 寄貨編號

  @Column({ name: 'cvs_validation_no', nullable: true })
  cvsValidationNo: string;              // 驗證碼

  @Column({ name: 'booking_note', nullable: true })
  bookingNote: string;                  // 托運單號

  /**
   * 配送資訊
   */
  @Column({ name: 'is_collection', type: 'boolean', default: false })
  isCollection: boolean;                // 是否為代收貨款

  @Column({ name: 'collection_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  collectionAmount: number;             // 代收金額

  @Column({ name: 'goods_name' })
  goodsName: string;                    // 商品名稱

  @Column({ name: 'goods_amount', type: 'decimal', precision: 10, scale: 2 })
  goodsAmount: number;                  // 商品金額

  /**
   * 寄件人資訊
   */
  @Column({ name: 'sender_name' })
  senderName: string;                   // 寄件人姓名

  @Column({ name: 'sender_phone' })
  senderPhone: string;                  // 寄件人電話

  @Column({ name: 'sender_cell_phone', nullable: true })
  senderCellPhone: string;              // 寄件人手機

  /**
   * 收件人資訊
   */
  @Column({ name: 'receiver_name' })
  receiverName: string;                 // 收件人姓名

  @Column({ name: 'receiver_phone', nullable: true })
  receiverPhone: string;                // 收件人電話

  @Column({ name: 'receiver_cell_phone' })
  receiverCellPhone: string;            // 收件人手機

  @Column({ name: 'receiver_email', nullable: true })
  receiverEmail: string;                // 收件人信箱

  @Column({ name: 'receiver_address', nullable: true })
  receiverAddress: string;              // 收件人地址

  /**
   * 超商門市資訊
   */
  @Column({ name: 'cvs_store_id', nullable: true })
  cvsStoreId: string;                   // 門市代號

  @Column({ name: 'cvs_store_name', nullable: true })
  cvsStoreName: string;                 // 門市名稱

  @Column({ name: 'cvs_address', nullable: true })
  cvsAddress: string;                   // 門市地址

  @Column({ name: 'cvs_telephone', nullable: true })
  cvsTelephone: string;                 // 門市電話

  /**
   * 狀態追蹤
   */
  @Column({ 
    type: 'enum', 
    enum: LogisticsStatus, 
    default: LogisticsStatus.PENDING 
  })
  status: LogisticsStatus;              // 物流狀態

  @Column({ name: 'status_desc', nullable: true })
  statusDesc: string;                   // 狀態描述

  /**
   * 其他欄位
   */
  @Column({ name: 'trade_desc', nullable: true })
  tradeDesc: string;                    // 交易描述

  @Column({ type: 'text', nullable: true })
  remark: string;                       // 備註

  @Column({ name: 'label_url', nullable: true })
  labelUrl: string;                     // 物流標籤 URL

  /**
   * API 回應原始資料 (JSON 格式儲存)
   */
  @Column({ name: 'api_response', type: 'jsonb', nullable: true })
  apiResponse: any;                     // API 回應原始資料

  @Column({ name: 'last_api_call', nullable: true })
  lastApiCall: Date;                    // 最後一次 API 呼叫時間

  /**
   * 時間戳記
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * 關聯到狀態記錄
   */
  @OneToMany(() => LogisticsStatusRecord, record => record.logisticsOrder, {
    cascade: true,
    eager: false
  })
  statusRecords: LogisticsStatusRecord[];

  /**
   * 方法：檢查是否為超商取貨
   */
  isConvenienceStoreDelivery(): boolean {
    return this.logisticsType === LogisticsType.C2C;
  }

  /**
   * 方法：檢查是否需要門市資訊
   */
  requiresStoreInfo(): boolean {
    return this.isConvenienceStoreDelivery() && !this.cvsStoreId;
  }

  /**
   * 方法：檢查是否可以修改
   */
  canModify(): boolean {
    return [
      LogisticsStatus.PENDING,
      LogisticsStatus.CREATED
    ].includes(this.status);
  }

  /**
   * 方法：檢查是否已完成配送
   */
  isCompleted(): boolean {
    return [
      LogisticsStatus.DELIVERED,
      LogisticsStatus.RETURNED
    ].includes(this.status);
  }

  /**
   * 方法：取得狀態中文描述
   */
  getStatusLabel(): string {
    const statusLabels = {
      [LogisticsStatus.PENDING]: '待處理',
      [LogisticsStatus.CREATED]: '已建立',
      [LogisticsStatus.PICKED_UP]: '已取貨',
      [LogisticsStatus.IN_TRANSIT]: '運送中',
      [LogisticsStatus.DELIVERED]: '已送達',
      [LogisticsStatus.FAILED]: '配送失敗',
      [LogisticsStatus.RETURNED]: '已退貨'
    };
    
    return statusLabels[this.status] || '未知狀態';
  }

  /**
   * 方法：取得超商類型中文名稱
   */
  getStoreTypeName(): string {
    const storeNames = {
      [ConvenienceStoreType.SEVEN_ELEVEN]: '7-ELEVEN',
      [ConvenienceStoreType.FAMILY_MART]: '全家便利商店',
      [ConvenienceStoreType.HI_LIFE]: '萊爾富',
      [ConvenienceStoreType.OK_MART]: 'OK便利商店'
    };
    
    return storeNames[this.logisticsSubType] || '未知超商';
  }
}