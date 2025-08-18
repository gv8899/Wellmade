import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { LogisticsOrder } from './logistics-order.entity';
import { LogisticsStatus } from '../interfaces/newebpay-logistics.interface';

/**
 * 物流狀態記錄實體
 * 記錄物流配送過程中的所有狀態變化
 */
@Entity('logistics_status_records')
@Index(['logisticsOrderId'])
@Index(['status'])
@Index(['createdAt'])
export class LogisticsStatusRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 關聯到物流訂單
   */
  @Column({ name: 'logistics_order_id' })
  logisticsOrderId: string;

  @ManyToOne(() => LogisticsOrder, order => order.statusRecords, { 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'logistics_order_id' })
  logisticsOrder: LogisticsOrder;

  /**
   * 狀態資訊
   */
  @Column({ 
    type: 'enum', 
    enum: LogisticsStatus 
  })
  status: LogisticsStatus;              // 物流狀態

  @Column({ name: 'status_code', nullable: true })
  statusCode: string;                   // 藍新金流狀態代碼

  @Column({ name: 'status_desc' })
  statusDesc: string;                   // 狀態描述

  @Column({ name: 'previous_status', type: 'enum', enum: LogisticsStatus, nullable: true })
  previousStatus: LogisticsStatus;      // 前一個狀態

  /**
   * 追蹤資訊
   */
  @Column({ name: 'trace_data', type: 'jsonb', nullable: true })
  traceData: any;                       // 追蹤原始資料

  @Column({ name: 'api_source', nullable: true })
  apiSource: string;                    // 資料來源 (API 端點名稱)

  @Column({ name: 'notification_sent', type: 'boolean', default: false })
  notificationSent: boolean;            // 是否已發送通知

  /**
   * 備註與系統資訊
   */
  @Column({ type: 'text', nullable: true })
  note: string;                         // 備註

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;                    // 更新人員 (系統/管理員)

  @Column({ name: 'is_manual', type: 'boolean', default: false })
  isManual: boolean;                    // 是否為手動更新

  /**
   * 時間戳記
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

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
   * 方法：檢查是否為最終狀態
   */
  isFinalStatus(): boolean {
    return [
      LogisticsStatus.DELIVERED,
      LogisticsStatus.FAILED,
      LogisticsStatus.RETURNED
    ].includes(this.status);
  }

  /**
   * 方法：檢查狀態是否有效轉換
   */
  static isValidStatusTransition(from: LogisticsStatus, to: LogisticsStatus): boolean {
    // 定義有效的狀態轉換規則
    const validTransitions: Record<LogisticsStatus, LogisticsStatus[]> = {
      [LogisticsStatus.PENDING]: [
        LogisticsStatus.CREATED, 
        LogisticsStatus.FAILED
      ],
      [LogisticsStatus.CREATED]: [
        LogisticsStatus.PICKED_UP, 
        LogisticsStatus.FAILED,
        LogisticsStatus.RETURNED
      ],
      [LogisticsStatus.PICKED_UP]: [
        LogisticsStatus.IN_TRANSIT, 
        LogisticsStatus.FAILED,
        LogisticsStatus.RETURNED
      ],
      [LogisticsStatus.IN_TRANSIT]: [
        LogisticsStatus.DELIVERED, 
        LogisticsStatus.FAILED,
        LogisticsStatus.RETURNED
      ],
      [LogisticsStatus.DELIVERED]: [],  // 最終狀態
      [LogisticsStatus.FAILED]: [
        LogisticsStatus.CREATED,       // 可重新處理
        LogisticsStatus.RETURNED
      ],
      [LogisticsStatus.RETURNED]: []    // 最終狀態
    };

    return validTransitions[from]?.includes(to) || false;
  }
}