import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../auth/decorators/public.decorator';
import { ProductLogisticsService } from '../../products/services/product-logistics.service';
import { CartDeliveryAvailability } from '../../products/interfaces/product-logistics.interface';

class CartItemDto {
  @IsString()
  productId: string;
  
  @IsOptional()
  @IsString()
  variantId?: string;
  
  @IsNumber()
  quantity: number;
}

export class CheckCartLogisticsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  cartItems: CartItemDto[];
}

@ApiTags('購物車物流')
@Controller('api/cart/logistics')
export class CartLogisticsController {
  constructor(
    private readonly logisticsService: ProductLogisticsService,
  ) {}

  @Public()
  @Post('check-availability')
  @ApiOperation({ 
    summary: '檢查購物車配送方式可用性',
    description: '根據購物車中的商品檢查各種配送方式的可用性和限制'
  })
  @ApiResponse({ 
    status: 200, 
    description: '返回各配送方式的可用性資訊',
    type: [Object] // 應該定義具體的 DTO，這裡簡化處理
  })
  async checkCartDeliveryAvailability(
    @Body() dto: CheckCartLogisticsDto
  ): Promise<CartDeliveryAvailability[]> {
    return this.logisticsService.checkCartDeliveryAvailability(dto.cartItems);
  }

  @Public()
  @Post('get-available-methods')
  @ApiOperation({ 
    summary: '獲取可用的配送方式',
    description: '返回系統中所有啟用的配送方式配置'
  })
  async getAvailableDeliveryMethods() {
    return this.logisticsService.getAvailableDeliveryMethods();
  }

  // 可選：為認證用戶提供自動從購物車檢查的功能
  @Post('check-current-cart')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: '檢查當前用戶購物車的配送可用性',
    description: '自動檢查當前登入用戶購物車中商品的配送方式可用性'
  })
  async checkCurrentCartDeliveryAvailability(
    // 這裡需要注入 CartsService 來獲取用戶購物車
    // 暫時返回空陣列，實際實現需要整合 CartsService
  ): Promise<CartDeliveryAvailability[]> {
    // TODO: 實現自動獲取用戶購物車並檢查配送可用性
    // const userCart = await this.cartsService.getCartByUserId(userId);
    // return this.logisticsService.checkCartDeliveryAvailability(userCart.items);
    return [];
  }
}