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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { QueryBannerDto } from './dto/query-banner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../users/user.enum';
import { BannerPosition } from './banner.entity';

@Controller('banners')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  /**
   * 創建 Banner（管理員專用）
   */
  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createBannerDto: CreateBannerDto) {
    return await this.bannersService.create(createBannerDto);
  }

  /**
   * 獲取 Banner 列表（管理員專用）
   */
  @Get('admin')
  @Roles(UserRole.ADMIN)
  async findAllForAdmin(@Query() queryDto: QueryBannerDto) {
    return await this.bannersService.findAll(queryDto);
  }

  /**
   * 獲取公開 Banner 列表（無需認證）
   */
  @Get()
  @Public()
  async findPublic(@Query('position') position?: BannerPosition) {
    return await this.bannersService.findPublic(position);
  }

  /**
   * 根據位置獲取 Banner 列表（無需認證）
   */
  @Get('position/:position')
  @Public()
  async findByPosition(@Param('position') position: BannerPosition) {
    return await this.bannersService.findPublic(position);
  }

  /**
   * 獲取單個 Banner（管理員專用）
   */
  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return await this.bannersService.findOne(id);
  }

  /**
   * 更新 Banner（管理員專用）
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return await this.bannersService.update(id, updateBannerDto);
  }

  /**
   * 切換 Banner 啟用狀態（管理員專用）
   */
  @Patch(':id/toggle')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async toggleActive(@Param('id') id: string) {
    return await this.bannersService.toggleActive(id);
  }

  /**
   * 更新 Banner 排序（管理員專用）
   */
  @Patch(':id/sort-order')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateSortOrder(
    @Param('id') id: string,
    @Body('sortOrder') sortOrder: number,
  ) {
    return await this.bannersService.updateSortOrder(id, sortOrder);
  }

  /**
   * 批量更新排序（管理員專用）
   */
  @Patch('batch/sort-order')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateBatchSortOrder(
    @Body('updates') updates: { id: string; sortOrder: number }[],
  ) {
    return await this.bannersService.updateBatchSortOrder(updates);
  }

  /**
   * 刪除 Banner（管理員專用）
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.bannersService.remove(id);
  }
}