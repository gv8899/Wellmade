// Banner 相關類型定義

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

export interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  linkType: BannerLinkType;
  position: BannerPosition;
  sortOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerDto {
  title: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  linkType?: BannerLinkType;
  position?: BannerPosition;
  sortOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpdateBannerDto extends Partial<CreateBannerDto> {}

export interface QueryBannerDto {
  position?: BannerPosition;
  isActive?: boolean;
  includeInactive?: boolean;
  skip?: number;
  take?: number;
  onlyCurrentlyActive?: boolean;
}

export interface BannerListResponse {
  items: Banner[];
  total: number;
}

// Banner 位置的顯示名稱映射
export const BannerPositionLabels: Record<BannerPosition, string> = {
  [BannerPosition.HOMEPAGE]: '首頁主要',
  [BannerPosition.HOMEPAGE_SECONDARY]: '首頁次要',
  [BannerPosition.CATEGORY_TOP]: '分類頁頂部',
  [BannerPosition.PRODUCT_DETAIL]: '商品詳情頁',
};

// Banner 連結類型的顯示名稱映射
export const BannerLinkTypeLabels: Record<BannerLinkType, string> = {
  [BannerLinkType.NONE]: '無連結',
  [BannerLinkType.INTERNAL]: '內部頁面',
  [BannerLinkType.EXTERNAL]: '外部網站',
};