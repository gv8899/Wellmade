import React from 'react';
import { ProductVariant, InventoryType, getAvailableStock } from '@/types/product';

interface PreorderInfoProps {
  variant: ProductVariant;
  className?: string;
}

export default function PreorderInfo({ variant, className = '' }: PreorderInfoProps) {
  if (variant.inventoryType === InventoryType.PHYSICAL) {
    return null;
  }

  const availableStock = getAvailableStock(variant);
  const isUnlimited = variant.inventoryType === InventoryType.PREORDER_UNLIMITED;
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isPreorderActive = () => {
    const now = new Date();
    if (variant.preorderStartTime && now < new Date(variant.preorderStartTime)) {
      return false;
    }
    if (variant.preorderEndTime && now > new Date(variant.preorderEndTime)) {
      return false;
    }
    return true;
  };

  const getPreorderStatus = () => {
    const now = new Date();
    
    if (variant.preorderStartTime && now < new Date(variant.preorderStartTime)) {
      return {
        text: `預購將於 ${formatDate(variant.preorderStartTime)} 開始`,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      };
    }
    
    if (variant.preorderEndTime && now > new Date(variant.preorderEndTime)) {
      return {
        text: '預購已結束',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      };
    }
    
    return {
      text: '預購進行中',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    };
  };

  const preorderStatus = getPreorderStatus();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 預購狀態 */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${preorderStatus.color} ${preorderStatus.bgColor}`}>
        📅 {preorderStatus.text}
      </div>

      {/* 預購信息 */}
      <div className="space-y-2 text-sm text-gray-600">
        {/* 可預購數量 */}
        <div className="flex items-center justify-between">
          <span>可預購數量：</span>
          <span className="font-medium">
            {isUnlimited ? '不限量' : `${availableStock} 件`}
          </span>
        </div>

        {/* 已預購數量 */}
        {!isUnlimited && variant.preorderLimit && (
          <div className="flex items-center justify-between">
            <span>已預購：</span>
            <span className="font-medium">
              {variant.preorderSold} / {variant.preorderLimit} 件
            </span>
          </div>
        )}

        {/* 預購進度條 */}
        {!isUnlimited && variant.preorderLimit && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((variant.preorderSold / variant.preorderLimit) * 100, 100)}%` 
              }}
            />
          </div>
        )}

        {/* 預購時間範圍 */}
        {(variant.preorderStartTime || variant.preorderEndTime) && (
          <div className="space-y-1">
            {variant.preorderStartTime && (
              <div className="flex items-center justify-between">
                <span>預購開始：</span>
                <span className="font-medium">{formatDate(variant.preorderStartTime)}</span>
              </div>
            )}
            {variant.preorderEndTime && (
              <div className="flex items-center justify-between">
                <span>預購結束：</span>
                <span className="font-medium">{formatDate(variant.preorderEndTime)}</span>
              </div>
            )}
          </div>
        )}

        {/* 預計出貨日期 */}
        {variant.expectedShipDate && (
          <div className="flex items-center justify-between">
            <span>預計出貨：</span>
            <span className="font-medium text-green-600">
              {formatDate(variant.expectedShipDate)}
            </span>
          </div>
        )}

        {/* 預購描述 */}
        {variant.preorderDescription && (
          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
            <p className="text-blue-800 text-sm">
              {variant.preorderDescription}
            </p>
          </div>
        )}

        {/* 預購價格說明 */}
        {variant.preorderPrice && variant.preorderPrice !== variant.price && (
          <div className="bg-green-50 p-2 rounded-lg">
            <p className="text-green-800 text-sm">
              💰 預購特價：省 ${(variant.price - variant.preorderPrice).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}