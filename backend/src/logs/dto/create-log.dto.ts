import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateLogDto {
  @IsString()
  level: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  context?: any;

  @IsOptional()
  @IsString()
  error_stack?: string;

  @IsOptional()
  @IsNumber()
  user_id?: number;

  @IsString()
  session_id: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  user_agent?: string;
}
