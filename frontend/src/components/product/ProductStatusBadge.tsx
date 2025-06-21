import React from 'react';
import { ProductStatus, PRODUCT_STATUS_CONFIG } from '@/types/product';

interface ProductStatusBadgeProps {
  status: ProductStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export default function ProductStatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true,
  className = ''
}: ProductStatusBadgeProps) {
  const config = PRODUCT_STATUS_CONFIG[status];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${config.bgColor} ${config.textColor} ${sizeClasses[size]}
        ${className}
      `}
      title={config.description}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}