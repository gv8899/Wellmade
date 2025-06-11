import { DataSource } from 'typeorm';
import { Product, FeatureDetail } from '../products/product.entity';
import { Brand } from '../brands/brand.entity';
import { v4 as uuidv4 } from 'uuid';

export const seedProducts = async (dataSource: DataSource, brands: any[] = []) => {
  const productRepository = dataSource.getRepository(Product);
  const brandRepository = dataSource.getRepository(Brand);
  
  // 先檢查資料庫是否已有資料
  const productCount = await productRepository.count();
  
  if (productCount > 0) {
    console.log('產品資料已存在，跳過填充');
    return;
  }
  
  // 確保有品牌資料
  let brandEntities = brands;
  if (!brandEntities || brandEntities.length === 0) {
    brandEntities = await brandRepository.find();
    if (brandEntities.length === 0) {
      console.log('無品牌資料，無法建立產品關聯');
      return;
    }
  }
  
  // 預設的產品分類
  const categories = ['廚房用品', '浴室用品', '臥室用品', '客廳用品', '辦公用品'];
  
  // 建立測試資料
  const products: Partial<Product>[] = [];
  
  // 生成15個測試產品
  for (let i = 1; i <= 15; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const randomBrand = brandEntities[Math.floor(Math.random() * brandEntities.length)];
    const price = Math.floor(Math.random() * 1000) + 100; // 100-1100 之間的價格
    const stock = Math.floor(Math.random() * 100) + 10; // 10-110 之間的庫存

    // 生成隨機關鍵特性
    const keyFeatures = [
      {
        image: `https://picsum.photos/seed/feature${i}1/500/300`,
        title: `特色功能 ${i}-1`,
        subtitle: `副標題 ${i}-1`,
        description: `這是產品 ${i} 的第一個關鍵特性描述，說明此功能如何解決用戶問題。`
      },
      {
        image: `https://picsum.photos/seed/feature${i}2/500/300`,
        title: `特色功能 ${i}-2`,
        subtitle: `副標題 ${i}-2`,
        description: `這是產品 ${i} 的第二個關鍵特性描述，展示了產品設計的巧思。`
      },
      {
        image: `https://picsum.photos/seed/feature${i}3/500/300`,
        title: `特色功能 ${i}-3`,
        description: `這是產品 ${i} 的第三個關鍵特性描述，強調了使用此產品的用戶體驗。`
      }
    ];
    
    // 生成隨機特性詳情
    const featureDetails: FeatureDetail[] = [
      {
        type: "image",
        src: `https://picsum.photos/seed/detail${i}1/600/400`,
        title: `產品特性 ${i}-1`,
        description: `這是產品 ${i} 的第一個詳細特性描述，詳細說明了產品的設計理念和使用方式。`,
        direction: "left"
      },
      {
        type: "image",
        src: `https://picsum.photos/seed/detail${i}2/600/400`,
        title: `產品特性 ${i}-2`,
        description: `這是產品 ${i} 的第二個詳細特性描述，展示了產品的獨特優勢和創新之處。`,
        direction: "right"
      },
      {
        type: "image",
        src: `https://picsum.photos/seed/detail${i}3/600/400`,
        title: `產品特性 ${i}-3`,
        description: `這是產品 ${i} 的第三個詳細特性描述，強調了產品的實用性和耐用性。`,
        direction: "left"
      }
    ];

    const product: Partial<Product> = {
      name: `測試產品 ${i}`,
      description: `這是一個測試產品的詳細描述，屬於${category}類別，提供多種功能和特性。`,
      price: price,
      stock: stock,
      category: category,
      brandId: randomBrand.id,
      imageUrl: `https://picsum.photos/seed/${i}/500/500`, // 使用隨機圖片
      images: [
        `https://picsum.photos/seed/${i}a/500/500`,
        `https://picsum.photos/seed/${i}b/500/500`,
        `https://picsum.photos/seed/${i}c/500/500`
      ],
      keyFeatures: keyFeatures,
      featureDetails: featureDetails,
      isActive: true,
    };
    
    products.push(product);
  }
  
  // 特定產品示例 (可以添加更多特色產品)
  const specialProducts: Partial<Product>[] = [
    {
      name: '多功能不鏽鋼菜刀',
      description: '高級不鏽鋼材質，多用途，適合各種食材切割，符合人體工學設計的手感，使用舒適。',
      price: 1299,
      stock: 50,
      category: '廚房用品',
      brandId: brandEntities.find(b => b.name === 'KitchenAid')?.id,
      imageUrl: 'https://picsum.photos/seed/knife/500/500',
      images: [
        'https://picsum.photos/seed/knife1/500/500',
        'https://picsum.photos/seed/knife2/500/500',
        'https://picsum.photos/seed/knife3/500/500'
      ],
      keyFeatures: [
        {
          image: 'https://picsum.photos/seed/knife-precision/500/300',
          title: '高精度切割',
          subtitle: '手工磨利刀刃',
          description: '金屬刀刃經過多重手工磨利處理，磨出專業高精度切割角度，讓切割更加輕鬆精準。'
        },
        {
          image: 'https://picsum.photos/seed/knife-material/500/300',
          title: '高級不鏽鋼',
          subtitle: '特注高硬性鋼',
          description: '刀具使用高級 7Cr17 不鏽鋼，保證刀刃長時防鏽、耐磨損、不影響食物味道。'
        },
        {
          image: 'https://picsum.photos/seed/knife-handle/500/300',
          title: '人體工學設計',
          description: '特別設計的手柄適合各種手型，完美重量平衡、握感舒適，長時間使用也不疲勞。'
        }
      ],
      featureDetails: [
        {
          type: "image",
          src: 'https://picsum.photos/seed/knife-detail1/600/400',
          title: '精準切割體驗',
          description: '刀刃採用特殊角度設計，切割時更加順暢，無論是切肉、切菜還是切水果，都能保持精準的切割線條，讓烹飪更加專業。',
          direction: "left"
        },
        {
          type: "image",
          src: 'https://picsum.photos/seed/knife-detail2/600/400',
          title: '特殊鋼材工藝',
          description: '採用德國進口特殊鋼材，經過多道熱處理工序，刀刃硬度達到HRC58度，保持鋒利的同時兼具韌性，不易崩刃。',
          direction: "right"
        },
        {
          type: "image",
          src: 'https://picsum.photos/seed/knife-detail3/600/400',
          title: '人體工學手柄',
          description: '手柄採用高級樹脂材料，經過人體工學設計，握感舒適，長時間使用不疲勞，同時防滑設計確保使用安全。',
          direction: "left"
        }
      ],
      isActive: true,
    },
    {
      name: '北歐風簡約書架',
      description: '採用環保木材製作，極簡設計風格，可調節層板高度，適合各種空間擺放。',
      price: 3499,
      stock: 30,
      category: '客廳用品',
      brandId: brandEntities.find(b => b.name === 'IKEA')?.id,
      imageUrl: 'https://picsum.photos/seed/shelf/500/500',
      images: [
        'https://picsum.photos/seed/shelf1/500/500',
        'https://picsum.photos/seed/shelf2/500/500',
        'https://picsum.photos/seed/shelf3/500/500'
      ],
      keyFeatures: [
        {
          image: 'https://picsum.photos/seed/shelf-wood/500/300',
          title: '環保木材質',
          subtitle: '可持續林場認證',
          description: '使用經FSC認證的可持續林場木材，材質堅固耐用，確保環保與品質兼具。'
        },
        {
          image: 'https://picsum.photos/seed/shelf-design/500/300',
          title: '現代北歐風格',
          subtitle: '極簡主義設計',
          description: '簡潔直線條趨勢設計，各種家居風格適用，不限時間和種空間。'
        },
        {
          image: 'https://picsum.photos/seed/shelf-adjust/500/300',
          title: '可調節層板',
          description: '書架層板高度可自由調節，適應不同高度的書籍和裝飾品，靈活運用空間。'
        }
      ],
      featureDetails: [
        {
          type: "image",
          src: 'https://picsum.photos/seed/shelf-detail1/600/400',
          title: '北歐設計美學',
          description: '採用北歐簡約設計風格，線條簡潔流暢，色彩柔和自然，為居家環境增添現代感與溫馨氛圍，適合各種裝修風格。',
          direction: "left"
        },
        {
          type: "image",
          src: 'https://picsum.photos/seed/shelf-detail2/600/400',
          title: '環保材質選擇',
          description: '全部採用FSC認證的可持續林場木材，不含有害物質，環保健康，同時具有優良的耐用性和穩定性，使用壽命長。',
          direction: "right"
        },
        {
          type: "video",
          src: 'https://example.com/videos/shelf-assembly.mp4',
          title: '簡易安裝示範',
          description: '創新的卡扣式設計，無需複雜工具即可輕鬆完成安裝，附帶詳細安裝說明書和視頻教學，讓您輕鬆搞定。',
          direction: "left"
        }
      ],
      isActive: true,
    },
    {
      name: '智能溫控馬克杯',
      description: '內建智能溫控系統，可保持飲料在最佳溫度，杯身採用高級別陶瓷隔熱層，安全舒適。',
      price: 890,
      stock: 100,
      category: '廚房用品',
      brandId: brandEntities.find(b => b.name === 'Philips')?.id,
      imageUrl: 'https://picsum.photos/seed/mug/500/500',
      images: [
        'https://picsum.photos/seed/mug1/500/500',
        'https://picsum.photos/seed/mug2/500/500',
        'https://picsum.photos/seed/mug3/500/500'
      ],
      keyFeatures: [
        {
          image: 'https://picsum.photos/seed/mug-temp/500/300',
          title: '智能溫控',
          subtitle: '自動溫度調節',
          description: '內置小型智能溫控芯片，可保持飲料在 60-85°C 的最佳飲用溫度，適合咖啡茶等。'
        },
        {
          image: 'https://picsum.photos/seed/mug-battery/500/300',
          title: '長效電池',
          subtitle: '智能節能模式',
          description: '針對不同用戶需求，開發了多種節能模式，最長可達 8 小時的使用時間，通勤到公司無憂杯。'
        },
        {
          image: 'https://picsum.photos/seed/mug-material/500/300',
          title: '高級別瓷器',
          description: '杯身多層高級別食品安全瓷器，隔熱不燙手材質，外部觸摸無燙傷，隔空。多彩五色可選。'
        }
      ],
      isActive: true,
    }
  ];
  
  // 合併所有產品
  const allProducts = [...products, ...specialProducts];
  
  try {
    // 插入產品數據
    await productRepository.save(allProducts);
    console.log(`成功填充 ${allProducts.length} 個產品數據`);
  } catch (error) {
    console.error('填充產品數據時發生錯誤：', error);
  }
};
