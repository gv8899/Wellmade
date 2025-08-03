/**
 * 價格格式化工具函數
 * 統一處理應用中所有價格顯示格式
 */

/**
 * 格式化價格為帶千分位逗號的字串
 * @param price - 價格數值 (可以是 number 或 string)
 * @param options - 格式化選項
 * @returns 格式化後的價格字串
 * 
 * @example
 * formatPrice(1234) // "1,234"
 * formatPrice(1234.56) // "1,235" (默認四捨五入到整數)
 * formatPrice("1234.50", { showDecimals: true }) // "1,234.50"
 * formatPrice(0) // "0"
 */
export function formatPrice(
  price: number | string | null | undefined,
  options: {
    showDecimals?: boolean;
    decimalPlaces?: number;
    prefix?: string;
    suffix?: string;
  } = {}
): string {
  const {
    showDecimals = false,
    decimalPlaces = 0,
    prefix = '',
    suffix = ''
  } = options;

  // 處理無效輸入
  if (price === null || price === undefined || price === '') {
    return `${prefix}0${suffix}`;
  }

  // 轉換為數字
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // 檢查是否為有效數字
  if (isNaN(numPrice)) {
    return `${prefix}0${suffix}`;
  }

  // 決定小數位數
  const finalDecimalPlaces = showDecimals ? decimalPlaces : 0;
  
  // 格式化數字
  const formatted = numPrice.toLocaleString('zh-TW', {
    minimumFractionDigits: finalDecimalPlaces,
    maximumFractionDigits: finalDecimalPlaces
  });

  return `${prefix}${formatted}${suffix}`;
}

/**
 * 格式化為台幣顯示格式
 * @param price - 價格數值
 * @param showDecimals - 是否顯示小數位
 * @returns "NT$ X,XXX" 格式的字串
 * 
 * @example
 * formatTWD(1234) // "NT$ 1,234"
 * formatTWD(1234.56, true) // "NT$ 1,234.56"
 */
export function formatTWD(
  price: number | string | null | undefined,
  showDecimals: boolean = false
): string {
  return formatPrice(price, {
    showDecimals,
    decimalPlaces: showDecimals ? 2 : 0,
    prefix: 'NT$ '
  });
}

/**
 * 格式化金額範圍顯示
 * @param minPrice - 最低價格
 * @param maxPrice - 最高價格
 * @returns "NT$ X,XXX - X,XXX" 或 "NT$ X,XXX" 格式
 * 
 * @example
 * formatPriceRange(100, 200) // "NT$ 100 - 200"
 * formatPriceRange(100, 100) // "NT$ 100"
 * formatPriceRange(null, 200) // "NT$ 200"
 */
export function formatPriceRange(
  minPrice: number | string | null | undefined,
  maxPrice: number | string | null | undefined
): string {
  const min = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
  const max = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;

  // 只有最高價格
  if (!min || isNaN(min)) {
    return formatTWD(max);
  }

  // 只有最低價格
  if (!max || isNaN(max)) {
    return formatTWD(min);
  }

  // 價格相同
  if (min === max) {
    return formatTWD(min);
  }

  // 價格範圍
  return `NT$ ${formatPrice(min)} - ${formatPrice(max)}`;
}

/**
 * 計算並格式化小計 (數量 × 單價)
 * @param price - 單價
 * @param quantity - 數量
 * @returns 格式化後的小計金額
 * 
 * @example
 * formatSubtotal(100, 3) // "NT$ 300"
 * formatSubtotal("99.99", 2) // "NT$ 200"
 */
export function formatSubtotal(
  price: number | string | null | undefined,
  quantity: number | string | null | undefined
): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : (price || 0);
  const numQuantity = typeof quantity === 'string' ? parseInt(quantity) : (quantity || 0);
  
  const subtotal = numPrice * numQuantity;
  return formatTWD(subtotal);
}

/**
 * 僅格式化數字（不含貨幣符號）
 * @param price - 價格數值
 * @returns 帶千分位逗號的純數字字串
 * 
 * @example
 * formatNumber(1234) // "1,234"
 * formatNumber(1234.56) // "1,235"
 */
export function formatNumber(price: number | string | null | undefined): string {
  return formatPrice(price);
}

/**
 * 格式化為簡化美元顯示格式（購物車專用）
 * @param price - 價格數值
 * @param showDecimals - 是否顯示小數位
 * @returns "$X,XXX" 格式的字串
 * 
 * @example
 * formatSimpleDollar(1234) // "$1,234"
 * formatSimpleDollar(1234.56, true) // "$1,234.56"
 */
export function formatSimpleDollar(
  price: number | string | null | undefined,
  showDecimals: boolean = false
): string {
  return formatPrice(price, {
    showDecimals,
    decimalPlaces: showDecimals ? 2 : 0,
    prefix: '$'
  });
}