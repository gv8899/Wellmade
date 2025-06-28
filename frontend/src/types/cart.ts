// 購物車狀態機定義
export enum CartMode {
  GUEST = 'GUEST',           // 訪客模式 - 資料存在 localStorage
  SYNCING = 'SYNCING',       // 同步中 - 正在進行登入/登出操作
  MEMBER = 'MEMBER',         // 會員模式 - 資料來自 API
  OFFLINE = 'OFFLINE'        // 離線模式 - API 不可用時的降級狀態
}

// 購物車事件定義
export enum CartEvent {
  LOGIN_START = 'LOGIN_START',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS', 
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT_START = 'LOGOUT_START',
  LOGOUT_SUCCESS = 'LOGOUT_SUCCESS',
  API_FAILURE = 'API_FAILURE',
  API_RECOVERY = 'API_RECOVERY',
  SYNC_COMPLETE = 'SYNC_COMPLETE'
}

// 狀態轉換定義
export interface CartStateTransition {
  from: CartMode;
  to: CartMode;
  event: CartEvent;
}

// 允許的狀態轉換列表
export const ALLOWED_TRANSITIONS: CartStateTransition[] = [
  { from: CartMode.GUEST, to: CartMode.SYNCING, event: CartEvent.LOGIN_START },
  { from: CartMode.SYNCING, to: CartMode.MEMBER, event: CartEvent.LOGIN_SUCCESS },
  { from: CartMode.SYNCING, to: CartMode.GUEST, event: CartEvent.LOGIN_FAILURE },
  { from: CartMode.MEMBER, to: CartMode.SYNCING, event: CartEvent.LOGOUT_START },
  { from: CartMode.SYNCING, to: CartMode.GUEST, event: CartEvent.LOGOUT_SUCCESS },
  { from: CartMode.GUEST, to: CartMode.OFFLINE, event: CartEvent.API_FAILURE },
  { from: CartMode.MEMBER, to: CartMode.OFFLINE, event: CartEvent.API_FAILURE },
  { from: CartMode.OFFLINE, to: CartMode.GUEST, event: CartEvent.API_RECOVERY },
  { from: CartMode.OFFLINE, to: CartMode.MEMBER, event: CartEvent.API_RECOVERY }
];

// 狀態機類
export class CartStateMachine {
  private currentMode: CartMode = CartMode.GUEST;
  private previousMode: CartMode = CartMode.GUEST;

  constructor(initialMode: CartMode = CartMode.GUEST) {
    this.currentMode = initialMode;
    this.previousMode = initialMode;
  }

  // 獲取當前狀態
  getCurrentMode(): CartMode {
    return this.currentMode;
  }

  // 獲取上一個狀態
  getPreviousMode(): CartMode {
    return this.previousMode;
  }

  // 檢查狀態轉換是否允許
  canTransition(event: CartEvent): boolean {
    return ALLOWED_TRANSITIONS.some(
      transition => transition.from === this.currentMode && transition.event === event
    );
  }

  // 執行狀態轉換
  transition(event: CartEvent): boolean {
    const validTransition = ALLOWED_TRANSITIONS.find(
      transition => transition.from === this.currentMode && transition.event === event
    );

    if (!validTransition) {
      console.warn(`Invalid transition: ${this.currentMode} -> ${event}`);
      return false;
    }

    this.previousMode = this.currentMode;
    this.currentMode = validTransition.to;
    
    console.log(`Cart state transition: ${this.previousMode} -> ${this.currentMode} (${event})`);
    return true;
  }

  // 重置狀態機
  reset(mode: CartMode = CartMode.GUEST): void {
    this.previousMode = this.currentMode;
    this.currentMode = mode;
  }

  // 特殊方法：進入離線模式時記住之前的狀態
  enterOfflineMode(): void {
    if (this.currentMode !== CartMode.OFFLINE && this.currentMode !== CartMode.SYNCING) {
      this.previousMode = this.currentMode;
      this.currentMode = CartMode.OFFLINE;
    }
  }

  // 特殊方法：從離線模式恢復
  exitOfflineMode(): void {
    if (this.currentMode === CartMode.OFFLINE) {
      this.currentMode = this.previousMode;
    }
  }
}

// 購物車操作結果
export interface CartOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  requiresSync?: boolean;  // 是否需要同步
  modeChanged?: boolean;   // 模式是否改變
}

// 購物車項目介面
export interface CartItem {
  id: string;
  productId?: string;      // 產品 ID
  variantId?: string;      // 變體 ID
  name: string;
  price: number;
  quantity: number;
  cover: string;
  specs: { [key: string]: string };
  // 新增預購相關欄位
  isPreorder?: boolean;
  preorderInfo?: {
    expectedShipDate?: string;
    preorderDescription?: string;
    preorderLimit?: number;
    preorderSold?: number;
  };
}

// 購物車狀態介面
export interface CartState {
  mode: CartMode;
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  lastSyncTime: number;
}

// 標準化的加入購物車輸入介面
export interface AddToCartInput {
  productId: string;          // 必須：產品ID
  variantId?: string;         // 可選：變體ID（容器產品必須提供）
  quantity: number;           // 必須：數量
  specs?: Record<string, string>; // 可選：規格選擇
}

// 前端購物車項目顯示用介面（包含所有顯示需要的資訊）
export interface CartItemDisplay extends CartItem {
  name: string;               // 顯示名稱
  price: number;              // 顯示價格
  cover: string;              // 封面圖片
}