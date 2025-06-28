/**
 * 產品狀態枚舉
 * 定義產品和變體的可用狀態
 */
export enum ProductStatus {
  /** 現貨 - 有庫存可立即出貨 */
  IN_STOCK = 'IN_STOCK',

  /** 預購 - 需要預訂，未來出貨 */
  PREORDER = 'PREORDER',

  /** 缺貨 - 目前無庫存 */
  OUT_OF_STOCK = 'OUT_OF_STOCK',

  /** 已停產 - 不再販售 */
  DISCONTINUED = 'DISCONTINUED',
}

/**
 * 庫存類型枚舉
 * 定義不同的庫存管理方式
 */
export enum InventoryType {
  /** 實體庫存 - 傳統庫存管理 */
  PHYSICAL = 'PHYSICAL',

  /** 預購限量 - 限制預購數量 */
  PREORDER_LIMITED = 'PREORDER_LIMITED',

  /** 預購無限 - 不限制預購數量 */
  PREORDER_UNLIMITED = 'PREORDER_UNLIMITED',
}
