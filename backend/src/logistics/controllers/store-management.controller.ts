import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/user.enum';
import { Public } from '../../auth/decorators/public.decorator';
// import { FamilyMartSyncService } from '../services/familymart-sync.service';
import { ConvenienceStore } from '../entities/convenience-store.entity';
import { ConvenienceStoreType } from '../interfaces/newebpay-logistics.interface';

/**
 * 門市管理控制器
 * 提供門市搜尋、同步和管理功能
 */
@ApiTags('Store Management')
@Controller('api/logistics/stores')
export class StoreManagementController {
  private readonly logger = new Logger(StoreManagementController.name);

  constructor(
    // private readonly familyMartSyncService: FamilyMartSyncService,
  ) {}

  /**
   * 搜尋便利商店
   */
  @Get('search')
  @Public()
  @ApiOperation({ summary: '搜尋便利商店' })
  @ApiQuery({ name: 'keyword', required: false, description: '關鍵字' })
  @ApiQuery({ name: 'storeType', required: false, description: '門市類型' })
  @ApiQuery({ name: 'city', required: false, description: '城市' })
  @ApiQuery({ name: 'area', required: false, description: '區域' })
  @ApiQuery({ name: 'latitude', required: false, description: '緯度' })
  @ApiQuery({ name: 'longitude', required: false, description: '經度' })
  @ApiQuery({ name: 'maxDistance', required: false, description: '最大距離(公里)' })
  @ApiQuery({ name: 'limit', required: false, description: '限制筆數' })
  @ApiResponse({ status: 200, description: '搜尋成功' })
  async searchStores(
    @Query('keyword') keyword?: string,
    @Query('storeType') storeType?: ConvenienceStoreType,
    @Query('city') city?: string,
    @Query('area') area?: string,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('maxDistance') maxDistance?: number,
    @Query('limit') limit?: number,
  ): Promise<{
    stores: ConvenienceStore[];
    total: number;
    searchParams: any;
  }> {
    try {
      this.logger.log('搜尋便利商店', {
        keyword,
        storeType,
        city,
        area,
        latitude,
        longitude,
        maxDistance,
        limit
      });

      let stores: ConvenienceStore[] = [];

      // 目前不支援全家便利商店搜尋（已移除）
      // TODO: 整合藍新金流官方物流 API
      if (!storeType || storeType === ConvenienceStoreType.FAMILY_MART) {
        // stores = await this.familyMartSyncService.searchFamilyMartStores({
        //   keyword,
        //   city,
        //   area,
        //   latitude,
        //   longitude,
        //   maxDistance,
        //   limit: limit || 50
        // });
        stores = []; // 暫時返回空陣列
      }

      // TODO: 可以在這裡添加其他超商類型的搜尋邏輯
      // if (storeType === ConvenienceStoreType.SEVEN_ELEVEN) {
      //   // 7-11 搜尋邏輯
      // }

      return {
        stores,
        total: stores.length,
        searchParams: {
          keyword,
          storeType,
          city,
          area,
          coordinates: latitude && longitude ? { latitude, longitude } : null,
          maxDistance,
          limit
        }
      };

    } catch (error) {
      this.logger.error('搜尋便利商店失敗', error);
      throw new HttpException(
        '搜尋便利商店失敗',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 取得門市詳細資訊
   */
  @Get('detail/:storeType/:storeId')
  @Public()
  @ApiOperation({ summary: '取得門市詳細資訊' })
  @ApiResponse({ status: 200, description: '取得成功' })
  async getStoreDetail(
    @Param('storeType') storeType: ConvenienceStoreType,
    @Param('storeId') storeId: string,
  ): Promise<ConvenienceStore | null> {
    try {
      this.logger.log('取得門市詳細資訊', { storeType, storeId });

      let store: ConvenienceStore | null = null;

      switch (storeType) {
        case ConvenienceStoreType.FAMILY_MART:
          // store = await this.familyMartSyncService.getFamilyMartStoreDetail(storeId);
          throw new HttpException('全家便利商店功能已暫停，請申請藍新金流正式物流認證', HttpStatus.NOT_IMPLEMENTED);
        // TODO: 添加其他超商類型
        default:
          throw new HttpException('不支援的超商類型', HttpStatus.BAD_REQUEST);
      }

      if (!store) {
        throw new HttpException('找不到指定門市', HttpStatus.NOT_FOUND);
      }

      return store;

    } catch (error) {
      this.logger.error('取得門市詳細資訊失敗', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        '取得門市資訊失敗',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 同步全家便利商店資料（開發測試用）
   */
  @Post('sync/familymart')
  @Public()
  @ApiOperation({ summary: '同步全家便利商店資料' })
  @ApiResponse({ status: 200, description: '同步成功' })
  async syncFamilyMartStores(): Promise<{
    success: boolean;
    message: string;
    result: {
      totalStores: number;
      newStores: number;
      updatedStores: number;
    };
  }> {
    try {
      this.logger.log('開始同步全家便利商店資料');

      // const result = await this.familyMartSyncService.syncFamilyMartStores();
      throw new HttpException('全家便利商店同步功能已暫停，請申請藍新金流正式物流認證', HttpStatus.NOT_IMPLEMENTED);

      // return {
      //   success: true,
      //   message: '全家便利商店資料同步完成',
      //   result
      // };

    } catch (error) {
      this.logger.error('同步全家便利商店資料失敗', error);
      throw new HttpException(
        '同步門市資料失敗',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 取得附近門市
   */
  @Get('nearby')
  @Public()
  @ApiOperation({ summary: '取得附近門市' })
  @ApiQuery({ name: 'latitude', required: true, description: '緯度' })
  @ApiQuery({ name: 'longitude', required: true, description: '經度' })
  @ApiQuery({ name: 'storeType', required: false, description: '門市類型' })
  @ApiQuery({ name: 'maxDistance', required: false, description: '最大距離(公里)', example: 5 })
  @ApiQuery({ name: 'limit', required: false, description: '限制筆數', example: 20 })
  @ApiResponse({ status: 200, description: '取得成功' })
  async getNearbyStores(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('storeType') storeType?: ConvenienceStoreType,
    @Query('maxDistance') maxDistance: number = 5,
    @Query('limit') limit: number = 20,
  ): Promise<{
    stores: (ConvenienceStore & { distance?: number })[];
    searchCenter: { latitude: number; longitude: number };
    maxDistance: number;
  }> {
    try {
      if (!latitude || !longitude) {
        throw new HttpException('緯度和經度為必填參數', HttpStatus.BAD_REQUEST);
      }

      this.logger.log('搜尋附近門市', {
        latitude,
        longitude,
        storeType,
        maxDistance,
        limit
      });

      let stores: ConvenienceStore[] = [];

      // 主要搜尋全家便利商店（已暫停）
      if (!storeType || storeType === ConvenienceStoreType.FAMILY_MART) {
        // stores = await this.familyMartSyncService.searchFamilyMartStores({
        //   latitude,
        //   longitude,
        //   maxDistance,
        //   limit
        // });
        stores = []; // 暫時返回空陣列
      }

      // 計算距離並排序
      const storesWithDistance = stores.map(store => {
        const distance = store.calculateDistance(latitude, longitude);
        return {
          ...store,
          distance
        };
      }).filter(store => store.distance !== null && store.distance <= maxDistance)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));

      return {
        stores: storesWithDistance as any, // 暫時使用 any 避免類型問題
        searchCenter: { latitude, longitude },
        maxDistance
      };

    } catch (error) {
      this.logger.error('搜尋附近門市失敗', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        '搜尋附近門市失敗',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 取得門市統計資訊（管理員專用）
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '取得門市統計資訊' })
  @ApiResponse({ status: 200, description: '取得成功' })
  async getStoreStatistics(): Promise<{
    totalStores: number;
    storesByType: Record<ConvenienceStoreType, number>;
    storesByCity: Record<string, number>;
    lastSyncTime: Date | null;
  }> {
    try {
      // 這裡可以實作更詳細的統計邏輯
      // 目前先返回基本資訊
      return {
        totalStores: 0,
        storesByType: {
          [ConvenienceStoreType.SEVEN_ELEVEN]: 0,
          [ConvenienceStoreType.FAMILY_MART]: 0,
          [ConvenienceStoreType.HI_LIFE]: 0,
          [ConvenienceStoreType.OK_MART]: 0,
        },
        storesByCity: {},
        lastSyncTime: null
      };

    } catch (error) {
      this.logger.error('取得門市統計資訊失敗', error);
      throw new HttpException(
        '取得統計資訊失敗',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}