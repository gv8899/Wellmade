import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // 帶分頁和排序的查找產品
  async findAll(queryParams: FindProductsDto = {}): Promise<{ items: Product[]; total: number }> {
    const {
      skip = 0,
      take = 10,
      sortBy = 'createdAt',
      order = 'DESC',
      category,
      brand,
      minPrice,
      maxPrice,
      search,
    } = queryParams;

    // 構建查詢條件
    const whereConditions: any = {};
    
    // 如果有分類篩選
    if (category) {
      whereConditions.category = category;
    }
    
    // 如果有品牌篩選
    if (brand) {
      whereConditions.brand = brand;
    }

    // 如果有價格範圍篩選
    if (minPrice !== undefined || maxPrice !== undefined) {
      whereConditions.price = {};
      
      if (minPrice !== undefined) {
        whereConditions.price = { ...whereConditions.price, gte: minPrice };
      }
      
      if (maxPrice !== undefined) {
        whereConditions.price = { ...whereConditions.price, lte: maxPrice };
      }
    }

    // 如果有搜尋關鍵詞
    if (search) {
      whereConditions.name = Like(`%${search}%`);
    }

    // 執行查詢
    const [items, total] = await this.productRepository.findAndCount({
      where: whereConditions,
      order: { [sortBy]: order },
      skip,
      take,
    });

    return { items, total };
  }

  // 根據 ID 查找單個產品
  async findOne(id: string): Promise<Product> {
    try {
      // 檢查是否為有效的 UUID 格式
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        throw new BadRequestException('Invalid product ID format. Expected UUID format.');
      }
      
      const product = await this.productRepository.findOne({ where: { id } });
      
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      
      // 確保產品是啟用狀態的
      if (!product.isActive) {
        throw new NotFoundException(`Product with ID ${id} is not available`);
      }
      
      return product;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error retrieving product: ${error.message}`);
    }
  }

  // 創建新產品
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  // 更新產品
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id); // 確認產品存在
    
    // 使用 Object.assign 合併現有產品和更新數據
    const updatedProduct = Object.assign(product, updateProductDto);
    
    return this.productRepository.save(updatedProduct);
  }

  // 刪除產品
  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
  
  // 根據類別查找產品 (為了相容性保留，但建議使用 findAll 並傳入 category 參數)
  async findByCategory(category: string): Promise<Product[]> {
    const { items } = await this.findAll({ category });
    return items;
  }
}
