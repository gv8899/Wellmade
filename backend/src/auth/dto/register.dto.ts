import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '請輸入有效的電子郵件地址' })
  @IsNotEmpty({ message: '電子郵件不能為空' })
  email: string;

  @IsNotEmpty({ message: '密碼不能為空' })
  @IsString({ message: '密碼必須是字串' })
  @MinLength(6, { message: '密碼至少需要6個字符' })
  password: string;
}
