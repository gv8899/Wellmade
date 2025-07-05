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

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) {
      return showCurrency ? '$0' : '0';
    }
    // 移除小數點，確保顯示整數
    const integerPrice = Math.round(price);
    return showCurrency ? `$${integerPrice.toLocaleString()}` : integerPrice.toLocaleString();
  };

  const renderPriceRange = () => {
    if ('price' in priceRange) {
      // 容器產品可能沒有固定價格
      if (priceRange.price === null || priceRange.price === undefined) {
        return (
          <span className={`font-bold text-gray-600 ${sizeClasses[size]}`}>
            請選擇規格
          </span>
        );
      }
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

  const showDiscount = originalPrice && 'price' in priceRange && priceRange.price !== null && priceRange.price !== undefined && originalPrice > priceRange.price;

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