import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { Product } from './product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /products - 取得產品列表，支援分頁和排序
  @Public()
  @Get()
  async findAll(@Query() queryParams: FindProductsDto) {
    return this.productsService.findAll(queryParams);
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

  // POST /products - 新增產品
  @Public()
  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  // PATCH /products/:id - 更新產品
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  // DELETE /products/:id - 刪除產品
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
