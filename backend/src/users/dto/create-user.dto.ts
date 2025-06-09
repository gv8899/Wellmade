import { IsEmail, IsString, MinLength, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { UserRole } from '../user.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true, message: '每個角色都必須是有效的用戶角色' })
  roles?: UserRole[];
}
