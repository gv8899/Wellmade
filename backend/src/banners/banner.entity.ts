import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BannerLinkType {
  NONE = 'none',
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

export enum BannerPosition {
  HOMEPAGE = 'homepage',
  HOMEPAGE_SECONDARY = 'homepage_secondary',
  CATEGORY_TOP = 'category_top',
  PRODUCT_DETAIL = 'product_detail',
}

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500 })
  imageUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  mobileImageUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  linkUrl: string;

  @Column({
    type: 'enum',
    enum: BannerLinkType,
    default: BannerLinkType.NONE,
  })
  linkType: BannerLinkType;

  @Column({
    type: 'enum',
    enum: BannerPosition,
    default: BannerPosition.HOMEPAGE,
  })
  position: BannerPosition;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 虛擬屬性：檢查 Banner 是否在有效期內
  get isCurrentlyActive(): boolean {
    if (!this.isActive) return false;

    const now = new Date();

    // 檢查開始時間
    if (this.startDate && now < this.startDate) {
      return false;
    }

    // 檢查結束時間
    if (this.endDate && now > this.endDate) {
      return false;
    }

    return true;
  }
}
