import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ConvenienceStoreType } from '../interfaces/newebpay-logistics.interface';

/**
 * 超商門市實體
 * 儲存超商門市基本資料
 */
@Entity('convenience_stores')
@Index(['storeType', 'storeId'], { unique: true })
@Index(['storeType'])
@Index(['isActive'])
export class ConvenienceStore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 門市基本資訊
   */
  @Column({ name: 'store_type', type: 'enum', enum: ConvenienceStoreType })
  storeType: ConvenienceStoreType;      // 超商類型

  @Column({ name: 'store_id' })
  storeId: string;                      // 門市代號

  @Column({ name: 'store_name' })
  storeName: string;                    // 門市名稱

  @Column({ name: 'store_address' })
  storeAddress: string;                 // 門市地址

  @Column({ name: 'store_telephone', nullable: true })
  storeTelephone: string;               // 門市電話

  /**
   * 地理位置資訊
   */
  @Column({ name: 'city', nullable: true })
  city: string;                         // 城市

  @Column({ name: 'district', nullable: true })
  district: string;                     // 區域

  @Column({ name: 'postal_code', nullable: true })
  postalCode: string;                   // 郵遞區號

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;                     // 緯度

  @Column({ name: 'longitude', type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;                    // 經度

  /**
   * 營運資訊
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;                    // 是否營運中

  @Column({ name: 'operating_hours', nullable: true })
  operatingHours: string;               // 營業時間

  @Column({ name: 'pickup_available', type: 'boolean', default: true })
  pickupAvailable: boolean;             // 是否支援取貨

  @Column({ name: 'payment_available', type: 'boolean', default: false })
  paymentAvailable: boolean;            // 是否支援代收

  /**
   * 額外資訊
   */
  @Column({ name: 'store_image_url', nullable: true })
  storeImageUrl: string;                // 門市外觀照片 URL

  @Column({ name: 'special_note', nullable: true })
  specialNote: string;                  // 特殊注意事項

  @Column({ name: 'max_package_size', nullable: true })
  maxPackageSize: string;               // 最大包裹尺寸限制

  @Column({ name: 'max_package_weight', type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxPackageWeight: number;             // 最大包裹重量限制 (公斤)

  /**
   * 統計資訊
   */
  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;                   // 使用次數

  @Column({ name: 'last_used_at', nullable: true })
  lastUsedAt: Date;                     // 最後使用時間

  /**
   * 時間戳記
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

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
    
    return storeNames[this.storeType] || '未知超商';
  }

  /**
   * 方法：取得完整地址
   */
  getFullAddress(): string {
    const parts = [this.city, this.district, this.storeAddress].filter(Boolean);
    return parts.join('');
  }

  /**
   * 方法：檢查是否支援服務
   */
  supportsPickup(): boolean {
    return this.isActive && this.pickupAvailable;
  }

  supportsPayment(): boolean {
    return this.isActive && this.paymentAvailable;
  }

  /**
   * 方法：增加使用次數
   */
  incrementUsage(): void {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
  }

  /**
   * 方法：檢查包裹是否符合限制
   */
  canAcceptPackage(weight?: number, dimensions?: string): boolean {
    if (!this.isActive || !this.pickupAvailable) {
      return false;
    }

    // 檢查重量限制
    if (weight && this.maxPackageWeight && weight > this.maxPackageWeight) {
      return false;
    }

    // 這裡可以增加尺寸檢查邏輯
    // if (dimensions && this.maxPackageSize) {
    //   // 比較包裹尺寸與門市限制
    // }

    return true;
  }

  /**
   * 方法：計算與指定座標的距離 (公里)
   */
  calculateDistance(lat: number, lng: number): number | null {
    if (!this.latitude || !this.longitude) {
      return null;
    }

    const R = 6371; // 地球半徑 (公里)
    const dLat = this.toRadians(lat - this.latitude);
    const dLng = this.toRadians(lng - this.longitude);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(this.latitude)) * Math.cos(this.toRadians(lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }
}