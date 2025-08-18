/**
 * 藍新金流物流 API 介面定義
 */

// 超商類型
export enum ConvenienceStoreType {
  SEVEN_ELEVEN = '1',  // 統一超商
  FAMILY_MART = '2',   // 全家便利商店
  HI_LIFE = '3',       // 萊爾富
  OK_MART = '4'        // OK便利商店
}

// 物流配送類型
export enum LogisticsType {
  B2C = 'B2C',         // 一般宅配
  C2C = 'C2C'          // 超商取貨
}

// 物流狀態
export enum LogisticsStatus {
  PENDING = 'PENDING',                 // 待處理
  CREATED = 'CREATED',                 // 已建立
  PICKED_UP = 'PICKED_UP',            // 已取貨
  IN_TRANSIT = 'IN_TRANSIT',          // 運送中
  DELIVERED = 'DELIVERED',            // 已送達
  FAILED = 'FAILED',                  // 配送失敗
  RETURNED = 'RETURNED'               // 已退貨
}

// 基礎 API 參數
export interface BaseApiParams {
  UID_: string;          // 商店代號
  Version_: string;      // 串接程式版本
  RespondType_: 'JSON';  // 回傳格式
}

// 加密資料結構
export interface EncryptedData {
  EncryptData_: string;  // 加密資料
  HashData_: string;     // 雜湊資料
}

// 門市地圖選取參數 (storeMap)
export interface StoreMapParams {
  CVSType: ConvenienceStoreType;     // 超商類型
  ReturnURL: string;                 // 回傳網址
  CVSOutSide?: '1' | '0';           // 是否顯示門市外觀 (1:顯示, 0:不顯示)
}

// 門市資訊
export interface StoreInfo {
  CVSStoreID: string;        // 門市代號
  CVSStoreName: string;      // 門市名稱
  CVSAddress: string;        // 門市地址
  CVSTelephone?: string;     // 門市電話
  CVSOutSide?: string;       // 門市外觀照片URL
}

// 建立物流配送單參數 (createShipment)
export interface CreateShipmentParams {
  RespondType: 'JSON';               // 回傳格式
  TimeStamp: number;                 // 時間戳記
  Version: string;                   // 串接程式版本
  MerchantOrderNo: string;           // 商店訂單編號
  LogisticsSubType: ConvenienceStoreType; // 物流子類型 (超商類型)
  IsCollection: 'Y' | 'N';          // 是否為代收貨款
  CollectionAmount?: number;          // 代收金額
  GoodsName: string;                 // 商品名稱
  GoodsAmount: number;               // 商品金額
  SenderName: string;                // 寄件人姓名
  SenderPhone: string;               // 寄件人電話
  SenderCellPhone?: string;          // 寄件人手機
  ReceiverName: string;              // 收件人姓名
  ReceiverPhone?: string;            // 收件人電話
  ReceiverCellPhone: string;         // 收件人手機
  ReceiverEmail?: string;            // 收件人信箱
  TradeDesc?: string;                // 交易描述
  ServerReplyURL?: string;           // 物流狀態通知網址
  ClientReplyURL?: string;           // 物流狀態通知頁面
  Remark?: string;                   // 備註
  CVSStoreID?: string;               // 門市代號 (超商取貨)
  CVSStoreName?: string;             // 門市名稱 (超商取貨)
  CVSAddress?: string;               // 門市地址 (超商取貨)
  CVSTelephone?: string;             // 門市電話 (超商取貨)
  ReceiverStoreID?: string;          // 收件門市代號
}

// 物流配送單回應
export interface CreateShipmentResponse {
  Status: 'SUCCESS' | 'FAIL';       // 處理狀態
  Message: string;                   // 回應訊息
  Result?: {
    MerchantID: string;              // 特店編號
    MerchantOrderNo: string;         // 商店訂單編號
    LogisticsType: LogisticsType;    // 物流類型
    LogisticsSubType: ConvenienceStoreType; // 物流子類型
    GoodsAmount: number;             // 商品金額
    UpdateStatusType: string;        // 物流狀態
    ReceiverName: string;            // 收件人姓名
    ReceiverPhone: string;           // 收件人電話
    ReceiverCellPhone: string;       // 收件人手機
    ReceiverEmail: string;           // 收件人信箱
    ReceiverAddress?: string;        // 收件人地址
    CVSPaymentNo?: string;          // 寄貨編號
    CVSValidationNo?: string;       // 驗證碼
    BookingNote?: string;           // 托運單號
  };
}

// 取得寄件單號參數 (getShipmentNo)
export interface GetShipmentNoParams {
  RespondType: 'JSON';
  TimeStamp: number;
  Version: string;
  MerchantOrderNo: string;           // 商店訂單編號
}

// 寄件單號回應
export interface GetShipmentNoResponse {
  Status: 'SUCCESS' | 'FAIL';
  Message: string;
  Result?: {
    MerchantID: string;
    MerchantOrderNo: string;
    ShipmentNo: string;              // 寄件單號
    LogisticsType: LogisticsType;
    LogisticsSubType: ConvenienceStoreType;
  };
}

// 查詢物流配送單參數 (queryShipment)
export interface QueryShipmentParams {
  RespondType: 'JSON';
  TimeStamp: number;
  Version: string;
  MerchantOrderNo: string;           // 商店訂單編號
}

// 查詢物流配送單回應
export interface QueryShipmentResponse {
  Status: 'SUCCESS' | 'FAIL';
  Message: string;
  Result?: CreateShipmentResponse['Result'];
}

// 查詢物流貨態歷程參數 (trace)
export interface TraceParams {
  RespondType: 'JSON';
  TimeStamp: number;
  Version: string;
  MerchantOrderNo: string;           // 商店訂單編號
}

// 物流貨態記錄
export interface LogisticsTraceRecord {
  StatusCode: string;                // 狀態代碼
  StatusDesc: string;                // 狀態說明
  CreateTime: string;                // 建立時間
}

// 查詢物流貨態歷程回應
export interface TraceResponse {
  Status: 'SUCCESS' | 'FAIL';
  Message: string;
  Result?: {
    MerchantID: string;
    MerchantOrderNo: string;
    LogisticsType: LogisticsType;
    LogisticsSubType: ConvenienceStoreType;
    Details: LogisticsTraceRecord[];
  };
}

// 修改物流配送單參數 (modifyShipment)
export interface ModifyShipmentParams {
  RespondType: 'JSON';
  TimeStamp: number;
  Version: string;
  MerchantOrderNo: string;           // 商店訂單編號
  ReceiverName?: string;             // 收件人姓名
  ReceiverPhone?: string;            // 收件人電話
  ReceiverCellPhone?: string;        // 收件人手機
  ReceiverEmail?: string;            // 收件人信箱
  CVSStoreID?: string;               // 門市代號
}

// 修改物流配送單回應
export interface ModifyShipmentResponse {
  Status: 'SUCCESS' | 'FAIL';
  Message: string;
  Result?: {
    MerchantID: string;
    MerchantOrderNo: string;
    LogisticsType: LogisticsType;
    LogisticsSubType: ConvenienceStoreType;
  };
}

// 物流標籤列印參數 (printLabel)
export interface PrintLabelParams {
  RespondType: 'JSON';
  TimeStamp: number;
  Version: string;
  MerchantOrderNo: string;           // 商店訂單編號
}

// 物流標籤列印回應
export interface PrintLabelResponse {
  Status: 'SUCCESS' | 'FAIL';
  Message: string;
  Result?: {
    MerchantID: string;
    MerchantOrderNo: string;
    LabelURL: string;                // 標籤下載網址
  };
}

// API 端點枚舉
export enum ApiEndpoint {
  STORE_MAP = 'storeMap',
  CREATE_SHIPMENT = 'createShipment',
  GET_SHIPMENT_NO = 'getShipmentNo',
  PRINT_LABEL = 'printLabel',
  QUERY_SHIPMENT = 'queryShipment',
  MODIFY_SHIPMENT = 'modifyShipment',
  TRACE = 'trace'
}

// 環境配置
export interface LogisticsConfig {
  uid: string;                       // 商店代號
  key: string;                       // 加密金鑰
  iv: string;                        // 加密向量
  apiUrl: string;                    // API 基礎網址
  version: string;                   // API 版本
  isProduction: boolean;             // 是否為生產環境
}