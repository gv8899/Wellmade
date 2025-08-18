import { 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsBoolean, 
  IsOptional, 
  IsEmail,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  Min,
  Max,
  ValidateIf
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConvenienceStoreType } from '../interfaces/newebpay-logistics.interface';

/**
 * 建立物流配送單 DTO
 */
export class CreateShipmentDto {
  /**
   * 訂單資訊
   */
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  orderId: string;                      // 系統訂單 ID

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  merchantOrderNo: string;              // 商店訂單編號

  @IsEnum(ConvenienceStoreType)
  logisticsSubType: ConvenienceStoreType; // 物流子類型 (超商類型)

  /**
   * 代收貨款設定
   */
  @IsBoolean()
  isCollection: boolean;                // 是否為代收貨款

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999)
  @ValidateIf(o => o.isCollection === true)
  collectionAmount?: number;            // 代收金額

  /**
   * 商品資訊
   */
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  goodsName: string;                    // 商品名稱

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(999999)
  goodsAmount: number;                  // 商品金額

  /**
   * 寄件人資訊
   */
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  senderName: string;                   // 寄件人姓名

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  senderPhone: string;                  // 寄件人電話

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  senderCellPhone?: string;             // 寄件人手機

  /**
   * 收件人資訊
   */
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  receiverName: string;                 // 收件人姓名

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  receiverPhone?: string;               // 收件人電話

  @IsString()
  @MinLength(10)
  @MaxLength(20)
  receiverCellPhone: string;            // 收件人手機

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  receiverEmail?: string;               // 收件人信箱

  /**
   * 超商門市資訊 (超商取貨必填)
   */
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  cvsStoreId?: string;                  // 門市代號

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  cvsStoreName?: string;                // 門市名稱

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  cvsAddress?: string;                  // 門市地址

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  cvsTelephone?: string;                // 門市電話

  /**
   * 配送地址 (宅配必填)
   */
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  receiverAddress?: string;             // 收件人地址

  /**
   * 其他資訊
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tradeDesc?: string;                   // 交易描述

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remark?: string;                      // 備註

  /**
   * 回調 URL (可選)
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  serverReplyUrl?: string;              // 物流狀態通知網址

  @IsOptional()
  @IsString()
  @MaxLength(500)
  clientReplyUrl?: string;              // 物流狀態通知頁面
}

/**
 * 修改物流配送單 DTO
 */
export class ModifyShipmentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  merchantOrderNo: string;              // 商店訂單編號

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  receiverName?: string;                // 收件人姓名

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  receiverPhone?: string;               // 收件人電話

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  receiverCellPhone?: string;           // 收件人手機

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  receiverEmail?: string;               // 收件人信箱

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  cvsStoreId?: string;                  // 門市代號
}

/**
 * 查詢物流配送單 DTO
 */
export class QueryShipmentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  merchantOrderNo: string;              // 商店訂單編號
}

/**
 * 取得門市地圖 DTO
 */
export class GetStoreMapDto {
  @IsEnum(ConvenienceStoreType)
  cvsType: ConvenienceStoreType;        // 超商類型

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  returnUrl: string;                    // 回傳網址

  @IsOptional()
  @IsString()
  @IsEnum(['1', '0'])
  cvsOutSide?: '1' | '0';              // 是否顯示門市外觀
}