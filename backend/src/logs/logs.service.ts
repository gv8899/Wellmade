import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FrontendLog } from './frontend-log.entity';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(FrontendLog)
    private frontendLogRepository: Repository<FrontendLog>,
  ) {}

  async create(createLogDto: CreateLogDto): Promise<FrontendLog> {
    const log = this.frontendLogRepository.create({
      ...createLogDto,
      timestamp: new Date(),
    });
    return this.frontendLogRepository.save(log);
  }

  async findAll(
    level?: string,
    limit = 50,
    page = 1,
  ): Promise<{
    logs: FrontendLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.frontendLogRepository.createQueryBuilder('log');

    if (level) {
      queryBuilder.where('log.level = :level', { level });
    }

    const [logs, total] = await queryBuilder
      .orderBy('log.timestamp', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit)
      .getManyAndCount();

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
