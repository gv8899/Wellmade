import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { FindBrandsDto } from './dto/find-brands.dto';
import { Brand } from './brand.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Public()
  @ApiOperation({ summary: '取得所有品牌列表' })
  @ApiResponse({ status: 200, description: '取得成功', type: [Brand] })
  @Get()
  async findAll(@Query() query: FindBrandsDto) {
    return await this.brandsService.findAll(query);
  }

  @Public()
  @ApiOperation({ summary: '取得特定品牌' })
  @ApiResponse({ status: 200, description: '取得成功', type: Brand })
  @ApiResponse({ status: 404, description: '品牌不存在' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.brandsService.findOne(id);
  }

  @ApiOperation({ summary: '創建品牌' })
  @ApiResponse({ status: 201, description: '創建成功', type: Brand })
  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    return await this.brandsService.create(createBrandDto);
  }

  @ApiOperation({ summary: '更新品牌' })
  @ApiResponse({ status: 200, description: '更新成功', type: Brand })
  @ApiResponse({ status: 404, description: '品牌不存在' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return await this.brandsService.update(id, updateBrandDto);
  }

  @ApiOperation({ summary: '刪除品牌' })
  @ApiResponse({ status: 204, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '品牌不存在' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.brandsService.remove(id);
  }

  @ApiOperation({ summary: '停用品牌 (軟刪除)' })
  @ApiResponse({ status: 200, description: '停用成功', type: Brand })
  @ApiResponse({ status: 404, description: '品牌不存在' })
  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return await this.brandsService.softRemove(id);
  }
}
