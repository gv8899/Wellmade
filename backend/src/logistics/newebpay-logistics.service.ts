import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import * as FormData from 'form-data';

import { LogisticsOrder } from './entities/logistics-order.entity';
import { LogisticsStatusRecord } from './entities/logistics-status-record.entity';
import { ConvenienceStore } from './entities/convenience-store.entity';
import { NewebpayCryptoUtil } from './utils/crypto.util';

import {
  LogisticsConfig,
  ApiEndpoint,
  BaseApiParams,
  EncryptedData,
  StoreMapParams,
  CreateShipmentParams,
  CreateShipmentResponse,
  GetShipmentNoParams,
  GetShipmentNoResponse,
  QueryShipmentParams,
  QueryShipmentResponse,
  TraceParams,
  TraceResponse,
  ModifyShipmentParams,
  ModifyShipmentResponse,
  PrintLabelParams,
  PrintLabelResponse,
  ConvenienceStoreType,
  LogisticsType,
  LogisticsStatus
} from './interfaces/newebpay-logistics.interface';

import {
  CreateShipmentDto,
  ModifyShipmentDto,
  QueryShipmentDto,
  GetStoreMapDto
} from './dto/create-shipment.dto';

/**
 * 藍新金流物流服務類別
 * 提供完整的物流 API 整合功能
 */
@Injectable()
export class NewebpayLogisticsService {
  private readonly logger = new Logger(NewebpayLogisticsService.name);
  private readonly httpClient: AxiosInstance;
  private readonly config: LogisticsConfig;

  constructor(
    private readonly configService: ConfigService,
    
    @InjectRepository(LogisticsOrder)
    private readonly logisticsOrderRepository: Repository<LogisticsOrder>,
    
    @InjectRepository(LogisticsStatusRecord)
    private readonly statusRecordRepository: Repository<LogisticsStatusRecord>,
    
    @InjectRepository(ConvenienceStore)
    private readonly storeRepository: Repository<ConvenienceStore>,
  ) {
    // 初始化配置
    this.config = {
      uid: this.configService.get<string>('NEWEBPAY_LOGISTICS_UID'),
      key: this.configService.get<string>('NEWEBPAY_LOGISTICS_KEY'),
      iv: this.configService.get<string>('NEWEBPAY_LOGISTICS_IV'),
      apiUrl: this.configService.get<string>('NEWEBPAY_LOGISTICS_API_URL'),
      version: this.configService.get<string>('NEWEBPAY_LOGISTICS_VERSION', '1.0'),
      isProduction: this.configService.get<string>('NODE_ENV') === 'production'
    };

    // 驗證必要配置
    this.validateConfig();

    // 初始化 HTTP 客戶端
    this.httpClient = axios.create({
      baseURL: this.config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Wellmade-Logistics-Client/1.0'
      }
    });

    // 設定請求/回應攔截器
    this.setupAxiosInterceptors();
  }

  /**
   * 驗證配置是否完整
   */
  private validateConfig(): void {
    const requiredFields = ['uid', 'key', 'iv', 'apiUrl'];
    const missingFields = requiredFields.filter(field => !this.config[field]);
    
    if (missingFields.length > 0) {
      this.logger.warn(`藍新金流物流服務配置不完整，缺少: ${missingFields.join(', ')} - 將使用測試模式`);
      
      // 設定測試模式預設值
      this.config.uid = this.config.uid || 'TEST_UID';
      this.config.key = this.config.key || 'TEST_KEY';
      this.config.iv = this.config.iv || 'TEST_IV_123456';
      this.config.apiUrl = this.config.apiUrl || 'https://clogistics.newebpay.com/api';
      this.config.isProduction = false;
      
      this.logger.log('物流服務已啟動測試模式，全家門市選擇功能仍可正常使用');
    }
  }

  /**
   * 設定 Axios 攔截器
   */
  private setupAxiosInterceptors(): void {
    // 請求攔截器
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`發送 API 請求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('API 請求準備失敗', error);
        return Promise.reject(error);
      }
    );

    // 回應攔截器
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`收到 API 回應: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        this.logger.error('API 請求失敗', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * 準備基礎 API 參數
   */
  private prepareBaseParams(): BaseApiParams {
    return {
      UID_: this.config.uid,
      Version_: this.config.version,
      RespondType_: 'JSON'
    };
  }

  /**
   * 發送加密的 API 請求
   */
  private async sendEncryptedRequest<T>(
    endpoint: ApiEndpoint,
    params: any,
    isFormPost: boolean = true
  ): Promise<T> {
    try {
      // 準備加密資料
      const { encryptedData, hashData } = NewebpayCryptoUtil.prepareApiData(
        params,
        this.config.key,
        this.config.iv
      );

      // 準備完整的請求參數
      const requestData = {
        ...this.prepareBaseParams(),
        EncryptData_: encryptedData,
        HashData_: hashData
      };

      let response;
      
      if (isFormPost) {
        // 使用 FormData 發送 POST 請求
        const formData = new FormData();
        Object.entries(requestData).forEach(([key, value]) => {
          formData.append(key, value);
        });

        response = await this.httpClient.post(`/${endpoint}`, formData, {
          headers: formData.getHeaders()
        });
      } else {
        // 使用 JSON 發送請求
        response = await this.httpClient.post(`/${endpoint}`, requestData);
      }

      // 記錄 API 呼叫
      this.logger.log(`API ${endpoint} 呼叫成功`, {
        endpoint,
        responseStatus: response.status
      });

      return response.data;
    } catch (error) {
      this.logger.error(`API ${endpoint} 呼叫失敗`, {
        endpoint,
        error: error.message,
        response: error.response?.data
      });
      
      throw new HttpException(
        `物流 API 呼叫失敗: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 1. 門市地圖選取 API (storeMap)
   */
  async getStoreMap(dto: GetStoreMapDto): Promise<string> {
    try {
      const params: StoreMapParams = {
        CVSType: dto.cvsType,
        ReturnURL: dto.returnUrl,
        CVSOutSide: dto.cvsOutSide || '0'
      };

      this.logger.log('準備門市地圖選取', { cvsType: dto.cvsType });

      // 準備加密資料
      const { encryptedData, hashData } = NewebpayCryptoUtil.prepareApiData(
        params,
        this.config.key,
        this.config.iv
      );

      // 構建完整的表單提交 URL
      const baseParams = this.prepareBaseParams();
      const formParams = new URLSearchParams({
        ...baseParams,
        EncryptData_: encryptedData,
        HashData_: hashData
      });

      const storeMapUrl = `${this.config.apiUrl}/${ApiEndpoint.STORE_MAP}?${formParams.toString()}`;
      
      this.logger.log('門市地圖 URL 生成成功', { url: storeMapUrl });
      
      return storeMapUrl;
    } catch (error) {
      this.logger.error('門市地圖選取失敗', error);
      throw new HttpException(
        '無法生成門市選取頁面',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 藍新金流門市地圖選取 API (統一介面)
   * 呼叫藍新 storeMap API 取得門市選擇的重導向 URL
   */
  async getNewebpayStoreMap(dto: {
    ShipType: number;
    MerchantOrderNo: string;
    ReturnURL: string;
  }): Promise<string> {
    try {
      this.logger.log('準備藍新金流門市地圖選取', dto);

      // 根據技術文件構建參數
      const params = {
        LgsType: 'B2C', // 固定為 B2C
        ShipType: dto.ShipType.toString(), // 1:統一，2:全家，3:萊爾富，4:OK
        MerchantOrderNo: dto.MerchantOrderNo,
        Version: this.config.version || '1.0',
        TimeStamp: NewebpayCryptoUtil.generateTimestamp(),
        RespondType: 'JSON',
        ReturnURL: dto.ReturnURL
      };

      // 呼叫藍新 storeMap API
      const response = await this.sendEncryptedRequest(ApiEndpoint.STORE_MAP, params);
      
      this.logger.log('藍新 storeMap API 回應', response);
      
      // 藍新應該回傳門市選擇的 URL 或直接重導向
      // 如果回應包含 URL，回傳該 URL
      // 如果是重導向回應，處理重導向邏輯
      
      const typedResponse = response as any;
      if (typedResponse && typedResponse.Status === 'SUCCESS' && typedResponse.Result) {
        const result = typedResponse.Result;
        if (result.StoreMapURL) {
          return result.StoreMapURL;
        }
      }
      
      // 如果藍新 API 沒有按預期回應，回退到我們的測試模式
      this.logger.warn('藍新 storeMap API 回應格式不如預期，使用測試模式');
      throw new Error('藍新 API 回應格式錯誤');
      
    } catch (error) {
      this.logger.error('藍新金流門市地圖選取失敗', error);
      throw new HttpException(
        '無法生成藍新金流門市選取頁面',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 2. 建立物流配送單 API (createShipment)
   */
  async createShipment(dto: CreateShipmentDto): Promise<LogisticsOrder> {
    try {
      this.logger.log('開始建立物流配送單', { merchantOrderNo: dto.merchantOrderNo });

      // 檢查是否已存在相同的物流訂單
      const existingOrder = await this.logisticsOrderRepository.findOne({
        where: { merchantOrderNo: dto.merchantOrderNo }
      });

      if (existingOrder) {
        throw new HttpException(
          '該訂單編號的物流配送單已存在',
          HttpStatus.CONFLICT
        );
      }

      // 準備 API 參數
      const apiParams: CreateShipmentParams = {
        RespondType: 'JSON',
        TimeStamp: NewebpayCryptoUtil.generateTimestamp(),
        Version: this.config.version,
        MerchantOrderNo: dto.merchantOrderNo,
        LogisticsSubType: dto.logisticsSubType,
        IsCollection: dto.isCollection ? 'Y' : 'N',
        CollectionAmount: dto.collectionAmount,
        GoodsName: dto.goodsName,
        GoodsAmount: dto.goodsAmount,
        SenderName: dto.senderName,
        SenderPhone: dto.senderPhone,
        SenderCellPhone: dto.senderCellPhone,
        ReceiverName: dto.receiverName,
        ReceiverPhone: dto.receiverPhone,
        ReceiverCellPhone: dto.receiverCellPhone,
        ReceiverEmail: dto.receiverEmail,
        TradeDesc: dto.tradeDesc,
        ServerReplyURL: dto.serverReplyUrl,
        ClientReplyURL: dto.clientReplyUrl,
        Remark: dto.remark,
        CVSStoreID: dto.cvsStoreId,
        CVSStoreName: dto.cvsStoreName,
        CVSAddress: dto.cvsAddress,
        CVSTelephone: dto.cvsTelephone,
        ReceiverStoreID: dto.cvsStoreId // 收件門市代號與 CVSStoreID 相同
      };

      // 發送 API 請求
      const response = await this.sendEncryptedRequest<CreateShipmentResponse>(
        ApiEndpoint.CREATE_SHIPMENT,
        apiParams
      );

      // 檢查 API 回應狀態
      if (response.Status !== 'SUCCESS') {
        throw new HttpException(
          `建立物流配送單失敗: ${response.Message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // 建立物流訂單記錄
      const logisticsOrder = this.logisticsOrderRepository.create({
        orderId: dto.orderId,
        merchantOrderNo: dto.merchantOrderNo,
        logisticsType: LogisticsType.C2C, // 目前只支援超商取貨
        logisticsSubType: dto.logisticsSubType,
        isCollection: dto.isCollection,
        collectionAmount: dto.collectionAmount,
        goodsName: dto.goodsName,
        goodsAmount: dto.goodsAmount,
        senderName: dto.senderName,
        senderPhone: dto.senderPhone,
        senderCellPhone: dto.senderCellPhone,
        receiverName: dto.receiverName,
        receiverPhone: dto.receiverPhone,
        receiverCellPhone: dto.receiverCellPhone,
        receiverEmail: dto.receiverEmail,
        receiverAddress: dto.receiverAddress,
        cvsStoreId: dto.cvsStoreId,
        cvsStoreName: dto.cvsStoreName,
        cvsAddress: dto.cvsAddress,
        cvsTelephone: dto.cvsTelephone,
        tradeDesc: dto.tradeDesc,
        remark: dto.remark,
        status: LogisticsStatus.CREATED,
        apiResponse: response,
        lastApiCall: new Date()
      });

      // 如果 API 回應包含額外資訊，更新到實體
      if (response.Result) {
        logisticsOrder.cvsPaymentNo = response.Result.CVSPaymentNo;
        logisticsOrder.cvsValidationNo = response.Result.CVSValidationNo;
        logisticsOrder.bookingNote = response.Result.BookingNote;
        logisticsOrder.statusDesc = response.Result.UpdateStatusType;
      }

      // 儲存物流訂單
      const savedOrder = await this.logisticsOrderRepository.save(logisticsOrder);

      // 建立狀態記錄
      await this.createStatusRecord(
        savedOrder.id,
        LogisticsStatus.CREATED,
        '物流配送單建立成功',
        null,
        ApiEndpoint.CREATE_SHIPMENT,
        response
      );

      this.logger.log('物流配送單建立成功', {
        orderId: savedOrder.id,
        merchantOrderNo: dto.merchantOrderNo
      });

      return savedOrder;
    } catch (error) {
      this.logger.error('建立物流配送單失敗', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        '建立物流配送單時發生錯誤',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 3. 取得寄件單號 API (getShipmentNo)
   */
  async getShipmentNo(merchantOrderNo: string): Promise<string> {
    try {
      this.logger.log('取得寄件單號', { merchantOrderNo });

      const params: GetShipmentNoParams = {
        RespondType: 'JSON',
        TimeStamp: NewebpayCryptoUtil.generateTimestamp(),
        Version: this.config.version,
        MerchantOrderNo: merchantOrderNo
      };

      const response = await this.sendEncryptedRequest<GetShipmentNoResponse>(
        ApiEndpoint.GET_SHIPMENT_NO,
        params
      );

      if (response.Status !== 'SUCCESS') {
        throw new HttpException(
          `取得寄件單號失敗: ${response.Message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // 更新物流訂單的寄件單號
      const logisticsOrder = await this.logisticsOrderRepository.findOne({
        where: { merchantOrderNo }
      });

      if (logisticsOrder && response.Result?.ShipmentNo) {
        logisticsOrder.shipmentNo = response.Result.ShipmentNo;
        logisticsOrder.lastApiCall = new Date();
        await this.logisticsOrderRepository.save(logisticsOrder);
      }

      this.logger.log('寄件單號取得成功', {
        merchantOrderNo,
        shipmentNo: response.Result?.ShipmentNo
      });

      return response.Result?.ShipmentNo || '';
    } catch (error) {
      this.logger.error('取得寄件單號失敗', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        '取得寄件單號時發生錯誤',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 建立狀態記錄
   */
  private async createStatusRecord(
    logisticsOrderId: string,
    status: LogisticsStatus,
    statusDesc: string,
    previousStatus: LogisticsStatus | null = null,
    apiSource: string | null = null,
    traceData: any = null
  ): Promise<LogisticsStatusRecord> {
    const record = this.statusRecordRepository.create({
      logisticsOrderId,
      status,
      statusDesc,
      previousStatus,
      apiSource,
      traceData,
      isManual: false,
      updatedBy: 'SYSTEM'
    });

    return this.statusRecordRepository.save(record);
  }

  /**
   * 4. 查詢物流配送單 API (queryShipment)
   */
  async queryShipment(dto: QueryShipmentDto): Promise<LogisticsOrder> {
    try {
      this.logger.log('查詢物流配送單', { merchantOrderNo: dto.merchantOrderNo });

      const params: QueryShipmentParams = {
        RespondType: 'JSON',
        TimeStamp: NewebpayCryptoUtil.generateTimestamp(),
        Version: this.config.version,
        MerchantOrderNo: dto.merchantOrderNo
      };

      const response = await this.sendEncryptedRequest<QueryShipmentResponse>(
        ApiEndpoint.QUERY_SHIPMENT,
        params
      );

      if (response.Status !== 'SUCCESS') {
        throw new HttpException(
          `查詢物流配送單失敗: ${response.Message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // 更新本地資料庫記錄
      const logisticsOrder = await this.logisticsOrderRepository.findOne({
        where: { merchantOrderNo: dto.merchantOrderNo },
        relations: ['statusRecords']
      });

      if (!logisticsOrder) {
        throw new HttpException(
          '找不到對應的物流訂單',
          HttpStatus.NOT_FOUND
        );
      }

      // 更新訂單資訊
      if (response.Result) {
        logisticsOrder.cvsPaymentNo = response.Result.CVSPaymentNo || logisticsOrder.cvsPaymentNo;
        logisticsOrder.cvsValidationNo = response.Result.CVSValidationNo || logisticsOrder.cvsValidationNo;
        logisticsOrder.bookingNote = response.Result.BookingNote || logisticsOrder.bookingNote;
        logisticsOrder.statusDesc = response.Result.UpdateStatusType || logisticsOrder.statusDesc;
        logisticsOrder.apiResponse = response;
        logisticsOrder.lastApiCall = new Date();
      }

      await this.logisticsOrderRepository.save(logisticsOrder);

      this.logger.log('物流配送單查詢成功', {
        merchantOrderNo: dto.merchantOrderNo,
        status: logisticsOrder.status
      });

      return logisticsOrder;
    } catch (error) {
      this.logger.error('查詢物流配送單失敗', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        '查詢物流配送單時發生錯誤',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 5. 查詢物流貨態歷程 API (trace)
   */
  async traceShipment(merchantOrderNo: string): Promise<LogisticsStatusRecord[]> {
    try {
      this.logger.log('查詢物流貨態歷程', { merchantOrderNo });

      const params: TraceParams = {
        RespondType: 'JSON',
        TimeStamp: NewebpayCryptoUtil.generateTimestamp(),
        Version: this.config.version,
        MerchantOrderNo: merchantOrderNo
      };

      const response = await this.sendEncryptedRequest<TraceResponse>(
        ApiEndpoint.TRACE,
        params
      );

      if (response.Status !== 'SUCCESS') {
        throw new HttpException(
          `查詢物流貨態歷程失敗: ${response.Message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // 取得物流訂單
      const logisticsOrder = await this.logisticsOrderRepository.findOne({
        where: { merchantOrderNo }
      });

      if (!logisticsOrder) {
        throw new HttpException(
          '找不到對應的物流訂單',
          HttpStatus.NOT_FOUND
        );
      }

      const statusRecords: LogisticsStatusRecord[] = [];

      // 處理貨態歷程資料
      if (response.Result?.Details) {
        for (const detail of response.Result.Details) {
          // 檢查是否已存在相同的狀態記錄
          const existingRecord = await this.statusRecordRepository.findOne({
            where: {
              logisticsOrderId: logisticsOrder.id,
              statusCode: detail.StatusCode,
              createdAt: new Date(detail.CreateTime)
            }
          });

          if (!existingRecord) {
            // 將狀態代碼對應到系統狀態
            const logisticsStatus = this.mapStatusCodeToLogisticsStatus(detail.StatusCode);
            
            const record = await this.createStatusRecord(
              logisticsOrder.id,
              logisticsStatus,
              detail.StatusDesc,
              null,
              ApiEndpoint.TRACE,
              detail
            );

            // 設定狀態代碼和建立時間
            record.statusCode = detail.StatusCode;
            record.createdAt = new Date(detail.CreateTime);
            
            await this.statusRecordRepository.save(record);
            statusRecords.push(record);
          }
        }

        // 更新物流訂單的最新狀態
        if (response.Result.Details.length > 0) {
          const latestDetail = response.Result.Details[response.Result.Details.length - 1];
          const latestStatus = this.mapStatusCodeToLogisticsStatus(latestDetail.StatusCode);
          
          if (logisticsOrder.status !== latestStatus) {
            logisticsOrder.status = latestStatus;
            logisticsOrder.statusDesc = latestDetail.StatusDesc;
            logisticsOrder.lastApiCall = new Date();
            await this.logisticsOrderRepository.save(logisticsOrder);
          }
        }
      }

      this.logger.log('物流貨態歷程查詢成功', {
        merchantOrderNo,
        recordCount: statusRecords.length
      });

      return statusRecords;
    } catch (error) {
      this.logger.error('查詢物流貨態歷程失敗', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        '查詢物流貨態歷程時發生錯誤',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 6. 修改物流配送單 API (modifyShipment)
   */
  async modifyShipment(dto: ModifyShipmentDto): Promise<LogisticsOrder> {
    try {
      this.logger.log('修改物流配送單', { merchantOrderNo: dto.merchantOrderNo });

      // 檢查訂單是否存在且可修改
      const logisticsOrder = await this.logisticsOrderRepository.findOne({
        where: { merchantOrderNo: dto.merchantOrderNo }
      });

      if (!logisticsOrder) {
        throw new HttpException(
          '找不到對應的物流訂單',
          HttpStatus.NOT_FOUND
        );
      }

      if (!logisticsOrder.canModify()) {
        throw new HttpException(
          '該物流訂單狀態不允許修改',
          HttpStatus.BAD_REQUEST
        );
      }

      const params: ModifyShipmentParams = {
        RespondType: 'JSON',
        TimeStamp: NewebpayCryptoUtil.generateTimestamp(),
        Version: this.config.version,
        MerchantOrderNo: dto.merchantOrderNo,
        ReceiverName: dto.receiverName,
        ReceiverPhone: dto.receiverPhone,
        ReceiverCellPhone: dto.receiverCellPhone,
        ReceiverEmail: dto.receiverEmail,
        CVSStoreID: dto.cvsStoreId
      };

      const response = await this.sendEncryptedRequest<ModifyShipmentResponse>(
        ApiEndpoint.MODIFY_SHIPMENT,
        params
      );

      if (response.Status !== 'SUCCESS') {
        throw new HttpException(
          `修改物流配送單失敗: ${response.Message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // 更新本地記錄
      if (dto.receiverName) logisticsOrder.receiverName = dto.receiverName;
      if (dto.receiverPhone) logisticsOrder.receiverPhone = dto.receiverPhone;
      if (dto.receiverCellPhone) logisticsOrder.receiverCellPhone = dto.receiverCellPhone;
      if (dto.receiverEmail) logisticsOrder.receiverEmail = dto.receiverEmail;
      if (dto.cvsStoreId) logisticsOrder.cvsStoreId = dto.cvsStoreId;
      
      logisticsOrder.apiResponse = response;
      logisticsOrder.lastApiCall = new Date();

      const savedOrder = await this.logisticsOrderRepository.save(logisticsOrder);

      // 建立修改記錄
      await this.createStatusRecord(
        savedOrder.id,
        savedOrder.status,
        '物流配送單資訊已修改',
        savedOrder.status,
        ApiEndpoint.MODIFY_SHIPMENT,
        response
      );

      this.logger.log('物流配送單修改成功', {
        merchantOrderNo: dto.merchantOrderNo
      });

      return savedOrder;
    } catch (error) {
      this.logger.error('修改物流配送單失敗', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        '修改物流配送單時發生錯誤',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 7. 物流標籤列印 API (printLabel)
   */
  async printLabel(merchantOrderNo: string): Promise<string> {
    try {
      this.logger.log('取得物流標籤', { merchantOrderNo });

      const params: PrintLabelParams = {
        RespondType: 'JSON',
        TimeStamp: NewebpayCryptoUtil.generateTimestamp(),
        Version: this.config.version,
        MerchantOrderNo: merchantOrderNo
      };

      const response = await this.sendEncryptedRequest<PrintLabelResponse>(
        ApiEndpoint.PRINT_LABEL,
        params
      );

      if (response.Status !== 'SUCCESS') {
        throw new HttpException(
          `取得物流標籤失敗: ${response.Message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // 更新物流訂單的標籤 URL
      const logisticsOrder = await this.logisticsOrderRepository.findOne({
        where: { merchantOrderNo }
      });

      if (logisticsOrder && response.Result?.LabelURL) {
        logisticsOrder.labelUrl = response.Result.LabelURL;
        logisticsOrder.lastApiCall = new Date();
        await this.logisticsOrderRepository.save(logisticsOrder);
      }

      this.logger.log('物流標籤取得成功', {
        merchantOrderNo,
        labelUrl: response.Result?.LabelURL
      });

      return response.Result?.LabelURL || '';
    } catch (error) {
      this.logger.error('取得物流標籤失敗', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        '取得物流標籤時發生錯誤',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 工具方法：將藍新金流狀態代碼對應到系統狀態
   */
  private mapStatusCodeToLogisticsStatus(statusCode: string): LogisticsStatus {
    // 根據藍新金流文件定義的狀態代碼進行對應
    const statusMapping: Record<string, LogisticsStatus> = {
      '1': LogisticsStatus.CREATED,      // 已建立
      '2': LogisticsStatus.PICKED_UP,    // 已取貨
      '3': LogisticsStatus.IN_TRANSIT,   // 運送中
      '4': LogisticsStatus.DELIVERED,    // 已送達
      '5': LogisticsStatus.FAILED,       // 配送失敗
      '6': LogisticsStatus.RETURNED,     // 已退貨
      // 可以根據實際文件增加更多對應
    };

    return statusMapping[statusCode] || LogisticsStatus.PENDING;
  }

  /**
   * 取得物流訂單（包含狀態記錄）
   */
  async getLogisticsOrder(merchantOrderNo: string): Promise<LogisticsOrder> {
    const order = await this.logisticsOrderRepository.findOne({
      where: { merchantOrderNo },
      relations: ['statusRecords', 'order']
    });

    if (!order) {
      throw new HttpException(
        '找不到對應的物流訂單',
        HttpStatus.NOT_FOUND
      );
    }

    return order;
  }

  /**
   * 取得物流訂單列表
   */
  async getLogisticsOrders(
    page: number = 1,
    limit: number = 20,
    status?: LogisticsStatus
  ): Promise<{ orders: LogisticsOrder[]; total: number }> {
    const queryBuilder = this.logisticsOrderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.statusRecords', 'statusRecords')
      .orderBy('order.createdAt', 'DESC');

    if (status) {
      queryBuilder.where('order.status = :status', { status });
    }

    const [orders, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { orders, total };
  }
}