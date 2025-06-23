import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../product-variant.entity';
import { Product } from '../product.entity';
import { Brand } from '../../brands/brand.entity';
import { Category } from '../../categories/category.entity';

@Injectable()
export class SkuGenerationService {
  constructor(
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
  ) {}

  // SKU 格式配置
  private readonly skuFormat = {
    brandLength: 3,
    categoryLength: 3,
    productIdLength: 4,
    separator: '-',
  };

  // 規格代碼映射表
  private readonly specCodeMap: Record<string, Record<string, string>> = {
    顏色: {
      白色: 'WH',
      黑色: 'BK',
      紅色: 'RD',
      藍色: 'BL',
      綠色: 'GR',
      黃色: 'YE',
      灰色: 'GY',
      銀色: 'SV',
      金色: 'GD',
      粉色: 'PK',
      紫色: 'PP',
      橙色: 'OR',
      棕色: 'BR',
      米色: 'BE',
    },
    尺寸: {
      'XS': 'XS',
      'S': 'S',
      'M': 'M',
      'L': 'L',
      'XL': 'XL',
      'XXL': '2XL',
      'XXXL': '3XL',
      '小': 'S',
      '中': 'M',
      '大': 'L',
      '特大': 'XL',
      '迷你': 'XS',
    },
    材質: {
      不鏽鋼: 'SS',
      塑膠: 'PL',
      塑料: 'PL',
      木質: 'WD',
      木頭: 'WD',
      陶瓷: 'CR',
      玻璃: 'GL',
      矽膠: 'SI',
      棉質: 'CT',
      聚酯纖維: 'PF',
      皮革: 'LT',
      合成皮: 'SL',
      鋁合金: 'AL',
      銅: 'CU',
      鐵: 'IR',
    },
    容量: {
      '100ml': '100',
      '200ml': '200',
      '250ml': '250',
      '300ml': '300',
      '350ml': '350',
      '400ml': '400',
      '500ml': '500',
      '600ml': '600',
      '700ml': '700',
      '750ml': '750',
      '800ml': '800',
      '900ml': '900',
      '1000ml': '1L',
      '1L': '1L',
      '1.5L': '15L',
      '2L': '2L',
    },
  };

  /**
   * 生成 SKU
   * @param product 產品資訊（包含品牌和分類）
   * @param specs 變體規格
   * @returns 生成的 SKU
   */
  async generateSku(
    product: Product & { brand?: Brand; categoryRelation?: Category },
    specs?: Record<string, string>,
  ): Promise<string> {
    const parts: string[] = [];

    // 1. 品牌前綴
    const brandPrefix = this.getBrandPrefix(product.brand);
    parts.push(brandPrefix);

    // 2. 分類代碼
    const categoryCode = this.getCategoryCode(product.categoryRelation);
    parts.push(categoryCode);

    // 3. 產品ID簡碼
    const productCode = this.getProductCode(product.id);
    parts.push(productCode);

    // 4. 規格代碼
    if (specs && Object.keys(specs).length > 0) {
      const specCode = this.getSpecCode(specs);
      if (specCode) {
        parts.push(specCode);
      }
    }

    // 組合基礎 SKU
    let baseSku = parts.join(this.skuFormat.separator);

    // 確保 SKU 唯一性
    const uniqueSku = await this.ensureUniqueSku(baseSku, product.id);
    
    return uniqueSku;
  }

  /**
   * 生成品牌前綴
   */
  private getBrandPrefix(brand?: Brand): string {
    if (!brand || !brand.name) {
      return 'GEN'; // Generic 通用
    }

    // 移除非字母字符，轉大寫
    const cleanName = brand.name.replace(/[^A-Za-z]/g, '').toUpperCase();
    
    // 如果品牌名稱很短，直接使用
    if (cleanName.length <= this.skuFormat.brandLength) {
      return cleanName;
    }

    // 如果品牌名稱較長，取前幾個字母
    return cleanName.substring(0, this.skuFormat.brandLength);
  }

  /**
   * 生成分類代碼
   */
  private getCategoryCode(category?: Category): string {
    if (!category || !category.name) {
      return 'GEN'; // General 一般
    }

    const categoryName = category.name.toLowerCase();
    
    // 預定義的分類代碼映射
    const categoryCodeMap: Record<string, string> = {
      '廚房': 'KCH',
      '廚房用品': 'KCH',
      '浴室': 'BTH',
      '浴室用品': 'BTH',
      '臥室': 'BED',
      '臥室用品': 'BED',
      '客廳': 'LIV',
      '客廳用品': 'LIV',
      '辦公': 'OFC',
      '辦公用品': 'OFC',
      '戶外': 'OUT',
      '戶外用品': 'OUT',
      '收納': 'STG',
      '收納用品': 'STG',
      '清潔': 'CLN',
      '清潔用品': 'CLN',
      '餐具': 'DIN',
      '餐廚': 'DIN',
      '家電': 'APP',
      '小家電': 'APP',
      '裝飾': 'DEC',
      '家飾': 'DEC',
      '寢具': 'BED',
      '服飾': 'CLO',
      '配件': 'ACC',
    };

    // 尋找匹配的分類代碼
    for (const [key, code] of Object.entries(categoryCodeMap)) {
      if (categoryName.includes(key)) {
        return code;
      }
    }

    // 如果沒有匹配，生成一個基於分類名稱的代碼
    const words = category.name.split(/[\s-_]+/);
    if (words.length >= 2) {
      // 多個單詞，取每個單詞的首字母
      return words
        .slice(0, 3)
        .map(w => w.charAt(0).toUpperCase())
        .join('');
    } else {
      // 單個單詞，取前三個字母
      return category.name
        .replace(/[^A-Za-z]/g, '')
        .toUpperCase()
        .substring(0, this.skuFormat.categoryLength)
        .padEnd(this.skuFormat.categoryLength, 'X');
    }
  }

  /**
   * 生成產品代碼
   */
  private getProductCode(productId: string): string {
    // 使用產品 ID 的前8個字符，移除連字符
    const cleanId = productId.replace(/-/g, '').toUpperCase();
    return cleanId.substring(0, this.skuFormat.productIdLength);
  }

  /**
   * 生成規格代碼
   */
  private getSpecCode(specs: Record<string, string>): string {
    const codes: string[] = [];
    
    // 定義規格的優先順序
    const specOrder = ['顏色', '尺寸', '容量', '材質'];
    
    // 按照優先順序處理規格
    for (const specType of specOrder) {
      const specValue = specs[specType];
      if (specValue && this.specCodeMap[specType]) {
        const code = this.specCodeMap[specType][specValue];
        if (code) {
          codes.push(code);
        } else {
          // 如果沒有預定義的代碼，生成一個
          codes.push(this.generateSpecCode(specValue));
        }
      }
    }

    // 處理其他未在優先順序中的規格
    for (const [key, value] of Object.entries(specs)) {
      if (!specOrder.includes(key) && value) {
        codes.push(this.generateSpecCode(value));
      }
    }

    return codes.join('');
  }

  /**
   * 為未定義的規格值生成代碼
   */
  private generateSpecCode(value: string): string {
    // 嘗試提取數字
    const numbers = value.match(/\d+/);
    if (numbers) {
      return numbers[0].substring(0, 3);
    }

    // 否則取前兩個字符
    return value
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase()
      .substring(0, 2)
      .padEnd(2, 'X');
  }

  /**
   * 確保 SKU 的全域唯一性
   */
  private async ensureUniqueSku(baseSku: string, productId: string): Promise<string> {
    let sku = baseSku;
    let counter = 0;

    while (true) {
      // 檢查 SKU 是否已存在（全域檢查，不允許任何重複）
      const existing = await this.variantRepository.findOne({
        where: { sku },
      });

      // 如果不存在，則可以使用
      if (!existing) {
        return sku;
      }

      // 如果存在，無論是否同一產品都需要添加後綴確保唯一性
      counter++;
      
      // 使用時間戳和計數器確保更高的唯一性
      const timestamp = Date.now().toString().slice(-3);
      sku = `${baseSku}${this.skuFormat.separator}${counter.toString().padStart(2, '0')}${timestamp}`;
    }
  }

  /**
   * 批量檢查 SKU 是否存在
   */
  async checkSkuExists(skus: string[]): Promise<Record<string, boolean>> {
    const existingVariants = await this.variantRepository
      .createQueryBuilder('variant')
      .where('variant.sku IN (:...skus)', { skus })
      .select(['variant.sku'])
      .getMany();

    const existingSkus = new Set(existingVariants.map(v => v.sku));
    
    return skus.reduce((acc, sku) => {
      acc[sku] = existingSkus.has(sku);
      return acc;
    }, {} as Record<string, boolean>);
  }

  /**
   * 預覽 SKU 生成結果（不保存到資料庫）
   */
  async previewSku(
    product: Product & { brand?: Brand; categoryRelation?: Category },
    specs?: Record<string, string>,
  ): Promise<string> {
    const parts: string[] = [];

    // 1. 品牌前綴
    const brandPrefix = this.getBrandPrefix(product.brand);
    parts.push(brandPrefix);

    // 2. 分類代碼
    const categoryCode = this.getCategoryCode(product.categoryRelation);
    parts.push(categoryCode);

    // 3. 產品ID簡碼（如果是新產品，使用臨時代碼）
    const productCode = product.id 
      ? this.getProductCode(product.id)
      : 'XXXX';
    parts.push(productCode);

    // 4. 規格代碼
    if (specs && Object.keys(specs).length > 0) {
      const specCode = this.getSpecCode(specs);
      if (specCode) {
        parts.push(specCode);
      }
    }

    return parts.join(this.skuFormat.separator);
  }
}