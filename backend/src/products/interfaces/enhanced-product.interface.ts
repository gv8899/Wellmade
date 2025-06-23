import { Product } from '../product.entity';
import { ProductStatus } from '../enums/product-status.enum';

export interface EnhancedProduct extends Omit<Product, 'getOverallStatus' | 'getAvailableVariants' | 'getMinPrice' | 'getMaxPrice' | 'getSkus' | 'hasValidSku' | 'isSimpleProduct'> {
  overallStatus: ProductStatus;
  priceRange: { price: number } | { minPrice: number; maxPrice: number };
  availableVariantsCount: number;
}