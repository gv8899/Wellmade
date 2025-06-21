import { Product } from '../product.entity';
import { ProductStatus } from '../enums/product-status.enum';

export interface EnhancedProduct extends Omit<Product, 'getOverallStatus' | 'getAvailableVariants' | 'getMinPrice' | 'getMaxPrice'> {
  overallStatus: ProductStatus;
  priceRange: { price: number } | { minPrice: number; maxPrice: number };
  availableVariantsCount: number;
}