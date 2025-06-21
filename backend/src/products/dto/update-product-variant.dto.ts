import { PartialType } from '@nestjs/mapped-types';
import { CreateProductVariantDto } from './create-product-variant.dto';

export class UpdateProductVariantDto extends PartialType(CreateProductVariantDto) {
  // 繼承所有 CreateProductVariantDto 的屬性，但都是可選的
}