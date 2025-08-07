import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Banner, BannerPosition } from './banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { QueryBannerDto } from './dto/query-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannersRepository: Repository<Banner>,
  ) {}

  /**
   * 創建新的 Banner
   */
  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    try {
      // 檢查日期邏輯
      if (createBannerDto.startDate && createBannerDto.endDate) {
        const startDate = new Date(createBannerDto.startDate);
        const endDate = new Date(createBannerDto.endDate);

        if (startDate >= endDate) {
          throw new BadRequestException('結束日期必須晚於開始日期');
        }
      }

      // 如果沒有指定排序，自動設定為最大值 + 1
      if (createBannerDto.sortOrder === undefined) {
        const maxOrder = await this.bannersRepository
          .createQueryBuilder('banner')
          .select('MAX(banner.sortOrder)', 'maxOrder')
          .where('banner.position = :position', {
            position: createBannerDto.position || BannerPosition.HOMEPAGE,
          })
          .getRawOne();

        createBannerDto.sortOrder = (maxOrder?.maxOrder || 0) + 1;
      }

      const banner = this.bannersRepository.create({
        ...createBannerDto,
        startDate: createBannerDto.startDate
          ? new Date(createBannerDto.startDate)
          : null,
        endDate: createBannerDto.endDate
          ? new Date(createBannerDto.endDate)
          : null,
      });

      return await this.bannersRepository.save(banner);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('創建 Banner 失敗：' + error.message);
    }
  }

  /**
   * 獲取 Banner 列表（管理員用）
   */
  async findAll(
    queryDto: QueryBannerDto,
  ): Promise<{ items: Banner[]; total: number }> {
    const {
      position,
      isActive,
      includeInactive,
      skip = 0,
      take = 20,
      onlyCurrentlyActive,
    } = queryDto;

    const queryBuilder = this.bannersRepository.createQueryBuilder('banner');

    // 篩選條件
    if (position) {
      queryBuilder.andWhere('banner.position = :position', { position });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('banner.isActive = :isActive', { isActive });
    }

    if (onlyCurrentlyActive) {
      const now = new Date();
      queryBuilder.andWhere('banner.isActive = true');
      queryBuilder.andWhere(
        '(banner.startDate IS NULL OR banner.startDate <= :now)',
        { now },
      );
      queryBuilder.andWhere(
        '(banner.endDate IS NULL OR banner.endDate > :now)',
        { now },
      );
    }

    // 排序
    queryBuilder.orderBy('banner.position', 'ASC');
    queryBuilder.addOrderBy('banner.sortOrder', 'ASC');
    queryBuilder.addOrderBy('banner.createdAt', 'DESC');

    // 分頁
    queryBuilder.skip(skip);
    queryBuilder.take(take);

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }

  /**
   * 獲取公開 Banner 列表（前台用）
   */
  async findPublic(position?: BannerPosition): Promise<Banner[]> {
    const queryBuilder = this.bannersRepository.createQueryBuilder('banner');

    const now = new Date();

    queryBuilder.where('banner.isActive = true');
    queryBuilder.andWhere(
      '(banner.startDate IS NULL OR banner.startDate <= :now)',
      { now },
    );
    queryBuilder.andWhere('(banner.endDate IS NULL OR banner.endDate > :now)', {
      now,
    });

    if (position) {
      queryBuilder.andWhere('banner.position = :position', { position });
    }

    queryBuilder.orderBy('banner.position', 'ASC');
    queryBuilder.addOrderBy('banner.sortOrder', 'ASC');

    return await queryBuilder.getMany();
  }

  /**
   * 根據 ID 獲取單個 Banner
   */
  async findOne(id: string): Promise<Banner> {
    const banner = await this.bannersRepository.findOne({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException(`找不到 ID 為 ${id} 的 Banner`);
    }

    return banner;
  }

  /**
   * 更新 Banner
   */
  async update(id: string, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.findOne(id);

    // 檢查日期邏輯
    const startDate = updateBannerDto.startDate
      ? new Date(updateBannerDto.startDate)
      : banner.startDate;
    const endDate = updateBannerDto.endDate
      ? new Date(updateBannerDto.endDate)
      : banner.endDate;

    if (startDate && endDate && startDate >= endDate) {
      throw new BadRequestException('結束日期必須晚於開始日期');
    }

    try {
      const updateData = {
        ...updateBannerDto,
        startDate: updateBannerDto.startDate
          ? new Date(updateBannerDto.startDate)
          : undefined,
        endDate: updateBannerDto.endDate
          ? new Date(updateBannerDto.endDate)
          : undefined,
      };

      await this.bannersRepository.update(id, updateData);
      return await this.findOne(id);
    } catch (error) {
      throw new BadRequestException('更新 Banner 失敗：' + error.message);
    }
  }

  /**
   * 刪除 Banner
   */
  async remove(id: string): Promise<void> {
    const banner = await this.findOne(id);
    await this.bannersRepository.remove(banner);
  }

  /**
   * 切換 Banner 啟用狀態
   */
  async toggleActive(id: string): Promise<Banner> {
    const banner = await this.findOne(id);
    banner.isActive = !banner.isActive;
    return await this.bannersRepository.save(banner);
  }

  /**
   * 更新排序
   */
  async updateSortOrder(id: string, newSortOrder: number): Promise<Banner> {
    const banner = await this.findOne(id);
    banner.sortOrder = newSortOrder;
    return await this.bannersRepository.save(banner);
  }

  /**
   * 批量更新排序
   */
  async updateBatchSortOrder(
    updates: { id: string; sortOrder: number }[],
  ): Promise<Banner[]> {
    const results = [];

    for (const update of updates) {
      const banner = await this.findOne(update.id);
      banner.sortOrder = update.sortOrder;
      results.push(await this.bannersRepository.save(banner));
    }

    return results;
  }
}
