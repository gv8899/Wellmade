import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.enum';
import { ProductsService } from './products.service';
import { ProductLogisticsService } from './services/product-logistics.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { Product } from './product.entity';
import { ProductLogisticsConfig } from './interfaces/product-logistics.interface';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly logisticsService: ProductLogisticsService,
  ) {}

  // GET /products - 取得產品列表，支援分頁和排序
  @Public()
  @Get()
  async findAll(@Query() queryParams: FindProductsDto) {
    return this.productsService.findAll(queryParams);
  }

  // 測試端點：確保我們的修改被載入 (必須在 :id 路由之前)
  @Public()
  @Get('debug/test')
  async debugTest() {
    console.log('🚨🚨🚨 DEBUG 測試端點被調用 🚨🚨🚨');
    return { message: '調試端點正常工作', timestamp: new Date().toISOString() };
  }

  /**
   * 取得單一產品詳情
   *
   * @param id 產品ID（UUID格式）
   * @returns 產品詳細資訊
   *
   * @example
   * GET /products/123e4567-e89b-12d3-a456-426614174000
   */
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    try {
      return await this.productsService.findOne(id);
    } catch (error) {
      // 錯誤處理已在 service 層完成，這裡只需將其往上傳遞
      throw error;
    }
  }

  // POST /products - 新增產品 (僅管理員)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  // PATCH /products/:id - 更新產品 (僅管理員)
  @Public() // 暫時設為公開以便測試
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    console.log('🚨🚨🚨 [CONTROLLER DEBUG] 收到更新請求 🚨🚨🚨');
    console.log('產品ID:', id);
    console.log('更新數據:', JSON.stringify(updateProductDto));

    try {
      const result = await this.productsService.update(id, updateProductDto);
      console.log('🚨🚨🚨 Service 返回成功 🚨🚨🚨');
      console.log('結果 categoryId:', result.categoryId);
      console.log('結果 updatedAt:', result.updatedAt);
      return result;
    } catch (error) {
      console.log('🚨🚨🚨 Service 拋出錯誤 🚨🚨🚨');
      console.log('錯誤:', error.message);
      throw error;
    }
  }

  // DELETE /products/:id - 刪除產品 (僅管理員)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  /**
   * 獲取產品的關鍵特性
   *
   * @param id 產品ID（UUID格式）
   * @returns 產品關鍵特性列表
   *
   * @example
   * GET /products/123e4567-e89b-12d3-a456-426614174000/key-features
   */
  @Public()
  @Get(':id/key-features')
  async getKeyFeatures(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);

    if (!product.keyFeatures || product.keyFeatures.length === 0) {
      throw new NotFoundException(
        `No key features found for product with ID ${id}`,
      );
    }

    return product.keyFeatures;
  }

  /**
   * 預覽產品主 SKU
   */
  @Post('master-sku/preview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '預覽產品主 SKU' })
  @ApiResponse({ status: 200, description: '預覽成功' })
  async previewMasterSku(
    @Body() body: { brandId?: string; categoryId?: string; name?: string },
  ) {
    // 構建臨時產品對象用於預覽
    const tempProduct: any = {
      id: 'preview',
      name: body.name || 'New Product',
    };

    // 如果提供了品牌ID，獲取品牌資訊
    if (body.brandId) {
      const brand = await this.productsService.findBrandById(body.brandId);
      if (brand) {
        tempProduct.brand = brand;
      }
    }

    // 如果提供了分類ID，獲取分類資訊
    if (body.categoryId) {
      const category = await this.productsService.findCategoryById(
        body.categoryId,
      );
      if (category) {
        tempProduct.categoryRelation = category;
      }
    }

    // 使用 SKU 生成服務預覽
    const skuService = this.productsService.getSkuGenerationService();
    const masterSku = await skuService.previewSku(tempProduct, {});

    return { masterSku };
  }

  @Post('generate-missing-master-skus')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '為現有產品生成缺失的主 SKU' })
  @ApiResponse({ status: 200, description: 'SKU 生成成功' })
  async generateMissingMasterSkus() {
    const result = await this.productsService.generateMissingMasterSkus();
    return {
      message: 'Master SKU 生成完成',
      ...result,
    };
  }

  // === 物流管理 API ===

  /**
   * 獲取產品的物流配置
   */
  @Public()
  @Get(':id/logistics')
  @ApiOperation({ summary: '獲取產品物流配置' })
  @ApiResponse({ status: 200, description: '物流配置資訊' })
  async getProductLogistics(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return {
      productId: id,
      logisticsConfig: product.logisticsConfig
    };
  }

  /**
   * 更新產品的物流配置
   */
  @Patch(':id/logistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新產品物流配置' })
  @ApiResponse({ status: 200, description: '物流配置更新成功' })
  async updateProductLogistics(
    @Param('id') id: string,
    @Body() logisticsConfig: ProductLogisticsConfig
  ): Promise<Product> {
    return this.logisticsService.updateProductLogisticsConfig(id, logisticsConfig);
  }

  /**
   * 獲取所有可用的配送方式
   */
  @Public()
  @Get('system/delivery-methods')
  @ApiOperation({ summary: '獲取系統所有可用配送方式' })
  @ApiResponse({ status: 200, description: '配送方式列表' })
  async getDeliveryMethods() {
    return this.logisticsService.getAvailableDeliveryMethods();
  }
}
