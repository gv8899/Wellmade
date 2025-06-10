import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Brand } from './brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { FindBrandsDto } from './dto/find-brands.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandsRepository: Repository<Brand>,
  ) {}

  async findAll(queryParams: FindBrandsDto): Promise<{ items: Brand[]; total: number }> {
    const {
      skip = 0,
      take = 10,
      sortBy = 'createdAt',
      order = 'DESC',
      isActive,
      search,
    } = queryParams;

    // 構建查詢條件
    const whereConditions: any = {};
    
    // 如果有狀態篩選
    if (isActive !== undefined) {
      whereConditions.isActive = isActive;
    }

    // 如果有關鍵字搜尋
    const searchFields = ['name', 'description'];
    const searchOptions = search ? searchFields.map(field => ({ [field]: ILike(`%${search}%`) })) : [];

    // 建立查詢
    const [items, total] = await this.brandsRepository.findAndCount({
      where: search ? searchOptions : whereConditions,
      order: { [sortBy]: order },
      skip,
      take,
    });

    return { items, total };
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    
    if (!brand) {
      throw new NotFoundException(`品牌 ID: ${id} 不存在`);
    }
    
    return brand;
  }

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const brand = this.brandsRepository.create(createBrandDto);
    return await this.brandsRepository.save(brand);
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);
    const updatedBrand = this.brandsRepository.merge(brand, updateBrandDto);
    return await this.brandsRepository.save(updatedBrand);
  }

  async remove(id: string): Promise<void> {
    const brand = await this.findOne(id);
    await this.brandsRepository.remove(brand);
  }
  
  async softRemove(id: string): Promise<Brand> {
    const brand = await this.findOne(id);
    brand.isActive = false;
    return await this.brandsRepository.save(brand);
  }
}
