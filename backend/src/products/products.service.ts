import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // 查找所有產品
  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  // 根據 ID 查找單個產品
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
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
  
  // 根據類別查找產品
  async findByCategory(category: string): Promise<Product[]> {
    return this.productRepository.find({ where: { category } });
  }
}
