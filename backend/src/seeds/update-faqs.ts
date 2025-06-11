import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Product, FAQItem } from '../products/product.entity';

// 載入環境變數
config();

// 建立資料源連接
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
});

// 更新產品的 faqs
const updateFAQs = async () => {
  try {
    // 初始化資料庫連接
    await AppDataSource.initialize();
    console.log('資料庫連接已建立');
    
    const productRepository = AppDataSource.getRepository(Product);
    
    // 獲取所有產品
    const products = await productRepository.find();
    
    if (products.length === 0) {
      console.log('沒有找到產品資料');
      return;
    }
    
    console.log(`找到 ${products.length} 個產品，開始更新 faqs...`);
    
    // 常見問題範本
    const commonFAQTemplates = [
      {
        question: '這個產品有保固嗎？',
        answer: '是的，我們提供一年的標準保固，涵蓋材料和製造缺陷。您也可以選擇購買延長保固計劃。'
      },
      {
        question: '如何正確清潔和保養這個產品？',
        answer: '建議使用溫和的清潔劑和軟布進行清潔，避免使用研磨性清潔工具。詳細的保養指南可以在產品手冊中找到。'
      },
      {
        question: '產品尺寸是多少？',
        answer: '產品的具體尺寸請參考產品規格表。如果您有特殊需求，也可以聯繫我們的客服人員獲取更詳細的資訊。'
      },
      {
        question: '可以退貨嗎？',
        answer: '是的，我們提供30天無條件退貨服務。產品必須保持原始狀態，並附帶所有包裝和配件。'
      },
      {
        question: '運送需要多長時間？',
        answer: '一般情況下，國內訂單會在1-3個工作日內發貨，配送時間約為3-5個工作日。國際訂單可能需要7-14個工作日。'
      }
    ];
    
    // 特定類別的問題
    const categorySpecificFAQs = {
      '廚房用品': [
        {
          question: '這個廚具適合洗碗機清洗嗎？',
          answer: '大部分我們的廚具都是洗碗機安全的，但請查看產品標籤上的具體說明。某些特殊材質或設計可能需要手洗。'
        },
        {
          question: '這個廚具可以用於電磁爐嗎？',
          answer: '是的，我們的大多數廚具都適用於各種爐具，包括電磁爐。產品描述中會標明兼容的爐具類型。'
        }
      ],
      '浴室用品': [
        {
          question: '這個產品防水嗎？',
          answer: '我們的浴室用品都有一定程度的防水設計，但防水等級可能有所不同。請參考產品規格中的防水等級說明。'
        },
        {
          question: '如何安裝這個浴室配件？',
          answer: '大多數浴室配件都附帶詳細的安裝說明。一般來說，您只需要基本的工具就可以完成安裝。如有困難，也可以聯繫專業安裝服務。'
        }
      ],
      '臥室用品': [
        {
          question: '這個床上用品是什麼材質的？',
          answer: '我們的床上用品使用多種高品質材料，包括棉、麻、絲綢等。具體材質請參考產品描述或標籤。'
        },
        {
          question: '這個床上用品可以機洗嗎？',
          answer: '大多數床上用品都可以機洗，但請按照產品標籤上的洗滌說明操作，以確保產品的壽命和品質。'
        }
      ],
      '客廳用品': [
        {
          question: '這個家具需要自己組裝嗎？',
          answer: '部分家具需要簡單組裝，我們會提供所有必要的工具和詳細的組裝說明。大型家具可能提供專業組裝服務，詳情請諮詢客服。'
        },
        {
          question: '這個家具的承重能力是多少？',
          answer: '不同家具的承重能力各不相同，請參考產品規格中的承重參數。超過承重限制可能會損壞產品並造成安全隱患。'
        }
      ],
      '辦公用品': [
        {
          question: '這個辦公椅可以調節高度嗎？',
          answer: '是的，我們的大多數辦公椅都提供高度調節功能，部分型號還有其他調節選項，如扶手高度、靠背角度等。'
        },
        {
          question: '這個辦公桌有線材管理系統嗎？',
          answer: '部分辦公桌型號配備了線材管理系統，幫助整理和隱藏電線。具體功能請參考產品描述或諮詢客服。'
        }
      ]
    };
    
    // 為每個產品更新 faqs
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // 跳過已經有 faqs 的產品
      if (product.faqs && product.faqs.length > 0) {
        console.log(`產品 ${product.id} 已有 faqs，跳過`);
        continue;
      }
      
      // 準備 FAQ 列表
      let productFAQs: FAQItem[] = [];
      
      // 添加2-3個通用問題
      const commonFAQCount = Math.floor(Math.random() * 2) + 2; // 2-3個
      const shuffledCommonFAQs = [...commonFAQTemplates].sort(() => 0.5 - Math.random());
      productFAQs = productFAQs.concat(shuffledCommonFAQs.slice(0, commonFAQCount));
      
      // 添加1-2個類別特定問題（如果有）
      if (categorySpecificFAQs[product.category]) {
        const categoryFAQCount = Math.floor(Math.random() * 2) + 1; // 1-2個
        const shuffledCategoryFAQs = [...categorySpecificFAQs[product.category]].sort(() => 0.5 - Math.random());
        productFAQs = productFAQs.concat(shuffledCategoryFAQs.slice(0, categoryFAQCount));
      }
      
      // 添加1個產品特定問題
      productFAQs.push({
        question: `${product.name}的使用壽命有多長？`,
        answer: `在正常使用和適當保養的情況下，${product.name}的使用壽命通常可達3-5年。我們的產品都經過嚴格的品質測試，確保耐用性和可靠性。`
      });
      
      // 隨機排序最終的FAQ列表
      productFAQs = productFAQs.sort(() => 0.5 - Math.random());
      
      // 更新產品的faqs欄位
      product.faqs = productFAQs;
      
      // 儲存更新後的產品
      await productRepository.save(product);
      console.log(`已更新產品 ${product.id} 的 faqs，添加了 ${productFAQs.length} 個問答`);
    }
    
    console.log('所有產品的 faqs 更新完成');
  } catch (error) {
    console.error('更新 faqs 時出錯:', error);
  } finally {
    // 關閉資料庫連接
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('資料庫連接已關閉');
    }
  }
};

// 執行更新
updateFAQs();
