import React from 'react';
import { PriceRange, formatPriceRange } from '@/types/product';

interface ProductPriceDisplayProps {
  priceRange: PriceRange;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  showCurrency?: boolean;
  className?: string;
}

export default function ProductPriceDisplay({ 
  priceRange, 
  originalPrice,
  size = 'md',
  showCurrency = true,
  className = ''
}: ProductPriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  const formatPrice = (price: number) => {
    return showCurrency ? `$${price.toLocaleString()}` : price.toLocaleString();
  };

  const renderPriceRange = () => {
    if ('price' in priceRange) {
      return (
        <span className={`font-bold text-gray-900 ${sizeClasses[size]}`}>
          {formatPrice(priceRange.price)}
        </span>
      );
    } else {
      return (
        <span className={`font-bold text-gray-900 ${sizeClasses[size]}`}>
          {formatPrice(priceRange.minPrice)} - {formatPrice(priceRange.maxPrice)}
        </span>
      );
    }
  };

  const showDiscount = originalPrice && 'price' in priceRange && originalPrice > priceRange.price;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {renderPriceRange()}
      
      {showDiscount && (
        <span className={`line-through text-gray-500 ${size === 'lg' ? 'text-lg' : size === 'md' ? 'text-base' : 'text-sm'}`}>
          {formatPrice(originalPrice)}
        </span>
      )}
      
      {showDiscount && (
        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
          省 {formatPrice(originalPrice - ('price' in priceRange ? priceRange.price : priceRange.minPrice))}
        </span>
      )}
    </div>
  );
}