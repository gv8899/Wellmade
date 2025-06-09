import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// 繼承 CreateProductDto，但所有欄位都是可選的
export class UpdateProductDto extends PartialType(CreateProductDto) {}
