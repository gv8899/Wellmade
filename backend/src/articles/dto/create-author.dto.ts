import {
  IsString,
  IsOptional,
  IsEmail,
  IsUUID,
  IsObject,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SocialLinks } from '../entities/author.entity';

export class CreateAuthorDto {
  @IsString()
  @MinLength(1, { message: '姓名不能為空' })
  @MaxLength(100, { message: '姓名長度不能超過100字符' })
  name: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '頭像URL長度不能超過500字符' })
  avatar?: string;

  @IsOptional()
  @IsEmail({}, { message: '請輸入有效的電子郵件地址' })
  @MaxLength(100, { message: '電子郵件長度不能超過100字符' })
  email?: string;

  @IsOptional()
  @IsObject()
  socialLinks?: SocialLinks;

  @IsOptional()
  @IsUUID('4', { message: '用戶ID格式不正確' })
  userId?: string;
}
