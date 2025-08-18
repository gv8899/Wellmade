import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../users/user.enum';

import { NewebpayLogisticsService } from './newebpay-logistics.service';
import { LogisticsOrder } from './entities/logistics-order.entity';
import { LogisticsStatusRecord } from './entities/logistics-status-record.entity';
import { LogisticsStatus } from './interfaces/newebpay-logistics.interface';

import {
  CreateShipmentDto,
  ModifyShipmentDto,
  QueryShipmentDto,
  GetStoreMapDto
} from './dto/create-shipment.dto';

/**
 * 物流控制器
 * 提供藍新金流物流服務的 RESTful API 端點
 */
@Controller('api/logistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogisticsController {
  private readonly logger = new Logger(LogisticsController.name);

  constructor(
    private readonly logisticsService: NewebpayLogisticsService
  ) {}

  /**
   * 取得門市地圖選取 URL
   * GET /api/logistics/store-map
   */
  @Get('store-map')
  @HttpCode(HttpStatus.OK)
  async getStoreMap(@Query() dto: GetStoreMapDto): Promise<{ storeMapUrl: string }> {
    this.logger.log('取得門市地圖選取 URL', { cvsType: dto.cvsType });
    
    const storeMapUrl = await this.logisticsService.getStoreMap(dto);
    
    return { storeMapUrl };
  }

  /**
   * 藍新金流門市地圖選取
   * POST /api/logistics/newebpay/store-map
   */
  @Post('newebpay/store-map')
  @Public()
  @HttpCode(HttpStatus.OK)
  async newebpayStoreMap(@Body() dto: {
    ShipType: number;
    MerchantOrderNo: string;
    ReturnURL: string;
  }): Promise<{ 
    success: boolean; 
    mapUrl: string; 
    message?: string; 
  }> {
    this.logger.log('藍新金流門市地圖選取', dto);
    
    try {
      const mapUrl = await this.logisticsService.getNewebpayStoreMap(dto);
      
      return {
        success: true,
        mapUrl,
        message: '門市地圖 URL 生成成功'
      };
    } catch (error) {
      this.logger.error('藍新金流門市地圖選取失敗', error);
      
      // 返回錯誤，讓前端處理測試模式
      throw error;
    }
  }

  /**
   * 建立物流配送單
   * POST /api/logistics/shipment
   */
  @Post('shipment')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async createShipment(@Body() dto: CreateShipmentDto): Promise<LogisticsOrder> {
    this.logger.log('建立物流配送單', { merchantOrderNo: dto.merchantOrderNo });
    
    return this.logisticsService.createShipment(dto);
  }

  /**
   * 查詢物流配送單
   * GET /api/logistics/shipment/:merchantOrderNo
   */
  @Get('shipment/:merchantOrderNo')
  @HttpCode(HttpStatus.OK)
  async getShipment(
    @Param('merchantOrderNo') merchantOrderNo: string
  ): Promise<LogisticsOrder> {
    this.logger.log('查詢物流配送單', { merchantOrderNo });
    
    return this.logisticsService.getLogisticsOrder(merchantOrderNo);
  }

  /**
   * 查詢物流配送單（呼叫遠端 API）
   * POST /api/logistics/shipment/query
   */
  @Post('shipment/query')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async queryShipment(@Body() dto: QueryShipmentDto): Promise<LogisticsOrder> {
    this.logger.log('查詢物流配送單（遠端 API）', { merchantOrderNo: dto.merchantOrderNo });
    
    return this.logisticsService.queryShipment(dto);
  }

  /**
   * 修改物流配送單
   * PATCH /api/logistics/shipment
   */
  @Patch('shipment')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async modifyShipment(@Body() dto: ModifyShipmentDto): Promise<LogisticsOrder> {
    this.logger.log('修改物流配送單', { merchantOrderNo: dto.merchantOrderNo });
    
    return this.logisticsService.modifyShipment(dto);
  }

  /**
   * 取得寄件單號
   * POST /api/logistics/shipment/:merchantOrderNo/shipment-no
   */
  @Post('shipment/:merchantOrderNo/shipment-no')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async getShipmentNo(
    @Param('merchantOrderNo') merchantOrderNo: string
  ): Promise<{ shipmentNo: string }> {
    this.logger.log('取得寄件單號', { merchantOrderNo });
    
    const shipmentNo = await this.logisticsService.getShipmentNo(merchantOrderNo);
    
    return { shipmentNo };
  }

  /**
   * 查詢物流貨態歷程
   * POST /api/logistics/shipment/:merchantOrderNo/trace
   */
  @Post('shipment/:merchantOrderNo/trace')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async traceShipment(
    @Param('merchantOrderNo') merchantOrderNo: string
  ): Promise<LogisticsStatusRecord[]> {
    this.logger.log('查詢物流貨態歷程', { merchantOrderNo });
    
    return this.logisticsService.traceShipment(merchantOrderNo);
  }

  /**
   * 取得物流標籤
   * POST /api/logistics/shipment/:merchantOrderNo/label
   */
  @Post('shipment/:merchantOrderNo/label')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async printLabel(
    @Param('merchantOrderNo') merchantOrderNo: string
  ): Promise<{ labelUrl: string }> {
    this.logger.log('取得物流標籤', { merchantOrderNo });
    
    const labelUrl = await this.logisticsService.printLabel(merchantOrderNo);
    
    return { labelUrl };
  }

  /**
   * 取得物流訂單列表
   * GET /api/logistics/orders
   */
  @Get('orders')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async getLogisticsOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: LogisticsStatus
  ): Promise<{
    orders: LogisticsOrder[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    this.logger.log('取得物流訂單列表', { page, limit, status });
    
    // 限制每頁最大數量
    const maxLimit = 100;
    const actualLimit = Math.min(limit, maxLimit);
    
    const { orders, total } = await this.logisticsService.getLogisticsOrders(
      page, 
      actualLimit, 
      status
    );
    
    const totalPages = Math.ceil(total / actualLimit);
    
    return {
      orders,
      total,
      page,
      limit: actualLimit,
      totalPages
    };
  }

  /**
   * 物流狀態回調端點 (Webhook)
   * POST /api/logistics/webhook/status-update
   * 
   * 此端點用於接收藍新金流的物流狀態更新通知
   * 需要設為公開端點，因為是外部系統呼叫
   */
  @Post('webhook/status-update')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleStatusUpdate(@Body() data: any): Promise<{ message: string }> {
    this.logger.log('收到物流狀態更新通知', data);
    
    try {
      // 這裡應該實作狀態更新邏輯
      // 1. 驗證請求來源
      // 2. 解密資料
      // 3. 更新物流訂單狀態
      // 4. 發送通知給用戶
      
      // 目前先記錄並回應成功
      this.logger.log('物流狀態更新處理完成', { data });
      
      return { message: 'Status update received successfully' };
    } catch (error) {
      this.logger.error('處理物流狀態更新失敗', error);
      
      // 即使處理失敗也要回應 200，避免藍新金流重複發送
      return { message: 'Status update processing failed but acknowledged' };
    }
  }

  /**
   * 門市選取回調端點
   * POST /api/logistics/webhook/store-selected
   * 
   * 此端點用於接收門市選取結果
   */
  @Post('webhook/store-selected')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleStoreSelection(@Body() data: any): Promise<{ message: string }> {
    this.logger.log('收到門市選取結果', data);
    
    try {
      // 這裡應該實作門市選取處理邏輯
      // 1. 驗證請求來源
      // 2. 解密門市資料
      // 3. 儲存門市資訊
      // 4. 通知前端或相關系統
      
      this.logger.log('門市選取處理完成', { data });
      
      return { message: 'Store selection received successfully' };
    } catch (error) {
      this.logger.error('處理門市選取失敗', error);
      
      return { message: 'Store selection processing failed but acknowledged' };
    }
  }

  /**
   * 取得物流訂單統計資料
   * GET /api/logistics/statistics
   */
  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async getLogisticsStatistics(): Promise<{
    totalOrders: number;
    statusCounts: Record<LogisticsStatus, number>;
    recentOrders: LogisticsOrder[];
  }> {
    this.logger.log('取得物流訂單統計資料');
    
    // 這裡可以實作統計邏輯
    // 目前先回傳基本結構
    
    const { orders: recentOrders } = await this.logisticsService.getLogisticsOrders(1, 10);
    
    // 計算狀態統計（簡化版本）
    const statusCounts = {
      [LogisticsStatus.PENDING]: 0,
      [LogisticsStatus.CREATED]: 0,
      [LogisticsStatus.PICKED_UP]: 0,
      [LogisticsStatus.IN_TRANSIT]: 0,
      [LogisticsStatus.DELIVERED]: 0,
      [LogisticsStatus.FAILED]: 0,
      [LogisticsStatus.RETURNED]: 0
    };
    
    recentOrders.forEach(order => {
      statusCounts[order.status]++;
    });
    
    return {
      totalOrders: recentOrders.length, // 實際上應該查詢總數
      statusCounts,
      recentOrders
    };
  }

  /**
   * 健康檢查端點
   * GET /api/logistics/health
   */
  @Get('health')
  @Public()
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<{ 
    status: string; 
    timestamp: string;
    service: string;
  }> {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Newebpay Logistics Service'
    };
  }
}