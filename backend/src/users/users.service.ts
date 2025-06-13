import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRole } from './user.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUserByUsername = await this.findOneByUsername(createUserDto.username);
    if (existingUserByUsername) {
      throw new ConflictException('已經有註冊過囉！');
    }
    const existingUserByEmail = await this.findOneByEmail(createUserDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('已經有註冊過囉！');
    }

    // If roles are not provided, default to [UserRole.USER]
    const user = this.usersRepository.create({
      ...createUserDto,
      roles: createUserDto.roles || [UserRole.USER],
    });

    return this.usersRepository.save(user);
  }
  
  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}
