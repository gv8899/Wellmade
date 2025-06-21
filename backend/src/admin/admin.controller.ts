import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.enum';
import { AdminService } from './admin.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { CreateBrandDto } from '../brands/dto/create-brand.dto';
import { UpdateBrandDto } from '../brands/dto/update-brand.dto';
import { FindProductsDto } from '../products/dto/find-products.dto';

@ApiTags('admin')
@Controller('admin')
@Roles(UserRole.ADMIN) // 整個控制器都需要管理員權限
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========== 產品管理 ==========

  @ApiOperation({ summary: '管理員 - 獲取所有產品（包含非活躍產品）' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  @Get('products')
  async getAllProducts(@Query() queryParams: FindProductsDto) {
    return this.adminService.getAllProducts(queryParams);
  }

  @ApiOperation({ summary: '管理員 - 獲取單個產品詳情' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    return this.adminService.getProductById(id);
  }

  @ApiOperation({ summary: '管理員 - 創建產品' })
  @ApiResponse({ status: 201, description: '創建成功' })
  @Post('products')
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.adminService.createProduct(createProductDto);
  }

  @ApiOperation({ summary: '管理員 - 更新產品' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @Patch('products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.adminService.updateProduct(id, updateProductDto);
  }

  @ApiOperation({ summary: '管理員 - 刪除產品' })
  @ApiResponse({ status: 204, description: '刪除成功' })
  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  @ApiOperation({ summary: '管理員 - 切換產品狀態' })
  @ApiResponse({ status: 200, description: '狀態切換成功' })
  @Patch('products/:id/toggle-status')
  async toggleProductStatus(@Param('id') id: string) {
    return this.adminService.toggleProductStatus(id);
  }

  // ========== 品牌管理 ==========

  @ApiOperation({ summary: '管理員 - 獲取所有品牌（包含非活躍品牌）' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  @Get('brands')
  async getAllBrands() {
    return this.adminService.getAllBrands();
  }

  @ApiOperation({ summary: '管理員 - 創建品牌' })
  @ApiResponse({ status: 201, description: '創建成功' })
  @Post('brands')
  async createBrand(@Body() createBrandDto: CreateBrandDto) {
    return this.adminService.createBrand(createBrandDto);
  }

  @ApiOperation({ summary: '管理員 - 更新品牌' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @Patch('brands/:id')
  async updateBrand(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.adminService.updateBrand(id, updateBrandDto);
  }

  @ApiOperation({ summary: '管理員 - 刪除品牌' })
  @ApiResponse({ status: 204, description: '刪除成功' })
  @Delete('brands/:id')
  async deleteBrand(@Param('id') id: string) {
    return this.adminService.deleteBrand(id);
  }

  @ApiOperation({ summary: '管理員 - 切換品牌狀態' })
  @ApiResponse({ status: 200, description: '狀態切換成功' })
  @Patch('brands/:id/toggle-status')
  async toggleBrandStatus(@Param('id') id: string) {
    return this.adminService.toggleBrandStatus(id);
  }

  // ========== 圖片上傳 ==========

  @ApiOperation({ summary: '管理員 - 上傳單張圖片' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上傳成功' })
  @Post('upload/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.adminService.uploadImage(file);
  }

  @ApiOperation({ summary: '管理員 - 上傳多張圖片' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上傳成功' })
  @Post('upload/images')
  @UseInterceptors(FilesInterceptor('files', 10)) // 最多 10 張圖片
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.adminService.uploadImages(files);
  }

  // ========== 統計資料 ==========

  @ApiOperation({ summary: '管理員 - 獲取總覽統計' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ========== 用戶管理 ==========

  @ApiOperation({ summary: '管理員 - 獲取所有用戶' })
  @ApiResponse({ status: 200, description: '獲取成功' })
  @Get('users')
  async getAllUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getAllUsers(page, limit);
  }

  @ApiOperation({ summary: '管理員 - 更新用戶角色' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @Patch('users/:id/roles')
  async updateUserRoles(
    @Param('id') id: string,
    @Body() body: { roles: UserRole[] },
  ) {
    return this.adminService.updateUserRoles(id, body.roles);
  }
}
