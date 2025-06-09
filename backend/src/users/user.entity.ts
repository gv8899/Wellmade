import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user.enum';

@Entity('users') // 指定資料表名稱為 'users'
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  @IsNotEmpty({ message: '用戶名不能為空' })
  @MinLength(3, { message: '用戶名至少需要3個字符' })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @IsNotEmpty({ message: '密碼不能為空' })
  @MinLength(6, { message: '密碼至少需要6個字符' })
  password: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  @IsEmail({}, { message: '請輸入有效的電子郵件地址' })
  @IsNotEmpty({ message: '電子郵件不能為空' })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.USER],
  })
  roles: UserRole[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 在插入前雜湊密碼
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  // 驗證密碼
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
