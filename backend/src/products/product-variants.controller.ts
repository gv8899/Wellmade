import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.enum';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Product Variants')
@Controller('products')
export class ProductVariantsController {
  constructor(private readonly variantsService: ProductVariantsService) {}

  @Post(':productId/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '為產品創建變體' })
  @ApiParam({ name: 'productId', description: '產品ID' })
  @ApiResponse({ status: 201, description: '變體創建成功' })
  @ApiResponse({ status: 404, description: '產品不存在' })
  @ApiResponse({ status: 409, description: 'SKU已存在' })
  async create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body(ValidationPipe) createVariantDto: CreateProductVariantDto,
  ) {
    // 確保 productId 一致
    createVariantDto.productId = productId;
    return await this.variantsService.create(createVariantDto);
  }

  @Get(':productId/variants')
  @Public()
  @ApiOperation({ summary: '獲取產品的所有變體' })
  @ApiParam({ name: 'productId', description: '產品ID' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  async findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return await this.variantsService.findByProductId(productId);
  }

  @Get('variants/:id')
  @Public()
  @ApiOperation({ summary: '獲取單一變體詳情' })
  @ApiParam({ name: 'id', description: '變體ID' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  @ApiResponse({ status: 404, description: '變體不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.variantsService.findOne(id);
  }

  @Get('variants/sku/:sku')
  @Public()
  @ApiOperation({ summary: '根據SKU獲取變體' })
  @ApiParam({ name: 'sku', description: '變體SKU' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  @ApiResponse({ status: 404, description: '變體不存在' })
  async findBySku(@Param('sku') sku: string) {
    return await this.variantsService.findBySku(sku);
  }

  @Patch('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新變體' })
  @ApiParam({ name: 'id', description: '變體ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '變體不存在' })
  @ApiResponse({ status: 409, description: 'SKU已存在' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateVariantDto: UpdateVariantDto,
  ) {
    return await this.variantsService.update(id, updateVariantDto);
  }

  @Post('variants/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量更新變體庫存' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateStock(
    @Body() updates: { id: string; stock: number }[],
  ) {
    await this.variantsService.updateStock(updates);
    return { message: '庫存更新成功' };
  }

  @Get('variants/available')
  @Public()
  @ApiOperation({ summary: '獲取所有可購買的變體' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  async findAvailableVariants() {
    return await this.variantsService.findAvailableVariants();
  }

  @Patch('variants/:id/stock/reduce')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '減少變體庫存（下單時）' })
  @ApiParam({ name: 'id', description: '變體ID' })
  @ApiResponse({ status: 200, description: '減少成功' })
  @ApiResponse({ status: 400, description: '庫存不足或無法購買' })
  async reduceStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { quantity: number },
  ) {
    return await this.variantsService.decrementStock(id, body.quantity);
  }

  @Patch('variants/:id/stock/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '恢復變體庫存（取消訂單時）' })
  @ApiParam({ name: 'id', description: '變體ID' })
  @ApiResponse({ status: 200, description: '恢復成功' })
  async restoreStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { quantity: number },
  ) {
    return await this.variantsService.restoreStock(id, body.quantity);
  }

  @Patch('variants/sort-order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量更新變體排序' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateSortOrder(@Body() updates: { id: string; sortOrder: number }[]) {
    await this.variantsService.updateSortOrder(updates);
    return { message: '排序更新成功' };
  }

  @Delete('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '刪除變體' })
  @ApiParam({ name: 'id', description: '變體ID' })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '變體不存在' })
  @ApiResponse({ status: 400, description: '無法刪除產品的最後一個變體' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.variantsService.remove(id);
    return { message: '變體刪除成功' };
  }
}