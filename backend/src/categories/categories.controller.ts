import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ValidationPipe,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.enum';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '創建分類' })
  @ApiResponse({ status: 201, description: '分類創建成功' })
  @ApiResponse({ status: 400, description: '請求參數錯誤' })
  @ApiResponse({ status: 409, description: 'Slug已存在' })
  async create(
    @Body(ValidationPipe) createCategoryDto: CreateCategoryDto,
  ) {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: '獲取分類列表' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  async findAll(@Query(ValidationPipe) queryDto: QueryCategoryDto) {
    return await this.categoriesService.findAll(queryDto);
  }

  @Get('tree')
  @Public()
  @ApiOperation({ summary: '獲取分類樹狀結構' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  async findTree() {
    return await this.categoriesService.findTree();
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: '根據slug獲取分類' })
  @ApiParam({ name: 'slug', description: '分類slug' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  @ApiResponse({ status: 404, description: '分類不存在' })
  async findBySlug(@Param('slug') slug: string) {
    return await this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '獲取單一分類' })
  @ApiParam({ name: 'id', description: '分類ID' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  @ApiResponse({ status: 404, description: '分類不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新分類' })
  @ApiParam({ name: 'id', description: '分類ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '分類不存在' })
  @ApiResponse({ status: 409, description: 'Slug已存在' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoriesService.update(id, updateCategoryDto);
  }

  @Put('sort-order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量更新分類排序' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateSortOrder(
    @Body() updates: { id: string; sortOrder: number }[],
  ) {
    await this.categoriesService.updateSortOrder(updates);
    return { message: '排序更新成功' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '刪除分類' })
  @ApiParam({ name: 'id', description: '分類ID' })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '分類不存在' })
  @ApiResponse({ status: 400, description: '無法刪除有子分類或產品關聯的分類' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categoriesService.remove(id);
    return { message: '分類刪除成功' };
  }
}